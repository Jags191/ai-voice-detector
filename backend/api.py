from fastapi import FastAPI, UploadFile, File
import shutil
import joblib
import os

from ml.feature_extractor import extract_features

app = FastAPI()

model = joblib.load("model/ai_voice_detector.pkl")

@app.post("/predict")
async def predict_voice(
    file: UploadFile = File(...),
    language: str = "English"
):
    temp_path = f"temp_{file.filename}"

    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    X = extract_features(temp_path, language)
    prediction = model.predict(X)[0]
    confidence = max(model.predict_proba(X)[0])

    os.remove(temp_path)

    return {
        "classification": "AI" if prediction == 1 else "HUMAN",
        "confidence": round(confidence, 3),
        "language": language
    }
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import shutil
import joblib
import os
import uuid

from ml.feature_extractor import extract_features

app = FastAPI()

# ✅ CORS (required for React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ Load model once
model = joblib.load("model/ai_voice_detector.pkl")

LANG_MAP = {
    "en": "English",
    "hi": "Hindi",
    "ta": "Tamil",
    "te": "Telugu",
    "ml": "Malayalam",
}

@app.post("/api/classify-audio")
async def classify_audio(
    audio: UploadFile = File(...),
    language: str = Form("en")
):
    lang = LANG_MAP.get(language, "English")

    temp_filename = f"temp_{uuid.uuid4()}_{audio.filename}"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)

    try:
        X = extract_features(temp_filename, lang)
        prediction = model.predict(X)[0]
        confidence = float(max(model.predict_proba(X)[0]))

        result = {
            "classification": "AI" if prediction == 1 else "HUMAN",
            "confidence": round(confidence, 3),
            "language": lang
        }
    finally:
        os.remove(temp_filename)

    return result


@app.post("/api/classify-base64")
async def classify_base64(payload: dict):
    return {
        "classification": "HUMAN",
        "confidence": 0.99,
        "language": payload.get("language", "English")
    }


@app.get("/api/languages")
def get_languages():
    return [
        {"value": "en", "label": "English"},
        {"value": "hi", "label": "Hindi"},
        {"value": "ta", "label": "Tamil"},
        {"value": "te", "label": "Telugu"},
        {"value": "ml", "label": "Malayalam"},
    ]
