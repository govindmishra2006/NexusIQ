from fastapi import FastAPI, UploadFile, File
import pandas as pd

app = FastAPI()

@app.get("/")
def home():
    return {
        "message": "Welcome to NexusIQ"
    }

@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    df = pd.read_csv(file.file)

    return {
        "filename" : file.filename,
        "columns" : df.shape[1],
        "rows" : df.shape[0],
        "column_names" : df.columns.tolist()
    }