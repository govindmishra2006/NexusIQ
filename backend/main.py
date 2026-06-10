from fastapi import FastAPI, UploadFile, File
import pandas as pd
import plotly.express as px
import os
app = FastAPI()
os.makedirs("charts", exist_ok=True)
@app.get("/")
def home():
    return {
        "message": "Welcome to NexusIQ"
    }

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    numerical_columns = list(
        df.select_dtypes(include=["number"]).columns
    )

    categorical_columns = list(
        df.select_dtypes(exclude=["number"]).columns
    )

    generated_charts = []
    if numerical_columns:
        fig = px.histogram(df,x=numerical_columns[0],title=f"Distribution of {numerical_columns[0]}")
        chart_path = f"charts/{numerical_columns[0]}.html"
        fig.write_html(chart_path)
        generated_charts.append(chart_path)
    return {
        "filename": file.filename,
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": list(df.columns),
        "numerical_columns": numerical_columns,
        "categorical_columns": categorical_columns,
        "charts": generated_charts
    } 