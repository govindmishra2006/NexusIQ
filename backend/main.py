from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import plotly.express as px
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai
from fastapi import HTTPException


load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("charts", exist_ok=True)


class DatasetInfo(BaseModel):
    rows: int
    columns: int
    numerical_columns: list
    categorical_columns: list
    total_revenue: float = 0.0
    order_count: int = 0
    avg_order_value: float = 0.0
    anomaly_count: int = 0
    top_anomalous_skus: list = []

@app.get("/")
def home():
    return {"message": "Welcome to NexusIQ"}

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):

    df = pd.read_csv(file.file)
    required_columns = ["Order ID","Lineitem SKU","Total","Financial Status","Created at"]

    missing_cols = [col for col in required_columns if col not in df.columns]

    if missing_cols:
        raise HTTPException(
            status_code = 400,
            detail = f"Invalid E-commerce schema. Missing required columns: {', '.join(missing_cols)}. Please upload a standard shopify Orders export"
        )

    df = df.drop_duplicates()

    df["Total"] = pd.to_numeric(df["Total"],errors="coerce")
    df = df.dropna(subset=["Total"])

    q1 = df["Total"].quantile(0.25)
    q3 = df["Total"].quantile(0.75)
    iqr = q3-q1

    lower_fence = q1-(1.5*iqr)
    upper_fence = q3+(1.5*iqr)

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
        "missing_values": missing_values, # Confirms to frontend that data is clean
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

@app.post("/generate-insight")
async def generate_insight(info : DatasetInfo):
    anomalous_skus_str = ', '.join(info.top_anomalous_skus) if info.top_anomalous_skus else "None detected"
    prompt =f"""You are an elite, Tier-1 E-Commerce Data Consultant for a Shopify merchant.
    
    Here is the exact, mathematically proven profile of their recent sales data. Do not hallucinate numbers outside of these facts:
    - Total Revenue: ${info.total_revenue}
    - Total Orders: {info.order_count}
    - Average Order Value (AOV): ${info.avg_order_value}
    
    CRITICAL ANOMALIES DETECTED:
    We mathematically detected {info.anomaly_count} orders that fall wildly outside their normal sales variance. 
    The product SKUs most responsible for these anomalies are: {anomalous_skus_str}.
    
    Your task is to return a strict JSON object with exactly three keys that will be displayed directly to the CEO:
    1. "summary": A sharp, 2-sentence executive summary of their revenue and AOV.
    2. "root_causes": A list of 2 string sentences explaining why those specific anomalous SKUs might be causing spikes or drops.
    3. "recommendations": A list of 2 actionable, e-commerce specific steps the CEO should take immediately regarding those SKUs.
    
    Return ONLY valid JSON."""
    try:
        response = model.generate_content(prompt,generation_config ={"response_mime_type":"application/json"})
        ai_data = json.loads(response.text)
        return ai_data
    except Exception as e:
        return {"summary": f"AI Engine offline. Error: {str(e)}", "chart": None}
