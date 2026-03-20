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

## Responsible AI Policy Configuration

The OpenAI API key cannot store a policy document or governance profile. In this project, policy enforcement belongs in the backend prompt assembly layer.

To configure a project policy document:

1. Put the governing text in `docs/responsible-ai-policy.md`.
2. Optionally change `RAI_POLICY_DOC_PATH` in `.env` to point to a different local file.
3. Start the server normally. The backend route injects that document into the system prompt for every `/api/chat` request.

Current behavior:

- If the policy file exists, the server includes it in the system prompt.
- If the file is missing, the server falls back to baseline responsible-AI rules and the model is told that project-specific policy alignment could not be verified.
- `RAI_POLICY_MAX_CHARS` limits how much of the document is injected to control prompt size.

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
