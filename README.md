# 🍃 Nurture — Baby Cry Analyzer

> Understand what your baby is trying to tell you.

Nurture is a **React + TypeScript** web app that records or accepts uploaded baby cry audio, extracts acoustic features (MFCC, Chroma, Mel Spectrogram), and classifies the cry into one of **11 categories** — hungry, tired, belly pain, discomfort, scared, lonely, cold/hot, burping, noise, laugh, or silence. Each result includes a confidence score, probability breakdown, and practical soothing tips.

The app runs **entirely in simulation mode by default** — no backend needed. It optionally connects to a local **FastAPI + scikit-learn** server for real ML inference.

---

## 📸 Screenshots

| Landing Page | Analysis Dashboard |
|---|---|
| ![Landing](home1.png) | ![Dashboard](dashboard.png) |

---

## ✨ Features

- 🎙️ Record live audio or upload WAV / MP3 / OGG / M4A files
- 📊 Confidence scores across 11 cry categories with probability bars
- 💡 Soothing tips and observable signs per result
- 👶 Multiple baby profiles with per-baby history
- 🔬 Acoustic feature visualization — MFCC (40 bands), Chroma (12 pitch classes), Mel Spectrogram (64 bins)
- 🎵 Built-in soothing soundscapes — white noise, pink noise, brown noise, lullaby tones, womb heartbeat
- 🔒 Fully on-device — audio never leaves the browser
- ⚡ Simulation mode with no backend required
- 🐍 Optional FastAPI backend for real stacking ensemble ML predictions

---

## 🗂️ Project Structure

```
nurture-baby-cry-analyzer/
├── src/
│   ├── components/
│   │   ├── AnalysisResults.tsx   # Result card, confidence gauge, probability bars
│   │   ├── AudioUploader.tsx     # File upload, mic recording, sample library
│   │   ├── AuthScreen.tsx        # Login / register with baby profile setup
│   │   ├── BabyProfiles.tsx      # Multi-baby profile manager
│   │   ├── CryIcon.tsx           # Icon map for each cry label
│   │   ├── LandingPage.tsx       # Marketing landing page
│   │   ├── ParentToolkit.tsx     # Soothing soundscapes player
│   │   ├── ScientificFeatures.tsx # MFCC / Chroma / Mel charts
│   │   └── SoundWaveform.tsx     # Animated waveform component
│   ├── constants/
│   │   └── cryData.ts            # Cry type details, emoji map, soothing data
│   ├── utils/
│   │   └── audioSimulation.ts    # Simulation engine + sample cry library
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces (UserSession, CryAnalysis, etc.)
│   ├── App.tsx                   # Root app, routing between tabs
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Tailwind + custom animations + theme tokens
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | React 19 | UI rendering |
| Language | TypeScript | Type safety |
| Build tool | Vite | Dev server + bundler |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Animations | Framer Motion | Page transitions, chart animations |
| Animations (CSS) | tw-animate-css | Tailwind animation utilities |
| Icons | Lucide React | All UI icons |
| Fonts | Google Fonts | Poppins, Inter, Nunito, JetBrains Mono |
| Storage | localStorage | Sessions, baby profiles, history |
| ML (optional) | FastAPI + scikit-learn | Real cry classification backend |

---

## 📦 Dependencies

These are all the npm packages used across the codebase:

### Core

```bash
npm install react react-dom
npm install typescript
```

### Framer Motion (animations & transitions)

```bash
npm install framer-motion
```

### Lucide React (icons)

```bash
npm install lucide-react
```

### Tailwind CSS v4 + animation plugin

```bash
npm install tailwindcss @tailwindcss/vite
npm install tw-animate-css
```

### shadcn/ui (used in not-found and toast components)

```bash
npm install @radix-ui/react-toast
```

> shadcn components (`Card`, `Toast`) require the `@/` path alias configured in `tsconfig.json` and `vite.config.ts` — see [Path Alias Setup](#path-alias-setup) below.

### Dev dependencies

```bash
npm install -D vite @vitejs/plugin-react
npm install -D @types/react @types/react-dom
```

### Full install (all at once)

```bash
npm install react react-dom framer-motion lucide-react tailwindcss @tailwindcss/vite tw-animate-css @radix-ui/react-toast
npm install -D vite @vitejs/plugin-react typescript @types/react @types/react-dom
```

---

## 🚀 Getting Started

**1. Clone the repository**

```bash
git clone https://github.com/your-username/nurture-baby-cry-analyzer.git
cd nurture-baby-cry-analyzer
```

**2. Install all dependencies**

```bash
npm install
```

**3. Start development server**

```bash
npm run dev
```

**4. Open in browser**

```
http://localhost:5173
```

App starts in **Sandbox mode** — no backend required. Use the sample library or upload any audio file to test.

---

## ⚙️ Path Alias Setup

The shadcn components use `@/` imports. Make sure these configs are in place:

**`tsconfig.json`**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**`vite.config.ts`**
```ts
import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

---

## 🔧 Build & Preview

```bash
# Production build (outputs to /dist)
npm run build

# Preview the production build locally
npm run preview
```

---

## 🐍 Optional: FastAPI Backend (Real ML Inference)

By default, the app simulates analysis. To use a real trained model:

**1. Set up the Python environment**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

**Minimum `requirements.txt`:**
```
fastapi
uvicorn
scikit-learn
numpy
librosa
python-multipart
```

**2. Add your model files to `/backend`**

```
backend/
├── main.py
├── best_model.pkl      # trained stacking ensemble
└── scaler.pkl          # fitted feature scaler
```

**3. Run the server**

```bash
uvicorn main:app --reload
```

Server runs at `http://127.0.0.1:8000`

**4. Connect the app**

In the Analyze tab, switch **Sandbox → Python API**. The app will ping `/health` to confirm connection, then POST audio to `/predict`.

**Expected `/predict` response shape:**
```json
{
  "matchedLabel": "hungry",
  "confidence": 89.4,
  "probabilities": { "hungry": 0.894, "tired": 0.04, ... },
  "features": {
    "mfcc": [...],
    "chroma": [...],
    "mel": [...]
  }
}
```

---

## ☁️ Deployment

**Netlify**

```bash
npm run build
netlify deploy --prod --dir=dist
```

**Vercel**

```bash
npm run build
vercel --prod
```

Both deploy the static `/dist` folder with zero additional config needed.

---

## 🧠 Cry Categories

| Label | Category | Typical Signs |
|---|---|---|
| 🍼 `hungry` | Hungry | Rhythmic, repeating, low-pitched |
| 😴 `tired` | Tired & Sleepy | Whiny, nasal, eye rubbing |
| 🤕 `belly pain` | Belly Pain | High-pitched, intense, legs drawn up |
| 😣 `discomfort` | Discomfort | Fussy, intermittent, hard to settle |
| 😨 `scared` | Scared | Sudden sharp onset |
| 💔 `lonely` | Lonely | Soft, stops when held |
| 🌡️ `cold_hot` | Cold / Hot | Fussing with temperature cues |
| 💨 `burping` | Burping | Grunting, arching back |
| 🔊 `noise` | Noise Reaction | Startled, reactive |
| 😄 `laugh` | Laughing & Cooing | Playful vocalizations |
| 🤫 `silence` | Silence | Calm or sleeping |

---

## 🤝 Contributing

Got ideas? Found a bug? Couldn't sleep at 3am and decided to refactor instead of cry yourself? We welcome all of it.
No contribution is too small. Typo fixes, UI tweaks, a strongly worded comment about variable naming — all valid.

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

3. Make your changes and commit

```bash
git commit -m "feat: describe your change"
```

4. Push and open a pull request

```bash
git push origin feature/your-feature-name
```

---


⚠️ Disclaimer
Nurture is a parenting aid, not a replacement for an actual doctor, pediatrician, or that one auntie who claims she can tell what a baby wants just by looking at them. If your baby seems unwell, please consult a qualified medical professional — not an app, not Google, and definitely not a Reddit thread from 2014.

We analyze cries. We do not cure them. That's still on you. Sorry.


<div align="center">
If this helped you survive parenthood, consider giving it a ⭐ — it won't make your baby sleep, but it'll make us feel better.
</div>
