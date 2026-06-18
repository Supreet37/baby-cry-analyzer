import os
import tempfile
import subprocess
import numpy as np
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

# Optional machine learning dependencies
try:
    import librosa
    import joblib
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False

app = FastAPI(
    title="Nurture Baby Cry Analyzer - Python Offline API Server",
    description="FastAPI backend to run offline classification using best_model.pkl and scaler.pkl models loaded by joblib.",
    version="1.0.0"
)

# Enable CORS so the React frontend running locally can retrieve insights
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model and scaler load config
MODEL_PATH = os.path.join(os.path.dirname(__file__), "best_model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

model = None
scaler = None

# Offline labels matching CryLabel enum in TypeScript exactly
CRY_LABELS = [
    "hungry",
    "belly_pain",
    "burping",
    "tired",
    "discomfort",
    "cold_hot",
    "lonely",
    "scared",
    "noise",
    "silence",
    "laugh"
]

# Attempt to load scikit-learn models from pickle format
if HAS_ML_LIBS:
    try:
        if os.path.exists(MODEL_PATH):
            model = joblib.load(MODEL_PATH)
            print(f"✅ Success: Loaded baby classification model from {MODEL_PATH}")
        else:
            print(f"ℹ️ Info: {MODEL_PATH} not found. Place your trained pickle file here to enable actual predictions.")

        if os.path.exists(SCALER_PATH):
            scaler = joblib.load(SCALER_PATH)
            print(f"✅ Success: Loaded scaler profile from {SCALER_PATH}")
        else:
            print(f"ℹ️ Info: {SCALER_PATH} not found. Ensure to match the parameters in backend feature processing.")
    except Exception as e:
        print(f"❌ Error loading pickled files: {e}")


def convert_to_wav(input_path: str, output_path: str) -> bool:
    """
    Use ffmpeg to convert any audio format to WAV.
    Returns True if successful, False otherwise.
    """
    try:
        result = subprocess.run(
            ["ffmpeg", "-y", "-i", input_path, "-ar", "22050", "-ac", "1", output_path],
            check=True,
            capture_output=True,
            timeout=30
        )
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ ffmpeg conversion failed: {e.stderr.decode()}")
        return False
    except FileNotFoundError:
        print("❌ ffmpeg not found in PATH. Please install ffmpeg and restart your terminal.")
        return False
    except subprocess.TimeoutExpired:
        print("❌ ffmpeg conversion timed out.")
        return False


@app.get("/")
def root():
    return {
        "message": "Baby Cry Analyzer API Running",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "predict": "/predict"
    }


@app.get("/health")
def health():
    return {
        "status": "ready" if model is not None else "models_pending",
        "has_model_pkl": model is not None,
        "has_scaler_pkl": scaler is not None,
        "ml_dependencies_installed": HAS_ML_LIBS,
        "configured_labels": CRY_LABELS,
        "message": "Nurture AI Offline FastAPI listener is active. Drop your best_model.pkl and scaler.pkl to run machine learning inferences!"
    }


@app.post("/predict")
async def predict_cry_audio(file: UploadFile = File(...)):
    """
    Receives an audio file (WAV/MP3/OGG/WebM), converts to WAV via ffmpeg,
    extracts audio features (MFCC, Chroma, Mel Spectrogram),
    and applies standard ML classification.
    """
    if not HAS_ML_LIBS:
        raise HTTPException(
            status_code=500,
            detail="Machine learning dependencies (librosa/joblib) are not installed. Run 'pip install -r requirements.txt'."
        )

    suffix = os.path.splitext(file.filename)[1] if file.filename else ".webm"
    if not suffix:
        suffix = ".webm"

    temp_path = None
    wav_path = None

    try:
        # Write uploaded file to a temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
            content = await file.read()
            temp_audio.write(content)
            temp_path = temp_audio.name

        # Always convert to WAV using ffmpeg for maximum format compatibility
        # This handles WebM (mic recordings), MP3, OGG, M4A, etc.
        wav_fd, wav_path = tempfile.mkstemp(suffix=".wav")
        os.close(wav_fd)  # Close the fd so ffmpeg can write to it

        conversion_ok = convert_to_wav(temp_path, wav_path)
        if not conversion_ok:
            raise HTTPException(
                status_code=500,
                detail="Could not convert audio to WAV. Make sure ffmpeg is installed and in your PATH."
            )

        # Load the converted WAV with librosa
        y, sr = librosa.load(wav_path, sr=22050, duration=10.0)

        if len(y) == 0:
            raise HTTPException(
                status_code=400,
                detail="Audio file appears to be empty or silent after conversion."
            )

        # --- Feature Extraction ---

        # 40 MFCCs
        mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
        mfccs_mean = np.mean(mfccs, axis=1).tolist()  # 40 elements

        # 12 Chroma pitch features
        chroma = librosa.feature.chroma_stft(y=y, sr=sr, n_chroma=12)
        chroma_mean = np.mean(chroma, axis=1).tolist()  # 12 elements

        # 128 Mel Spectrogram bins
        mel = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        mel_mean = np.mean(mel, axis=1).tolist()  # 128 elements

        # Flatten and reshape for model input
        features_flat = np.concatenate([mfccs_mean, chroma_mean, mel_mean]).reshape(1, -1)
        print(f"Feature shape: {features_flat.shape}")

        # Validate feature shape against scaler expectations
        if scaler is not None:
            expected = scaler.n_features_in_
            print(f"Scaler expects: {expected}")
            if features_flat.shape[1] != expected:
                raise HTTPException(
                    status_code=500,
                    detail=f"Feature mismatch: model expects {expected} features, got {features_flat.shape[1]}. Retrain or adjust feature extraction."
                )

        # --- Prediction ---
        matched_label = "hungry"
        confidence = 85.0
        probabilities = {label: 0.05 for label in CRY_LABELS}

        if model is not None:
            features_input = features_flat
            if scaler is not None:
                features_input = scaler.transform(features_input)

            prediction = model.predict(features_input)[0]

            if isinstance(prediction, (int, np.integer)):
                matched_label = CRY_LABELS[int(prediction)]
            else:
                matched_label = str(prediction).lower().replace(" ", "_")

            if hasattr(model, "predict_proba"):
                prob_scores = model.predict_proba(features_input)[0]
                for idx, sc in enumerate(prob_scores):
                    if idx < len(CRY_LABELS):
                        probabilities[CRY_LABELS[idx]] = float(sc)
                confidence = float(np.max(prob_scores) * 100)
            else:
                probabilities[matched_label] = 1.0
                confidence = 100.0
        else:
            # Fallback mock response when no model is loaded
            primary_idx = abs(hash(file.filename)) % len(CRY_LABELS)
            matched_label = CRY_LABELS[primary_idx]
            probabilities[matched_label] = 0.76
            sum_prob = 0.76
            for l in CRY_LABELS:
                if l != matched_label:
                    score = (abs(hash(l + file.filename)) % 10) / 100.0
                    probabilities[l] = score
                    sum_prob += score
            for l in CRY_LABELS:
                probabilities[l] = round(probabilities[l] / sum_prob, 4)
            confidence = round(probabilities[matched_label] * 100, 1)

        # Ensure label is valid
        normalized_label = matched_label.lower().replace(" ", "_")
        if normalized_label not in CRY_LABELS:
            normalized_label = "hungry"

        return {
            "matchedLabel": normalized_label,
            "confidence": confidence,
            "probabilities": probabilities,
            "features": {
                "mfcc": mfccs_mean,
                "chroma": chroma_mean,
                "mel": mel_mean
            }
        }

    except HTTPException:
        raise
    except Exception as err:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing audio: {str(err)}"
        )
    finally:
        # Clean up both temp files safely (Windows holds file locks)
        for p in [temp_path, wav_path]:
            if p and os.path.exists(p):
                try:
                    os.remove(p)
                except PermissionError:
                    pass  # Windows file lock — OS will clean it up


if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting offline companion endpoint...")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)