from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import plotly.express as px
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load secret environment variables
load_dotenv()

# Initialize the AI Brain
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.5-flash')

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

os.makedirs("charts", exist_ok=True)

# Define the strict structure for incoming AI requests
class DatasetInfo(BaseModel):
    rows: int
    columns: int
    numerical_columns: list
    categorical_columns: list

@app.get("/")
def home():
    return {"message": "Welcome to NexusIQ"}

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)
    chart_data = []

    numerical_columns = list(df.select_dtypes(include=["number"]).columns)
    categorical_columns = list(df.select_dtypes(exclude=["number"]).columns)
    missing_values = df.isnull().sum().to_dict()
    
    generated_charts = []
    
    if numerical_columns:
        first_column = numerical_columns[0]
        value_counts = df[first_column].value_counts().sort_index()
        for index, value in value_counts.items():
            chart_data.append({
                "name": index,
                "count": value
            })
        
        # Note: Plotly Express requires valid DataFrame operations
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
        "chart_data": chart_data
    }

@app.post("/generate-insight")
async def generate_insight(info: DatasetInfo):
    prompt = f"""
    You are the AI Business Analyst for a premium SaaS platform called NexusIQ.
    The user has just uploaded a dataset with the following properties:
    - Rows: {info.rows}
    - Columns: {info.columns}
    - Numerical Features: {', '.join(info.numerical_columns)}
    - Categorical Features: {', '.join(info.categorical_columns)}

    Write a sharp, 3-sentence executive summary detailing what kind of business intelligence 
    and root cause analysis we can perform with this specific data. 
    Be confident, professional, and do not use markdown formatting.
    """
    
    try:
        response = model.generate_content(prompt)
        return {"insight": response.text}
    except Exception as e:
        return {"insight": f"AI Engine temporarily offline. Error: {str(e)}"}
