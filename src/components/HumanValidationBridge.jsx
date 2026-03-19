import React from "react";

const validationChecklist = [
  {
    id: "accuracy",
    title: "Technical accuracy verified",
    owner: "Engineering",
    detail:
      "The logic matches system requirements, expected architecture, and interface contracts.",
  },
  {
    id: "safety",
    title: "Safety standards reviewed",
    owner: "Safety",
    detail:
      "The proposed change does not introduce hazardous behavior, unstable execution paths, or operational regressions.",
  },
  {
    id: "ethics",
    title: "DoD and DON responsible AI guidance checked",
    owner: "Compliance",
    detail:
      "The recommendation supports accountability, traceability, and governable human oversight.",
  },
  {
    id: "bias",
    title: "Bias and unfair assumptions checked",
    owner: "Ethics",
    detail:
      "The output was reviewed for skewed assumptions, unfair impact, or misleading framing.",
  },
  {
    id: "hallucination",
    title: "Evidence and hallucination review completed",
    owner: "Reliability",
    detail:
      "Claims are grounded in project context, engineering evidence, or reviewer validation rather than unsupported generation.",
  },
  {
    id: "authority",
    title: "Human final authority confirmed",
    owner: "Oversight",
    detail:
      "The implementation decision is being made by the assigned engineer, not by the model.",
  },
];

export default function HumanValidationBridge({
  checkedItems,
  engineerName,
  missionNotes,
  decision,
  onChecklistToggle,
  onEngineerNameChange,
  onMissionNotesChange,
  onDecisionChange,
  onAccept,
  canAccept,
  unresolvedGaps,
}) {
  const completedChecks = validationChecklist.filter(
    (item) => checkedItems[item.id]
  ).length;

  return (
    <section className="mt-5 rounded-3xl border border-cyan-400/20 bg-slate-950/80 p-5">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
            Human-In-The-Loop Validation
          </p>
          <h3 className="mt-2 text-xl text-slate-50">Mandatory engineer review</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            This AI suggestion cannot be accepted until a human reviewer verifies
            technical accuracy, safety, and responsible AI compliance.
          </p>
        </div>
        <span className="status-pill">
          {completedChecks}/{validationChecklist.length} complete
        </span>
      </div>

      <div className="grid gap-4">
        {validationChecklist.map((item) => {
          const checked = Boolean(checkedItems[item.id]);

          return (
            <label
              key={item.id}
              className={`grid grid-cols-[24px_1fr] items-start gap-4 rounded-3xl border p-4 transition hover:border-cyan-300/40 ${
                checked
                  ? "border-emerald-400/40 bg-emerald-950/20"
                  : "border-white/10 bg-slate-900/80"
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onChecklistToggle(item.id)}
                className="mt-1 h-[18px] w-[18px] accent-cyan-400"
              />
              <div>
                <div className="mb-2 flex items-start justify-between gap-3 max-sm:grid">
                  <h4 className="text-base text-slate-50">{item.title}</h4>
                  <span className="text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">
                    {item.owner}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-300">{item.detail}</p>
              </div>
            </label>
          );
        })}
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span className="text-[0.82rem] uppercase tracking-[0.16em] text-slate-300">
            Reviewing engineer
          </span>
          <input
            type="text"
            value={engineerName}
            onChange={(event) => onEngineerNameChange(event.target.value)}
            placeholder="Name / team / authority"
            className="field-shell"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-[0.82rem] uppercase tracking-[0.16em] text-slate-300">
            Validation notes
          </span>
          <textarea
            rows="4"
            value={missionNotes}
            onChange={(event) => onMissionNotesChange(event.target.value)}
            placeholder="Document evidence, safety review, ethical considerations, and disposition."
            className="field-shell resize-y"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <button
            type="button"
            onClick={() => onDecisionChange("approve")}
            className={`rounded-3xl border p-4 text-left transition hover:border-cyan-300/40 ${
              decision === "approve"
                ? "border-emerald-400/40 bg-emerald-950/25"
                : "border-white/10 bg-slate-900/80"
            }`}
          >
            <span className="block text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
              Approve
            </span>
            <strong className="mt-2 block text-slate-50">
              Allow controlled acceptance
            </strong>
          </button>

          <button
            type="button"
            onClick={() => onDecisionChange("reject")}
            className={`rounded-3xl border p-4 text-left transition hover:border-cyan-300/40 ${
              decision === "reject"
                ? "border-red-400/40 bg-red-950/25"
                : "border-white/10 bg-slate-900/80"
            }`}
          >
            <span className="block text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
              Reject
            </span>
            <strong className="mt-2 block text-slate-50">
              Block and escalate for correction
            </strong>
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-3xl border border-white/10 bg-slate-900/80 p-4">
        <p className="text-[0.72rem] uppercase tracking-[0.16em] text-cyan-glow">
          Blocking conditions
        </p>
        <ul className="mt-3 grid gap-2 pl-5 text-sm text-slate-300">
          {unresolvedGaps.map((gap) => (
            <li key={gap}>{gap}</li>
          ))}
          {unresolvedGaps.length === 0 && (
            <li>All required human validation checks are complete.</li>
          )}
        </ul>
      </div>

      <button
        type="button"
        disabled={!canAccept}
        onClick={onAccept}
        className={`mt-5 w-full rounded-3xl border px-5 py-4 text-[0.82rem] uppercase tracking-[0.16em] transition ${
          canAccept
            ? "border-emerald-400/30 bg-emerald-950/30 text-emerald-300"
            : "border-white/10 bg-slate-900/80 text-slate-500"
        }`}
      >
        {canAccept ? "Accept Suggestion" : "Awaiting Human Validation"}
      </button>
    </section>
  );
}
