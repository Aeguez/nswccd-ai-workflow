# NSWCCD AI Workflow Console

Conceptual React application for the FBLA Technology & Computer Science Case Competition. The project models an AI-supported programming workflow for the Naval Surface Warfare Center Carderock Division (NSWCCD) with explicit human oversight, transparent AI reasoning, and responsible-AI safeguard checks.

## Mission Focus

This interface is designed around three non-negotiable controls:

1. Transparent AI reasoning so engineers can see why a recommendation was produced.
2. Human-in-the-loop validation before any recommendation moves toward implementation.
3. Ethical safeguards to reduce bias, hallucinations, and over-reliance on automation.

## Current App Structure

```text
src/
  App.jsx
  index.css
  main.jsx
  components/
    HumanValidationBridge.jsx
```

## Key Screens and Behaviors

- `HumanValidationBridge.jsx` is the primary mission console.
- The reasoning trace explains the logic behind each AI suggestion.
- The engineer validation bridge enforces a required checklist covering technical accuracy, safety, ethics, bias review, hallucination review, and human authority.
- The approval gate stays blocked until all checklist items, reviewer identity, notes, and an explicit approval decision are present.

## Full-Stack Alignment

- React: operator-facing mission console.
- Tailwind CSS: utility-first styling layer used directly in the UI implementation.
- PostgreSQL: conceptual storage for reviewer identity, audit trails, safeguard evidence, and approval history.

The repository now includes a working Tailwind CSS setup through `tailwind.config.js`, `postcss.config.js`, and `src/index.css`.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
