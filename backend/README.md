# Nurture Baby Cry Analyzer — Python Backend (Offline Edition)

This directory contains the Python API service designed to run machine learning predictions directly on your local computer. It loads your pre-trained `.pkl` (pickle) models, processes audio feeds with `librosa` to extract high-fidelity acoustic features (MFCCs, Chroma, & Mel spectrogram peaks), and returns classifications back to the Vite + React frontend overlay.

---

## 📂 Project Structure Walkthrough

When you download your AI Studio codebase, your directory should match this structure:

```text
baby-cry-analyzer-app/
 │
 ├── backend/                         # 🐍 Python API Server (This Folder)
 │   ├── main.py                      # FastAPI app running your model
 │   ├── best_model.pkl               # <--- Place your trained model file here!
 │   ├── scaler.pkl                   # <--- Place your trained scaler file here!
 │   └── requirements.txt             # required: librosa, joblib, numpy, fastapi, etc.
 │
 └── frontend/                        # ⚡ Vite + React Web App (Root Workspace)
     ├── index.html
     ├── package.json
     ├── src/
     ...
```

---

## 🚀 Setup & Execution Guide (100% Offline)

To run this backend on your local machine:

### 1. Configure Python Environment
Open your terminal in the `backend/` directory and spin up a Python virtual environment:

```bash
# Move to backend folder
cd backend

# Create Virtual Environment (Python 3.9 - 3.11 recommended)
python -m venv venv

# Activate Virtual Environment
# On macOS/Linux:
source venv/bin/activate
# On Windows (Command Prompt):
venv\Scripts\activate
# On Windows (PowerShell):
venv\Scripts\Activate.ps1
```

### 2. Install ML and Speech Processing Dependencies
Install the required dependencies using pip. Ensure you have standard audio drivers or audio utilities installed (like `ffmpeg` or `libsndfile` which `librosa` / `soundfile` use to read audio files):

```bash
pip install -r requirements.txt
```

### 3. Place Your Prepackaged ML Models
Move your pre-trained python model files directly into this directory:
- Save your trained classification model as: `backend/best_model.pkl`
- Save your trained normalization scaler profile as: `backend/scaler.pkl`

> **Note on Feature Shapes:** The default `main.py` implementation concatenates `[40 MFCCs, 12 Chroma class means, 64 Mel bands]` to form a flat input feature vector of shape `(1, 116)`. If your pipeline or classification input structure differs, quickly adjust the feature mapping inside `backend/main.py:predict_cry_audio()` to match!

### 4. Lift the FastAPI Web Server
Boot up the local web service with live hot reloading:

```bash
uvicorn main:app --reload --port 8000
```
This deploys your Python AI service endpoint listening at **`http://127.0.0.1:8000`**. You can verify that it correctly detected your models by visiting `http://127.0.0.1:8000/health`.

---

## 🌐 Connecting the React Frontend

1. Boot up your React client (under the frontend folder) via `npm run dev` (starts on port `3000`).
2. Open the browser. In the **Audio Input Source** card, switch your **Connection Mode** toggle from "Simulation Sandbox" to **"Connect to Local Python Server"**.
3. Now, whenever you upload or record a sound, the React frontend will transmit the file directly to your local Python server `http://localhost:8000/predict`. The scikit-learn model will analyze the waveform in real-time, sending back the true classifications and spectral charts!
