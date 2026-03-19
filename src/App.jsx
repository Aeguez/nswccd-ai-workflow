import React, { useMemo, useState } from "react";
import HumanValidationBridge from "./components/HumanValidationBridge";

const initialPrompt =
  "Design a propulsion-monitoring helper that flags efficiency drops without violating mission safety constraints.";

function buildMockCode(userInput) {
  const normalized = userInput.toLowerCase();

  if (normalized.includes("propulsion")) {
    return `function evaluatePropulsionEfficiency(sensorReadings) {
  const averageDrag = sensorReadings.reduce((sum, reading) => sum + reading.dragCoefficient, 0) / sensorReadings.length;
  const averageThrust = sensorReadings.reduce((sum, reading) => sum + reading.thrustOutput, 0) / sensorReadings.length;
  const efficiencyScore = averageThrust / Math.max(averageDrag, 0.01);

  return {
    efficiencyScore,
    requiresInspection: efficiencyScore < 0.82,
    recommendation: efficiencyScore < 0.82
      ? "Schedule propulsion inspection and compare hull resistance trend."
      : "Maintain current operating profile."
  };
}`;
  }

  if (normalized.includes("logging") || normalized.includes("anomaly")) {
    return `function createAnomalyLogEntry(event) {
  return {
    eventId: event.id,
    subsystem: event.subsystem,
    severity: event.score > 0.9 ? "critical" : "warning",
    timestamp: new Date().toISOString(),
    action: "Route to engineer review before automation response."
  };
}`;
  }

  return `function validateMissionSuggestion(changeRequest) {
  const hasMissionRisk = changeRequest.impactLevel === "critical";
  const hasEvidence = changeRequest.evidenceScore >= 0.75;

  return {
    status: hasMissionRisk || !hasEvidence ? "human-review" : "controlled-implementation",
    rationale: hasMissionRisk
      ? "Mission-impacting change requires engineer approval."
      : "Evidence threshold met for controlled review."
  };
}`;
}

function getMockAIResponse(userInput) {
  const normalized = userInput.toLowerCase();
  const missionArea = normalized.includes("propulsion")
    ? "Naval propulsion"
    : normalized.includes("anomaly") || normalized.includes("logging")
      ? "Reliability instrumentation"
      : "Mission software";

  return {
    suggestionTitle: `${missionArea} recommendation`,
    suggestedCode: buildMockCode(userInput),
    transparentReasoning: [
      `The request was classified as ${missionArea.toLowerCase()} work, so the response prioritizes deterministic logic and reviewable outputs over opaque automation.`,
      "The implementation path keeps engineers in control by returning an assessment object rather than triggering autonomous action.",
      "Risk controls were elevated because the request affects operational behavior and must remain consistent with mission assurance practices.",
    ],
    referenceCitation:
      "Aligned with DoD Responsible AI Strategy and DON guidance by preserving traceability, human judgment, and explicit review checkpoints.",
  };
}

function createAssistantMessage(userInput, id) {
  return {
    id,
    role: "assistant",
    status: "pending-validation",
    response: getMockAIResponse(userInput),
    validation: {
      checkedItems: {},
      engineerName: "",
      missionNotes: "",
      decision: "",
    },
  };
}

export default function App() {
  const [draft, setDraft] = useState(initialPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    {
      id: "system-1",
      role: "system",
      content:
        "NSWCCD conceptual AI tool initialized. Every AI answer must expose code, reasoning, and citation before a human reviewer can accept it.",
    },
  ]);

  const pendingValidationId = useMemo(() => {
    const pendingAssistant = [...chatHistory]
      .reverse()
      .find(
        (message) =>
          message.role === "assistant" && message.status === "pending-validation"
      );

    return pendingAssistant?.id ?? null;
  }, [chatHistory]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmed = draft.trim();
    if (!trimmed || isGenerating || pendingValidationId) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setIsGenerating(true);
    setChatHistory((current) => [...current, userMessage]);
    setDraft("");

    window.setTimeout(() => {
      setChatHistory((current) => [
        ...current,
        createAssistantMessage(trimmed, `assistant-${Date.now()}`),
      ]);
      setIsGenerating(false);
    }, 450);
  };

  const updateAssistantValidation = (messageId, updater) => {
    setChatHistory((current) =>
      current.map((message) => {
        if (message.id !== messageId || message.role !== "assistant") {
          return message;
        }

        return {
          ...message,
          validation: updater(message.validation),
        };
      })
    );
  };

  const handleChecklistToggle = (messageId, checklistId) => {
    updateAssistantValidation(messageId, (validation) => ({
      ...validation,
      checkedItems: {
        ...validation.checkedItems,
        [checklistId]: !validation.checkedItems[checklistId],
      },
    }));
  };

  const handleValidationField = (messageId, field, value) => {
    updateAssistantValidation(messageId, (validation) => ({
      ...validation,
      [field]: value,
    }));
  };

  const handleAccept = (messageId) => {
    setChatHistory((current) =>
      current.map((message) =>
        message.id === messageId && message.role === "assistant"
          ? { ...message, status: "accepted" }
          : message
      )
    );
  };

  return (
    <main className="mx-auto min-h-screen w-[min(1480px,calc(100%-32px))] py-6 font-mono max-sm:w-[min(100%-20px,1480px)]">
      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="mission-panel p-5">
          <div className="border-b border-white/10 pb-4">
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
              NSWCCD Concept Tool
            </p>
            <h1 className="mt-2 text-2xl text-slate-50">AI Programming Console</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Submit an engineering request and review the simulated AI response
              through transparent reasoning, citation, and a mandatory HITL gate.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                Response Format
              </p>
              <ul className="mt-3 grid gap-2 pl-5 text-sm text-slate-300">
                <li>Suggested code</li>
                <li>Transparent reasoning</li>
                <li>Reference citation</li>
              </ul>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                Release Rule
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                A response remains blocked until an engineer completes the HITL
                checklist and explicitly approves the suggestion.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                Current Status
              </p>
              <span
                className={`mt-3 inline-flex rounded-full border px-3 py-2 text-[0.72rem] uppercase tracking-[0.16em] ${
                  pendingValidationId
                    ? "border-amber-400/20 bg-amber-400/10 text-amber-300"
                    : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                }`}
              >
                {pendingValidationId ? "Waiting for validation" : "Ready for next request"}
              </span>
            </div>
          </div>
        </aside>

        <section className="grid gap-6">
          <div className="mission-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                  Chat Workflow
                </p>
                <h2 className="mt-2 text-3xl text-slate-50">
                  Simulated AI-assisted coding session
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  This mock backend returns structured AI answers that satisfy the
                  FBLA rubric while enforcing engineer oversight before acceptance.
                </p>
              </div>
              <div className="grid gap-2">
                <span className="status-pill">Reasoning Visible</span>
                <span className="status-pill border-red-400/20 bg-red-400/10 text-red-300">
                  HITL Mandatory
                </span>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {chatHistory.map((message) => {
                if (message.role === "system") {
                  return (
                    <div
                      key={message.id}
                      className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-sm leading-6 text-cyan-100"
                    >
                      {message.content}
                    </div>
                  );
                }

                if (message.role === "user") {
                  return (
                    <div
                      key={message.id}
                      className="ml-auto w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-950/80 p-5"
                    >
                      <p className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                        Engineer Request
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-200">
                        {message.content}
                      </p>
                    </div>
                  );
                }

                const { response, validation, status } = message;
                const completedChecks = Object.values(
                  validation.checkedItems
                ).filter(Boolean).length;
                const reviewerReady = validation.engineerName.trim().length >= 3;
                const notesReady = validation.missionNotes.trim().length >= 24;
                const canAccept =
                  completedChecks === 6 &&
                  reviewerReady &&
                  notesReady &&
                  validation.decision === "approve";
                const unresolvedGaps = [
                  completedChecks !== 6
                    ? "Complete every validation check before release."
                    : null,
                  reviewerReady ? null : "Reviewer identity is required.",
                  notesReady
                    ? null
                    : "Validation notes must capture evidence and disposition.",
                  validation.decision ? null : "Select approve or reject.",
                  validation.decision === "reject"
                    ? "Current disposition blocks implementation."
                    : null,
                ].filter(Boolean);

                return (
                  <article
                    key={message.id}
                    className="rounded-3xl border border-white/10 bg-slate-950/80 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                          AI Response
                        </p>
                        <h3 className="mt-2 text-xl text-slate-50">
                          {response.suggestionTitle}
                        </h3>
                      </div>
                      <span
                        className={`status-pill ${
                          status === "accepted"
                            ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                            : "border-amber-400/20 bg-amber-400/10 text-amber-300"
                        }`}
                      >
                        {status === "accepted" ? "Accepted" : "Pending validation"}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-4">
                      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                          A) Suggested Code
                        </p>
                        <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-6 text-slate-200">
                          <code>{response.suggestedCode}</code>
                        </pre>
                      </section>

                      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                          B) Transparent Reasoning
                        </p>
                        <ul className="mt-3 grid gap-2 pl-5 text-sm leading-6 text-slate-300">
                          {response.transparentReasoning.map((reason) => (
                            <li key={reason}>{reason}</li>
                          ))}
                        </ul>
                      </section>

                      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                          C) Reference Citation
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {response.referenceCitation}
                        </p>
                      </section>
                    </div>

                    {status === "pending-validation" ? (
                      <HumanValidationBridge
                        checkedItems={validation.checkedItems}
                        engineerName={validation.engineerName}
                        missionNotes={validation.missionNotes}
                        decision={validation.decision}
                        onChecklistToggle={(checklistId) =>
                          handleChecklistToggle(message.id, checklistId)
                        }
                        onEngineerNameChange={(value) =>
                          handleValidationField(message.id, "engineerName", value)
                        }
                        onMissionNotesChange={(value) =>
                          handleValidationField(message.id, "missionNotes", value)
                        }
                        onDecisionChange={(value) =>
                          handleValidationField(message.id, "decision", value)
                        }
                        onAccept={() => handleAccept(message.id)}
                        canAccept={canAccept}
                        unresolvedGaps={unresolvedGaps}
                      />
                    ) : (
                      <div className="mt-5 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm leading-6 text-emerald-200">
                        Suggestion accepted by human reviewer{" "}
                        <strong>{validation.engineerName}</strong>. Notes captured for
                        conceptual audit persistence.
                      </div>
                    )}
                  </article>
                );
              })}

              {isGenerating && (
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-sm leading-6 text-slate-300">
                  Simulated AI is analyzing the engineering request and generating
                  code, reasoning, and citation sections.
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mission-panel p-6">
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
              New Request
            </p>
            <h2 className="mt-2 text-2xl text-slate-50">Submit engineering prompt</h2>

            <label className="mt-5 grid gap-2">
              <span className="text-[0.82rem] uppercase tracking-[0.16em] text-slate-300">
                User input
              </span>
              <textarea
                rows="4"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Describe the naval engineering coding task you want the AI to support."
                className="field-shell resize-y"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm leading-6 text-slate-400">
                {pendingValidationId
                  ? "Complete the active human review before sending another request."
                  : "The next response will be generated locally by a mock AI function."}
              </p>
              <button
                type="submit"
                disabled={isGenerating || Boolean(pendingValidationId) || !draft.trim()}
                className={`rounded-3xl border px-5 py-4 text-[0.82rem] uppercase tracking-[0.16em] transition ${
                  isGenerating || pendingValidationId || !draft.trim()
                    ? "border-white/10 bg-slate-900/80 text-slate-500"
                    : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                }`}
              >
                {isGenerating ? "Generating" : "Generate Mock AI Response"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
