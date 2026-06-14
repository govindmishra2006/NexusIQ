from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Security, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import plotly.express as px
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi import Response
from weasyprint import HTML
from datetime import datetime
from fastapi.responses import StreamingResponse, RedirectResponse
import io
import hmac
import hashlib
import httpx
from security import encrypt_token
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from ingestion import sync_shopify_orders
from services.forecast import generate_30_day_forecast, cache

# ==========================================
# 1. ENVIRONMENT & SECURITY SETUP
# ==========================================
load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
# Using the Service Key to safely bypass Row Level Security for backend fetches
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise RuntimeError("🚨 Supabase environment variables are missing")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
security = HTTPBearer()

# THE GATEKEEPER: Verifies the JWT Token from React
def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid or Expired Token")
        return user_response.user
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication Failed: {str(e)}")

# ==========================================
# 2. BACKGROUND SCHEDULER
# ==========================================
scheduler = AsyncIOScheduler()

async def run_nightly_syncs():
    """Fetches all connected stores and runs the ingestion pipeline."""
    print("🌙 Running nightly Shopify syncs...")
    
    # 🚨 THE COROUTINE FIX: Awaiting the Supabase execute()
    connections = await supabase.table("shopify_connections").select("*").execute()
    
    for conn in connections.data:
        # Trigger the sync for each store
        await sync_shopify_orders(
            user_id=conn["user_id"],
            shop_domain=conn["shop_domain"],
            encrypted_token=conn["access_token_encrypted"]
        )

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs when the server starts
    scheduler.add_job(run_nightly_syncs, 'cron', hour=2, minute=0)
    scheduler.start()
    print("⏱️ APScheduler started. Nightly syncs locked in.")
    yield
    # This runs when the server shuts down
    scheduler.shutdown()

# ==========================================
# 3. AI & APP INITIALIZATION
# ==========================================
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

# Inject the lifespan hook so the scheduler boots with the app
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("charts", exist_ok=True)

# ==========================================
# 4. DATA MODELS
# ==========================================
class DatasetInfo(BaseModel):
    filename: str  # Required so the frontend doesn't crash the Pydantic check
    rows: int
    columns: int
    numerical_columns: list
    categorical_columns: list
    total_revenue: float = 0.0
    order_count: int = 0
    avg_order_value: float = 0.0
    anomaly_count: int = 0
    top_anomalous_skus: list = []

class PDFExportPayload(BaseModel):
    filename: str
    metrics: dict
    aiBrief: dict

class NarrationPayload(BaseModel):
    summary_text: str

# ==========================================
# 5. API ROUTES
# ==========================================
@app.get("/")
def home():
    return {"message": "Welcome to NexusIQ"}

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    # --- MATH ENGINE ---
    df = pd.read_csv(file.file)
    required_columns = ["Order ID", "Lineitem SKU", "Total", "Financial Status", "Created at"]

    missing_cols = [col for col in required_columns if col not in df.columns]

    if missing_cols:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid E-commerce schema. Missing required columns: {', '.join(missing_cols)}. Please upload a standard shopify Orders export"
        )

    df = df.drop_duplicates()
    df["Total"] = pd.to_numeric(df["Total"], errors="coerce")
    df = df.dropna(subset=["Total"])

    q1 = df["Total"].quantile(0.25)
    q3 = df["Total"].quantile(0.75)
    iqr = q3 - q1

    lower_fence = q1 - (1.5 * iqr)
    upper_fence = q3 + (1.5 * iqr)

    anomalies_df = df[(df["Total"] < lower_fence) | (df["Total"] > upper_fence)]
    anomaly_count = len(anomalies_df)
    top_anomalous_skus = []
    
    if anomaly_count > 0:
        top_anomalous_skus = anomalies_df["Lineitem SKU"].value_counts().head(5).index.tolist()
        print(f"⚙️ Math Engine: Detected {anomaly_count} revenue anomalies. Top suspect SKUs: {top_anomalous_skus}")

    total_revenue = df["Total"].sum()
    order_count = int(df["Total"].count())
    avg_order_value = float(df["Total"].mean()) if order_count > 0 else 0.0
    anomalous_records = anomalies_df.to_dict(orient="records")
    numerical_columns = list(df.select_dtypes(include=["number"]).columns)
    categorical_columns = list(df.select_dtypes(exclude=["number"]).columns)

    for col in numerical_columns:
        if df[col].isnull().any():
            df[col] = df[col].fillna(df[col].median())

    for col in categorical_columns:
        if df[col].isnull().any():
            df[col] = df[col].fillna("Unknown")

    missing_values = df.isnull().sum().to_dict()
    chart_data = []
    generated_charts = []
    
    if numerical_columns:
        first_column = numerical_columns[0]
        value_counts = df[first_column].value_counts().sort_index()
        for index, value in value_counts.items():
            chart_data.append({
                "name": str(index),
                "count": int(value)
            })
        
        fig = px.histogram(df, x=first_column, title=f"Distribution of {first_column}")
        chart_path = f"charts/{first_column}.html"
        fig.write_html(chart_path)
        generated_charts.append(chart_path)

    return {
        "filename": file.filename,
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": list(df.columns),
        "numerical_columns": numerical_columns,
        "categorical_columns": categorical_columns,
        "missing_values": missing_values, 
        "charts": generated_charts,
        "chart_data": chart_data,
        "status": "success",
        "metrics": {
            "total_revenue": round(total_revenue, 2),
            "order_count": order_count,
            "avg_order_value": round(avg_order_value, 2)
        },
        "anomalies": {
            "count": anomaly_count,
            "upper_fence": round(upper_fence, 2),
            "lower_fence": round(lower_fence, 2),
            "top_suspect_skus": top_anomalous_skus,
            "records": anomalous_records
        }
    }

# --- THE CONTEXTUAL AI BRIDGE & DELTA ENGINE ---
@app.post("/generate-insight")
async def generate_insight(info: DatasetInfo, current_user = Depends(get_current_user)):
    
    # 1. Fetch the user's Store DNA
    try:
        db_response = supabase.table("store_settings").select("dna").eq("user_id", current_user.id).execute()
        dna = db_response.data[0]['dna'] if db_response.data else {}
        store_name = dna.get('storeName', 'this Shopify store')
        target_aov = dna.get('targetAov', 'Not defined')
        target_rev = dna.get('targetRevenue', 'Not defined')
    except Exception as e:
        store_name = "this Shopify store"
        target_aov = "Not defined"
        target_rev = "Not defined"

    # 2. THE DELTA ENGINE: Fetch the previous upload to compare
    deltas = None
    try:
        # Grab the single most recent archive before the current one saves
        archive_response = supabase.table("brief_archives") \
            .select("dashboard_data") \
            .eq("user_id", current_user.id) \
            .order("created_at", desc=True) \
            .limit(1) \
            .execute()
        
        if archive_response.data:
            prev_metrics = archive_response.data[0]['dashboard_data'].get('metrics', {})
            
            # Safe math function to prevent division by zero crashes
            def calc_delta(new_val, old_val):
                if not old_val or old_val == 0: return 0.0
                return round(((new_val - old_val) / old_val) * 100, 1)

            deltas = {
                "revenue": calc_delta(info.total_revenue, prev_metrics.get("total_revenue", 0)),
                "orders": calc_delta(info.order_count, prev_metrics.get("order_count", 0)),
                "aov": calc_delta(info.avg_order_value, prev_metrics.get("avg_order_value", 0))
            }
            print(f"📈 DELTAS CALCULATED: {deltas}")
    except Exception as e:
        print(f"⚠️ Delta Engine bypassed (No previous history found): {e}")

    # 3. Prepare Scalable Data Payload
    clean_metrics = info.model_dump(exclude={"numerical_columns", "categorical_columns", "top_anomalous_skus", "filename"})
    anomalous_skus_str = ', '.join(info.top_anomalous_skus) if info.top_anomalous_skus else "None detected"
    
    # 4. Contextual Prompt Generation
    delta_context = ""
    if deltas:
        delta_context = f"""
        HISTORICAL DELTAS (Compared to their last upload):
        - Revenue: {deltas['revenue']}%
        - Orders: {deltas['orders']}%
        - AOV: {deltas['aov']}%
        
        CRITICAL: Your 'summary' MUST open with a comparative statement about these deltas (e.g., 'Revenue is up 12% from your last upload...').
        """

    prompt = f"""You are an elite, Tier-1 E-Commerce Data Consultant for {store_name}.
    
    The CEO's business goals are:
    - Target Average Order Value (AOV): ${target_aov}
    - Target Monthly Revenue: ${target_rev}
    
    Here is the mathematically proven profile of their recent sales data:
    {clean_metrics}
    
    {delta_context}
    
    CRITICAL ANOMALIES DETECTED:
    We mathematically detected {info.anomaly_count} orders that fall wildly outside their normal sales variance. 
    The product SKUs most responsible for these anomalies are: {anomalous_skus_str}.
    
    Your task is to return a strict JSON object with exactly three keys:
    1. "summary": A sharp, 2-sentence executive summary of their revenue, AOV, and goals.
    2. "root_causes": A list of 2 string sentences explaining why those specific anomalous SKUs might be causing spikes or drops.
    3. "recommendations": A list of 2 actionable, e-commerce specific steps the CEO should take immediately.
    
    Return ONLY valid JSON."""
    
    # 5. Call Gemini & Inject Deltas for the Frontend
    try:
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        ai_data = json.loads(response.text)
        
        # We attach the Python-calculated deltas to the JSON so React can render the UI badges
        if deltas:
            ai_data["deltas"] = deltas 
            
        return ai_data
    except Exception as e:
        return {
            "summary": f"AI Engine offline. Error: {str(e)}", 
            "root_causes": ["System error prevented AI analysis."], 
            "recommendations": ["Check backend server logs."]
        }
    
@app.post("/export-pdf")
async def export_pdf(payload: PDFExportPayload, current_user = Depends(get_current_user)):
    metrics= payload.metrics
    brief = payload.aiBrief
    summary = brief.get("summary","No summary available")
    root_causes =brief.get("root_causes",[])
    recommendations = brief.get("recommendations",[])

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @page {{ margin: 2cm; size: A4 portrait; }}
            body {{ font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; line-height: 1.6; }}
            .header {{ border-bottom: 2px solid #111827; padding-bottom: 10px; margin-bottom: 30px; }}
            .title {{ font-size: 24px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; }}
            .meta {{ font-size: 12px; color: #6B7280; font-family: monospace; }}
            
            .kpi-grid {{ display: flex; width: 100%; margin-bottom: 30px; gap: 20px; }}
            .kpi-box {{ flex: 1; padding: 15px; border: 1px solid #E5E7EB; background: #F9FAFB; border-radius: 8px; }}
            .kpi-label {{ font-size: 10px; text-transform: uppercase; color: #6B7280; letter-spacing: 1px; }}
            .kpi-value {{ font-size: 24px; font-weight: bold; margin-top: 5px; }}
            
            h2 {{ font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #374151; border-bottom: 1px solid #E5E7EB; padding-bottom: 5px; margin-top: 30px; }}
            p {{ font-size: 14px; }}
            ul {{ font-size: 14px; padding-left: 20px; }}
            li {{ margin-bottom: 8px; }}
            
            .footer {{ position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 10px; }}
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">NexusIQ Executive Brief</div>
            <div class="meta">Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} | Source Data: {payload.filename}</div>
        </div>

        <div class="kpi-grid">
            <div class="kpi-box">
                <div class="kpi-label">Total Revenue</div>
                <div class="kpi-value">${metrics.get('total_revenue', 0):,.2f}</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-label">Total Orders</div>
                <div class="kpi-value">{metrics.get('order_count', 0):,}</div>
            </div>
            <div class="kpi-box">
                <div class="kpi-label">Avg Order Value</div>
                <div class="kpi-value">${metrics.get('avg_order_value', 0):,.2f}</div>
            </div>
        </div>

        <h2>Executive Summary</h2>
        <p>{summary}</p>

        <h2>Identified Root Causes</h2>
        <ul>
            {''.join(f'<li>{cause}</li>' for cause in root_causes)}
        </ul>

        <h2>Strategic Action Plan</h2>
        <ul>
            {''.join(f'<li>{rec}</li>' for rec in recommendations)}
        </ul>

        <div class="footer">
            Confidential & Proprietary · Generated securely via NexusIQ Enterprise
        </div>
    </body>
    </html>
    """
    pdf_bytes = HTML(string=html_content).write_pdf()

    return Response(content=pdf_bytes, media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename=NexusIQ_Brief_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"})

@app.post("/narrate-brief")
async def narrate_brief(payload: NarrationPayload, current_user = Depends(get_current_user)):
    try:
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=payload.summary_text)
        voice = texttospeech.VoiceSelectionParams(language_code = "en-US",name="en-US-Journey-D")
        
        audio_config = texttospeech.AudioConfig(audio_encoding = texttospeech.AudioEncoding.MP3,
                                                speaking_rate = 1.05,
                                                pitch = 2.0)
        response = client.synthesize_speech(input = synthesis_input, voice = voice, audio_config = audio_config)
        
        return StreamingResponse(io.BytesIO(response.audio_content),media_type = "audio/mpeg")
    except Exception as e:
        print(f"TTS Engine error: {e}")
        return Response(content=f"Audio generation failed: {str(e)}", media_type="text/plain", status_code=500)
    
SHOPIFY_CLIENT_ID = os.getenv("SHOPIFY_CLIENT_ID","your_client_id")
SHOPIFY_CLIENT_SECRET = os.getenv("SHOPIFY_CLIENT_SECRET","your_client_secret")
APP_URL = "http://localhost:8000"
SCOPES = "read_orders,read_products,read_inventory"

@app.get("/shopify/install-url")
async def get_shopify_install_url(shop: str, current_user = Depends(get_current_user)):
    """
    The React frontend calls this with the user's JWT token.
    We return the secure Shopify URL containing their user_id in the 'state'.
    """
    redirect_uri = f"{APP_URL}/shopify/callback"
    
    state = str(current_user["id"]) if isinstance(current_user, dict) else str(current_user.id)
    
    install_url = f"https://{shop}/admin/oauth/authorize?client_id={SHOPIFY_CLIENT_ID}&scope={SCOPES}&redirect_uri={redirect_uri}&state={state}"
    
    return {"url": install_url}

@app.get("/shopify/callback")
async def shopify_callback(request: Request):
    """Shopify calls this after the merchant clicks 'Approve'."""
    params = dict(request.query_params)
    shop = params.get("shop")
    code = params.get("code")
    hmac_val = params.pop("hmac", None)
    
    user_id = params.get("state") 
    
    if not hmac_val or not shop or not code or not user_id:
        raise HTTPException(status_code=400, detail="Missing parameters. Handshake aborted.")

    sorted_params = "&".join([f"{k}={v}" for k, v in sorted(params.items())])
    calculated_hmac = hmac.new(
        SHOPIFY_CLIENT_SECRET.encode('utf-8'),
        sorted_params.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(calculated_hmac, hmac_val):
        raise HTTPException(status_code=403, detail="HMAC verification failed.")

    async with httpx.AsyncClient() as client:
        token_response = await client.post(
            f"https://{shop}/admin/oauth/access_token",
            json={
                "client_id": SHOPIFY_CLIENT_ID,
                "client_secret": SHOPIFY_CLIENT_SECRET,
                "code": code
            }
        )
        
    token_data = token_response.json()
    access_token = token_data.get("access_token")
    
    if not access_token:
         raise HTTPException(status_code=500, detail="Failed to retrieve token.")
         
    encrypted_token = encrypt_token(access_token)
    
    supabase.table("shopify_connections").upsert({
        "user_id": user_id,
        "shop_domain": shop,
        "access_token_encrypted": encrypted_token,
        "scopes": SCOPES.split(",")
    }, on_conflict="shop_domain").execute()
    
    print(f"🔒 SECURE HANDSHAKE COMPLETE FOR: {shop} (User: {user_id})")
    
    return RedirectResponse("http://localhost:5173/dashboard?integration=success")


@app.get("/forecast")
async def forecast(current_user = Depends(get_current_user)):
    user_id = current_user.id
    cache_key = f"forecast_{user_id}"
    
    cached_result = cache.get(cache_key)
    if(cached_result):
        print("Serving Forecast from Memory cache")
        return cached_result
    print("Cache Miss: Generating new forecast...")
    
    db_response = await supabase.table("store_settings").select("dna").eq("user_id",user_id).execute()
    dna = db_response.data[0]['dna'] if db_response.data else{}
    target_revenue = dna.get('targetRevenue',0)
    
    ninety_days_ago = (datetime.now() - timedelta(days=90)).isoformat()
    order_response = await supabase.table("orders").select('*').eq("user_id",user_id).gte("created_at",ninety_days_ago).execute()
    if not orders_response.data:
        raise HTTPException(status_code=404, detail="No orders found for forecasting. Please sync your store with at least 14 days of data.")
    
    df = pd.DataFrame(order_response.data)
    forecast_result = generate_30_day_forecast(df,float(target_revenue))
    
    if "error" in forecast_result:
        raise HTTPException(status_code = 400,detail = forecast_result["error"])
    cache.set(cache_key,forecast_result,ex=21600)
    return forecast_result    
    