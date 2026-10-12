# Step Out

A small local AI app that plans outdoor breaks around busy city life.

## What it does

Select time, a familiar outdoor space, a goal, and a mobility preference. The backend uses a local Gemma model through Ollama to generate a tailored activity. Code strictly allocates the schedule phases. The browser can save the latest card locally and download it as a plain-text card.

## Requirements

- Node 24 LTS (or newer) and npm.
- Ollama with `gemma3:1b` downloaded.
- A compatible machine with enough memory for the selected model (tested on 8 GB RAM).
- macOS 14 or newer for current Ollama on Mac, or a compatible Linux system.

## Run locally

```bash
git clone https://github.com/CynthiaWahome/step-out.git
cd step-out
npm ci
cp .env.example .env.local
ollama pull gemma3:1b
npm run dev
```

Open `http://localhost:3000`. Keep the Ollama app or service running. On Linux without an active service, run `ollama serve` in another terminal. Do not start a duplicate server.

## Environment

`OLLAMA_BASE_URL` defaults to `http://127.0.0.1:11434`. `OLLAMA_MODEL` defaults to `gemma3:1b`. Settings stay in the backend. Restart the application after changing them.

## Checks

```bash
npx tsc --noEmit
npx eslint .
npm run build
npm run start -- --hostname 127.0.0.1
```

## Tested setup and results

- **Machine**: Apple M1, macOS 27.0.1, 8 GB RAM
- **Software**: Node v26.9.0, Next.js 16.4.0, React 19.3.0, Zod 4.6.6, Ollama 0.40.3
- **Model Tag**: `gemma3:1b` (ID: `97558784bdc9`)
- **Latencies**: Cold start ~7.45s; Warm requests 5.45s – 7.54s
- **Validation**: TypeScript (0 errors), ESLint (0 errors), Production Build (clean Turbopack build)
- **Scenario Tests**: 5m, 10m, 15m, 20m durations, compound/street/seating spaces, seated and walking mobility constraints, invalid inputs (HTTP 400), and upstream model outage recovery (HTTP 503) all passed.

## Data and offline behaviour

In the local version, preferences are processed by the backend and model on the same computer. The latest plan and reflection are saved only in that browser (`localStorage`). No accounts or external databases are used. A downloaded text card can be read outdoors without any network connectivity or screen use. Local generation works after setup with the internet disconnected.

The phone does not run the model. A hosted deployment sends inputs to the hosting server and requires internet for generation.

## Limitations

The app does not verify locations, weather, route safety, or travel times. It uses user-selected familiar spaces and estimated time allowances. JSON validation checks structure, but prompt constraints ensure plain text without markup. The single-process demo accepts one generation at a time; there is no distributed queue or rate limiter.

## Credits and licence

MIT License © 2026 Cynthia Wahome.

Built with Next.js, React, TypeScript, Zod, and Ollama. Gemma is an open-weight model governed by its own terms: https://ai.google.dev/gemma/terms.

## Changes after the challenge deadline

None.
