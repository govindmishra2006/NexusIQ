from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import plotly.express as px
import os
app = FastAPI()
app.add_middleware(

    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173"
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)
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

    missing_values = (
        df.isnull().sum().to_dict()
    )

    return {
        "filename": file.filename,
        "rows": df.shape[0],
        "columns": df.shape[1],
        "column_names": list(df.columns),
        "numerical_columns": numerical_columns,
        "categorical_columns": categorical_columns,
        "missing_values": missing_values
    }