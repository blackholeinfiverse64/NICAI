import { useState } from "react";

/** Samachar API (local or your team’s server) */
const SAMACHAR_API_BASE = "http://localhost:8000";
/** Mitra API — deployed backend */
const MITRA_API_BASE = "https://ai-assistant-backend-8hur.onrender.com";

const MARITIME_SCENARIO =
  "Multiple reports indicate a vessel operating in restricted waters near a coastal zone. Movement pattern suggests loitering behavior with intermittent communication signals. No authorized activity recorded for this region.";

const ENVIRONMENTAL_SCENARIO =
  "Recent field reports indicate abnormal changes in water quality levels across multiple monitoring points. Possible contamination event suspected with inconsistent readings from different sources.";

const STEPS = {
  IDLE: "idle",
  SAMACHAR: "samachar",
  MITRA: "mitra",
  DONE: "done",
};

function StatusBadge({ status }) {
  if (!status) return null;
  const upper = String(status).toUpperCase();
  const color =
    upper === "ALLOW" ? "#22c55e" : upper === "BLOCK" ? "#ef4444" : "#f59e0b";
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 10px",
        borderRadius: 4,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: 1,
        color: "#000",
        background: color,
      }}
    >
      {upper}
    </span>
  );
}

function PipelineStep({ number, label, active, done }) {
  const bg = done
    ? "rgba(59,130,246,0.15)"
    : active
      ? "rgba(59,130,246,0.08)"
      : "transparent";
  const border = done
    ? "#3b82f6"
    : active
      ? "#3b82f6"
      : "#1e293b";
  const numBg = done ? "#3b82f6" : active ? "#3b82f6" : "#1e293b";
  const textColor = done || active ? "#e2e8f0" : "#475569";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 14px",
        borderRadius: 8,
        border: `1px solid ${border}`,
        background: bg,
        flex: 1,
        transition: "all 0.3s ease",
        boxShadow: active ? "0 0 20px rgba(59,130,246,0.15)" : "none",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: numBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: done || active ? "#fff" : "#64748b",
          flexShrink: 0,
          transition: "all 0.3s ease",
        }}
      >
        {done ? "✓" : number}
      </div>
      <span
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: textColor,
          transition: "color 0.3s ease",
        }}
      >
        {label}
      </span>
      {active && (
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#3b82f6",
            marginLeft: "auto",
            animation: "pulse 1.5s ease-in-out infinite",
          }}
        />
      )}
    </div>
  );
}

function PipelineArrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M7 4l6 6-6 6"
        stroke="#334155"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  const [input, setInput] = useState("");
  const [samacharResult, setSamacharResult] = useState(null);
  const [mitraResult, setMitraResult] = useState(null);
  const [samacharError, setSamacharError] = useState(null);
  const [mitraError, setMitraError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.IDLE);

  async function handleProcess() {
    if (!input.trim()) {
      setSamacharError("Error processing request");
      setSamacharResult(null);
      setMitraResult(null);
      setMitraError(null);
      setCurrentStep(STEPS.IDLE);
      return;
    }

    setSamacharResult(null);
    setSamacharError(null);
    setMitraResult(null);
    setMitraError(null);
    setLoading(true);

    setCurrentStep(STEPS.SAMACHAR);
    let samacharData;
    try {
      const res = await fetch(`${SAMACHAR_API_BASE}/api/samachar/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });
      if (!res.ok) throw new Error(res.statusText);
      samacharData = await res.json();
      setSamacharResult(samacharData);
    } catch {
      setSamacharError("Error processing request");
      setLoading(false);
      setCurrentStep(STEPS.IDLE);
      return;
    }

    setCurrentStep(STEPS.MITRA);
    try {
      const res = await fetch(`${MITRA_API_BASE}/api/mitra/evaluate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: samacharData }),
      });
      if (!res.ok) throw new Error(res.statusText);
      const mitraData = await res.json();
      setMitraResult(mitraData);
    } catch {
      setMitraError("Error processing request");
    }

    setLoading(false);
    setCurrentStep(STEPS.DONE);
  }

  const samacharDone = currentStep === STEPS.MITRA || currentStep === STEPS.DONE;
  const mitraDone = currentStep === STEPS.DONE;

  return (
    <div style={styles.root}>
      <style>{keyframes}</style>

      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logoGroup}>
            <div style={styles.logoIcon}>N</div>
            <div>
              <div style={styles.logoText}>NICAI</div>
              <div style={styles.logoSub}>Intelligence Platform</div>
            </div>
          </div>
          <div style={styles.badge}>DEMO</div>
        </div>
      </header>

      <main style={styles.main}>
        {/* PIPELINE TRACKER */}
        <div style={styles.pipeline}>
          <PipelineStep
            number={1}
            label="Input"
            active={currentStep === STEPS.IDLE}
            done={currentStep !== STEPS.IDLE}
          />
          <PipelineArrow />
          <PipelineStep
            number={2}
            label="Samachar — Extract"
            active={currentStep === STEPS.SAMACHAR}
            done={samacharDone}
          />
          <PipelineArrow />
          <PipelineStep
            number={3}
            label="Mitra — Evaluate"
            active={currentStep === STEPS.MITRA}
            done={mitraDone}
          />
        </div>

        {/* SECTION 1: INPUT */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.dot} />
            <h2 style={styles.cardTitle}>Demo Scenario Input</h2>
          </div>
          <div style={styles.scenarioBtns}>
            <button
              style={styles.scenarioBtn}
              onClick={() => setInput(MARITIME_SCENARIO)}
            >
              <span style={styles.scenarioBtnIcon}>⚓</span>
              Load Maritime Scenario
            </button>
            <button
              style={styles.scenarioBtn}
              onClick={() => setInput(ENVIRONMENTAL_SCENARIO)}
            >
              <span style={styles.scenarioBtnIcon}>🌊</span>
              Load Environmental Scenario
            </button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={5}
            placeholder="Enter scenario text or load a preset above..."
            style={styles.textarea}
          />
          <button
            onClick={handleProcess}
            disabled={loading}
            style={{
              ...styles.processBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading && <span style={styles.spinner} />}
            {loading
              ? currentStep === STEPS.SAMACHAR
                ? "Processing Samachar..."
                : "Processing Mitra..."
              : "Process Pipeline"}
          </button>
        </section>

        {/* OUTPUT GRID */}
        <div style={styles.outputGrid}>
          {/* SECTION 2: SAMACHAR */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.dot, background: "#3b82f6" }} />
              <h2 style={styles.cardTitle}>Samachar Output</h2>
              {samacharDone && (
                <span style={styles.successTag}>Complete</span>
              )}
            </div>
            {samacharError && (
              <div style={styles.errorBox}>{samacharError}</div>
            )}
            {samacharResult && (
              <pre style={styles.jsonPre}>
                {JSON.stringify(samacharResult, null, 2)}
              </pre>
            )}
            {!samacharError && !samacharResult && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>📡</div>
                <div style={styles.emptyText}>
                  Awaiting input. Click &quot;Process Pipeline&quot; to begin.
                </div>
              </div>
            )}
          </section>

          {/* SECTION 3: MITRA */}
          <section style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={{ ...styles.dot, background: "#8b5cf6" }} />
              <h2 style={styles.cardTitle}>Mitra Output</h2>
              {mitraDone && mitraResult?.status && (
                <StatusBadge status={mitraResult.status} />
              )}
            </div>
            {mitraError && (
              <div style={styles.errorBox}>{mitraError}</div>
            )}
            {mitraResult && (
              <pre style={styles.jsonPre}>
                {JSON.stringify(mitraResult, null, 2)}
              </pre>
            )}
            {!mitraError && !mitraResult && (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🛡️</div>
                <div style={styles.emptyText}>
                  Waiting for Samachar extraction to complete.
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={styles.footer}>
        NICAI Intelligence Platform — Demo Environment
      </footer>
    </div>
  );
}

const keyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.6); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0;
    background: #030712;
  }
  ::selection {
    background: rgba(59,130,246,0.4);
  }
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  ::-webkit-scrollbar-track {
    background: #0f172a;
  }
  ::-webkit-scrollbar-thumb {
    background: #1e293b;
    border-radius: 3px;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #334155;
  }
`;

const styles = {
  root: {
    minHeight: "100vh",
    background: "#030712",
    color: "#e2e8f0",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    borderBottom: "1px solid #111827",
    background: "rgba(3,7,18,0.8)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  headerInner: {
    maxWidth: 1440,
    margin: "0 auto",
    padding: "14px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoGroup: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 800,
    color: "#fff",
    boxShadow: "0 0 20px rgba(59,130,246,0.3)",
  },
  logoText: {
    fontSize: 18,
    fontWeight: 700,
    color: "#f1f5f9",
    letterSpacing: 1.5,
  },
  logoSub: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: 500,
    letterSpacing: 0.5,
  },
  badge: {
    padding: "4px 12px",
    borderRadius: 6,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1.2,
    color: "#3b82f6",
    border: "1px solid rgba(59,130,246,0.3)",
    background: "rgba(59,130,246,0.08)",
  },
  main: {
    flex: 1,
    maxWidth: 1440,
    margin: "0 auto",
    padding: "28px 32px",
    width: "100%",
  },
  pipeline: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 28,
  },
  card: {
    background: "#0a0f1a",
    border: "1px solid #151d2e",
    borderRadius: 12,
    padding: 24,
    marginBottom: 20,
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#1e293b",
    flexShrink: 0,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#cbd5e1",
    margin: 0,
    letterSpacing: 0.3,
  },
  successTag: {
    marginLeft: "auto",
    padding: "2px 10px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 600,
    color: "#22c55e",
    background: "rgba(34,197,94,0.1)",
    border: "1px solid rgba(34,197,94,0.2)",
  },
  scenarioBtns: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
    flexWrap: "wrap",
  },
  scenarioBtn: {
    padding: "9px 16px",
    borderRadius: 8,
    border: "1px solid #1e293b",
    background: "#0f172a",
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.15s ease",
  },
  scenarioBtnIcon: {
    fontSize: 15,
  },
  textarea: {
    width: "100%",
    minHeight: 120,
    padding: 14,
    borderRadius: 8,
    border: "1px solid #1e293b",
    background: "#0f172a",
    color: "#e2e8f0",
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.6,
    resize: "vertical",
    outline: "none",
    transition: "border-color 0.2s ease",
  },
  processBtn: {
    marginTop: 14,
    width: "100%",
    padding: "12px 20px",
    borderRadius: 8,
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    fontFamily: "'Inter', sans-serif",
    letterSpacing: 0.3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow: "0 0 24px rgba(37,99,235,0.25)",
    transition: "all 0.15s ease",
  },
  spinner: {
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.25)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
  },
  outputGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  errorBox: {
    padding: "12px 16px",
    borderRadius: 8,
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#f87171",
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'JetBrains Mono', monospace",
  },
  jsonPre: {
    margin: 0,
    padding: 16,
    borderRadius: 8,
    background: "#0f172a",
    border: "1px solid #1e293b",
    color: "#7dd3fc",
    fontSize: 12.5,
    lineHeight: 1.7,
    fontFamily: "'JetBrains Mono', monospace",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  emptyState: {
    padding: "32px 16px",
    textAlign: "center",
  },
  emptyIcon: {
    fontSize: 28,
    marginBottom: 10,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.5,
  },
  footer: {
    borderTop: "1px solid #111827",
    padding: "16px 32px",
    textAlign: "center",
    fontSize: 12,
    color: "#334155",
    letterSpacing: 0.5,
  },
};
