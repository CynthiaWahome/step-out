<p align="center">
  <img src="docs/assets/step-out-logo-readme.png" alt="Step Out" width="480" />
</p>

<p align="center">
  <strong>A local, privacy-first AI outdoor break planner designed for busy city life.</strong>
</p>

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Gemma 3 1B](https://img.shields.io/badge/Gemma_3_1B-Open_Weights-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/gemma)
[![Ollama](https://img.shields.io/badge/Ollama-Local_Inference-FFFFFF?style=for-the-badge&logo=ollama&logoColor=black)](https://ollama.com/)
[![Zod](https://img.shields.io/badge/Zod_4-Schema_Validation-3E67B1?style=for-the-badge&logo=zod&logoColor=white)](https://zod.dev/)
[![Offline](https://img.shields.io/badge/Offline-100%25_Local-176B63?style=for-the-badge)](https://github.com/CynthiaWahome/step-out)
[![Touch Grass](https://img.shields.io/badge/Theme-Touch_Grass-2E7D32?style=for-the-badge)](https://github.com/CynthiaWahome/step-out)
[![Hacktoberfest](https://img.shields.io/badge/Hacktoberfest-2026-FF7518?style=for-the-badge&logo=hacktoberfest&logoColor=white)](https://hacktoberfest.com/)
[![MLH](https://img.shields.io/badge/MLH-Open_Source-E73427?style=for-the-badge&logo=majorleaguehacking&logoColor=white)](https://mlh.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-C76B4F?style=for-the-badge)](LICENSE)

</div>

---

## The "Touch Grass" Problem

Modern knowledge work keeps us tethered to monitors, notifications, and artificial light. Most wellness applications paradoxically demand **more screen time**—pushing notifications, tracking daily streaks, and demanding constant user interaction.

Furthermore, mainstream advice often assumes access to expansive botanical gardens, hiking trails, or expensive gear. For urban residents balancing multiple commitments, nature is often an apartment courtyard, a familiar residential street, or an outdoor stoop.

**Step Out reimagines outdoor respite through "anti-screen" design:**
- **Zero Excuses**: Tailored for 5 to 20-minute windows in immediately accessible spaces (courtyards, familiar streets, outdoor seating).
- **Physical Boundary**: Generates a single concise activity card, allows downloading it as a plain-text file (`step-out-activity.txt`), and urges you to close your laptop and step outside.
- **Accessible & Seated Options**: Accommodates both gentle walking and fully seated observation.

---

## Key Features

- **100% Local Inference**: Powered by Google's open-weight **Gemma 3 1B** running locally on **Ollama**. No cloud APIs, no token fees, and complete data privacy.
- **Offline Resilience**: Once models and packages are installed, Step Out operates completely offline without an active internet connection.
- **Deterministic Time Budgeting**: Code strictly governs the clock (1m prep, 1-3m return, remainder for activity). The model cannot skew or hallucinate time limits.
- **Constrained Grammars**: Dynamically injects an enum of eligible activity IDs into the Zod schema before sending it to Ollama, eliminating hallucinated IDs with 100% reliability.
- **Zero Database Footprint**: Persists break routines and post-break reflections locally in the user's browser via `localStorage` (`stepout:last`).

---

## Architecture

```
User (Browser UI)
      │
      ▼  POST /api/plan
Next.js 16 API Route (Node.js runtime)
      ├── 1. Validate inputs (minutes, space, goal, mobility) via Zod
      ├── 2. Filter seed catalog (data/activities.json)
      ├── 3. Deterministically compute phase time allocations
      ├── 4. Project eligible IDs into dynamic Zod enum schema
      └── 5. Send structured JSON schema to Ollama (/api/chat)
               │
               ▼
         Local Gemma 3 1B Model (via Ollama port 11434)
               │
               ▼
         Validated JSON Plan returned with latency metadata
```

---

## Quick Start

### Prerequisites
- [Node.js 24 LTS](https://nodejs.org/) (or newer) and `npm`
- [Ollama](https://ollama.com/) installed and running

### 1. Clone & Install
```bash
git clone https://github.com/CynthiaWahome/step-out.git
cd step-out
npm ci
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```
*(Default settings connect to `http://127.0.0.1:11434` using `gemma3:1b`)*

### 3. Pull the Local Model
```bash
ollama pull gemma3:1b
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Verification & Code Quality

```bash
# Type check
npx tsc --noEmit

# Lint code
npx eslint .

# Production build
npm run build

# Run production server
npm run start -- --hostname 127.0.0.1
```

---

## Hardware Benchmarks

*Tested on Apple M1 (macOS, 8 GB Unified Memory):*
- **Cold Start Latency** *(initial model load into RAM)*: ~7.45s
- **Warm Request Latency**: 5.45s – 7.54s
- **Offline Generation**: 100% verified functional with Wi-Fi disabled.

---

## Privacy & Security

Step Out does not collect analytics, track location, or store external profiles. Inputs, generation prompts, and reflection notes remain strictly on your local machine.

---

## Credits & License

- **Source Code**: [MIT License](LICENSE) © 2026 Cynthia Wahome.
- **AI Model**: Google Gemma 3 open weights governed by the [Gemma Terms of Use](https://ai.google.dev/gemma/terms).
