from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import plotly.express as px
import os
import json
from dotenv import load_dotenv
import google.generativeai as genai


load_dotenv()

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

    df = df.drop_duplicates()
    
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
        "chart_data": chart_data
    }

@app.post("/generate-insight")
async def generate_insight(info : DatasetInfo):
    prompt = f"""
    You are the AI Business Analyst for NexusIQ.
    The user uploaded a dataset:
    - Rows: {info.rows}
    - Columns: {info.columns}
    - Numerical: {', '.join(info.numerical_columns)}
    - Categorical: {', '.join(info.categorical_columns)}

    Return ONLY a raw JSON object. Do not use markdown blocks (```json).
    The JSON must have exactly two keys:
    1. "summary": A sharp, 3-sentence executive summary.
    2. "chart": An object with "type" (either "bar" or "pie"), "x_axis" (choose one categorical column), and "y_axis" (choose one numerical column)."""
    try:
        response = model.generate_content(prompt,generation_config ={"response_mime_type":"application/json"})
        ai_data = json.loads(response.text)
        return ai_data
    except Exception as e:
        return {"summary": f"AI Engine offline. Error: {str(e)}", "chart": None}
