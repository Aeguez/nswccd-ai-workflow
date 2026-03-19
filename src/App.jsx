import React, { useMemo, useState } from "react";
import HumanValidationBridge from "./components/HumanValidationBridge";

function createAssistantMessage(apiResponse, id) {
  return {
    id,
    role: "assistant",
    status: "pending-validation",
    response: apiResponse,
    validation: {
      checkedItems: {},
      engineerName: "",
      missionNotes: "",
      decision: "",
    },
  };
}

export default function App() {
  const [draft, setDraft] = useState(
    "Design a propulsion-monitoring helper that flags efficiency drops without violating mission safety constraints."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: "system-1",
      role: "system",
      content:
        "NSWCCD conceptual AI tool initialized. All OpenAI calls are routed through the server-side proxy. Each answer must pass human validation before acceptance.",
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

  const handleSubmit = async (event) => {
    event.preventDefault();

    const trimmed = draft.trim();
    if (!trimmed || isLoading || pendingValidationId) {
      return;
    }

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setErrorMessage("");
    setIsLoading(true);
    setChatHistory((current) => [...current, userMessage]);
    setDraft("");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: trimmed }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "The internal API route returned an error.");
      }

      setChatHistory((current) => [
        ...current,
        createAssistantMessage(payload.message, `assistant-${Date.now()}`),
      ]);
    } catch (error) {
      setErrorMessage(
        error.message ||
          "The request failed before the AI response could be returned."
      );
    } finally {
      setIsLoading(false);
    }
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
              Secure Proxy Workflow
            </p>
            <h1 className="mt-2 text-2xl text-slate-50">Carderock AI Console</h1>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              The browser only talks to the internal `/api/chat` route. Your
              OpenAI API key stays on the server and is never sent to the client.
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                Model
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">o4-mini</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-4">
              <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                Required Output
              </p>
              <ul className="mt-3 grid gap-2 pl-5 text-sm text-slate-300">
                <li>`code_snippet`</li>
                <li>`reasoning_logic`</li>
                <li>`dod_compliance_reference`</li>
              </ul>
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
                {pendingValidationId ? "Validation in progress" : "Ready"}
              </span>
            </div>
          </div>
        </aside>

        <section className="grid gap-6">
          <div className="mission-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                  Chat Session
                </p>
                <h2 className="mt-2 text-3xl text-slate-50">
                  Backend-proxied engineering assistant
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                  This interface sends prompts to your own backend route, which
                  then calls OpenAI server-side and returns structured JSON for the
                  UI to render.
                </p>
              </div>
              <div className="grid gap-2">
                <span className="status-pill">Server-side only</span>
                <span className="status-pill border-red-400/20 bg-red-400/10 text-red-300">
                  HITL Mandatory
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="mt-5 rounded-3xl border border-red-400/20 bg-red-400/10 p-4 text-sm leading-6 text-red-200">
                {errorMessage}
              </div>
            )}

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
                          Carderock Engineering Assistant
                        </p>
                        <h3 className="mt-2 text-xl text-slate-50">
                          Structured Response
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
                          <code>{response.code_snippet}</code>
                        </pre>
                      </section>

                      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                          B) Transparent Reasoning
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {response.reasoning_logic}
                        </p>
                      </section>

                      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-4">
                        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
                          C) Reference Citation
                        </p>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          {response.dod_compliance_reference}
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
                        <strong>{validation.engineerName}</strong>. Audit notes are
                        ready for backend persistence.
                      </div>
                    )}
                  </article>
                );
              })}

              {isLoading && (
                <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-5 text-sm leading-6 text-slate-300">
                  Contacting the internal API route and waiting for the server-side
                  OpenAI response.
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="mission-panel p-6">
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
              New Request
            </p>
            <h2 className="mt-2 text-2xl text-slate-50">Send prompt to internal API</h2>

            <label className="mt-5 grid gap-2">
              <span className="text-[0.82rem] uppercase tracking-[0.16em] text-slate-300">
                User input
              </span>
              <textarea
                rows="4"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Describe the engineering coding task to send through the backend proxy."
                className="field-shell resize-y"
              />
            </label>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm leading-6 text-slate-400">
                {pendingValidationId
                  ? "Finish the active HITL review before sending another request."
                  : "Your browser calls only the internal `/api/chat` route."}
              </p>
              <button
                type="submit"
                disabled={isLoading || Boolean(pendingValidationId) || !draft.trim()}
                className={`rounded-3xl border px-5 py-4 text-[0.82rem] uppercase tracking-[0.16em] transition ${
                  isLoading || pendingValidationId || !draft.trim()
                    ? "border-white/10 bg-slate-900/80 text-slate-500"
                    : "border-cyan-400/30 bg-cyan-400/10 text-cyan-200"
                }`}
              >
                {isLoading ? "Loading" : "Send To Secure Proxy"}
              </button>
            </div>
          </form>
        </section>
      </section>
    </main>
  );
}
