import { useState, useRef, useEffect } from "react";

// ─── Brand tokens ────────────────────────────────────────────────
const GOLD = "#B8952A";
const OBSIDIAN = "#0A0A0A";
const CREAM = "#F9F6F0";
const GOLD_LIGHT = "#F0E6C8";
const DARK_GRAY = "#2C2C2C";
const MID_GRAY = "#6B6B6B";
const DIM = "#3A3A3A";

// ─── UPDATE THESE before deploying ───────────────────────────────
const API_BASE = process.env.NODE_ENV === "production"
? "https://algn-api.vercel.app"
  // ← your Vercel backend URL
  : "http://localhost:3000";
const JANE_URL = "https://algn-wellness.janeapp.com"; // ← your Jane App URL

// ─── Assessment data ─────────────────────────────────────────────
const SECTIONS = [
  {
    id: "energy", label: "Energy & Fatigue", icon: "⚡",
    questions: [
      "I feel exhausted even after 7+ hours of sleep",
      "I experience an energy crash in the afternoon",
      "I rely on caffeine to get through my day",
      "Exercise leaves me more depleted than energized",
      "I wake up feeling unrefreshed and sluggish",
    ],
  },
  {
    id: "menstrual", label: "Menstrual Health", icon: "🌙",
    questions: [
      "My cycle is irregular or unpredictable",
      "My periods are very heavy or very light",
      "I experience significant PMS symptoms",
      "I have painful cramping",
    ],
  },
  {
    id: "mood", label: "Mood & Cognition", icon: "🧠",
    questions: [
      "I experience brain fog or difficulty concentrating",
      "I feel anxious without a clear reason",
      "My mood swings throughout my cycle",
      "I feel irritable or short-tempered",
      "I experience low mood or depressive feelings",
    ],
  },
  {
    id: "sleep", label: "Sleep Quality", icon: "💤",
    questions: [
      "I have trouble falling asleep at night",
      "I wake between 2–4am and struggle to fall back asleep",
      "I wake unrefreshed regardless of sleep duration",
    ],
  },
  {
    id: "weight", label: "Weight & Metabolism", icon: "🔥",
    questions: [
      "My weight has changed 10+ lbs without diet changes",
      "I'm accumulating belly fat that wasn't there before",
      "I have intense sugar or carbohydrate cravings",
      "My metabolism feels slower than it used to",
    ],
  },
  {
    id: "pain", label: "Body Pain", icon: "💫",
    questions: [
      "I experience joint pain or stiffness",
      "I get headaches that seem tied to my cycle",
      "I have breast tenderness around my period",
    ],
  },
  {
    id: "gut", label: "Gut & Digestion", icon: "🌿",
    questions: [
      "I experience bloating regularly",
      "I have constipation, diarrhea, or IBS symptoms",
      "I have food sensitivities or reactions",
    ],
  },
];

const AVATAR_OPTIONS = [
  { id: "achiever",     label: "The Achiever",     age: "35–42", desc: "PCOS / hormone imbalance / unexplained weight changes" },
  { id: "transitional", label: "The Transitional", age: "43–52", desc: "Perimenopause / brain fog / sleep changes / mood shifts" },
  { id: "optimized",    label: "The Optimized",    age: "30–38", desc: "Feel awful despite 'normal' labs / want precision answers" },
];

const SCALE = ["Never", "Rarely", "Sometimes", "Often", "Always"];

// ─── Parse report text into named sections ────────────────────────
const REPORT_HEADERS = [
  "YOUR HORMONE PATTERN",
  "WHAT THIS MAY MEAN",
  "YOUR BODY SYSTEM SCORES",
  "RECOMMENDED LAB MARKERS",
  "YOUR NEXT STEP",
  "A NOTE FROM DR. ALEJANDRA",
  "IMPORTANT DISCLAIMER",
];

function parseReport(text) {
  const sections = [];
  for (let i = 0; i < REPORT_HEADERS.length; i++) {
    const h = REPORT_HEADERS[i];
    const next = REPORT_HEADERS[i + 1];
    const start = text.indexOf(h);
    if (start === -1) continue;
    const contentStart = start + h.length;
    const end = next ? text.indexOf(next, contentStart) : text.length;
    sections.push({ header: h, content: text.slice(contentStart, end === -1 ? undefined : end).trim() });
  }
  return sections;
}

// ─── Inline styles ────────────────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: OBSIDIAN, color: CREAM, fontFamily: "'Georgia', serif", display: "flex", flexDirection: "column", alignItems: "center" },
  wrap: { width: "100%", maxWidth: 680, padding: "0 20px 80px" },
  header: { padding: "40px 0 28px", textAlign: "center", borderBottom: `1px solid ${GOLD}30`, marginBottom: 36 },
  brand: { fontSize: 11, letterSpacing: 6, color: GOLD, fontFamily: "Arial,sans-serif", fontWeight: 700, marginBottom: 10 },
  heroTitle: { fontSize: 26, fontWeight: 400, color: CREAM, lineHeight: 1.35, margin: "0 0 6px" },
  heroSub: { fontSize: 14, color: MID_GRAY, fontFamily: "Arial,sans-serif", fontStyle: "italic", margin: 0 },

  stepChip: { fontSize: 10, letterSpacing: 3, color: GOLD, fontFamily: "Arial,sans-serif", textTransform: "uppercase", marginBottom: 6 },
  bar: { height: 2, background: `${GOLD}25`, borderRadius: 2, marginBottom: 36 },
  fill: w => ({ height: "100%", width: `${w}%`, background: GOLD, borderRadius: 2, transition: "width 0.5s ease" }),

  backBtn: { background: "transparent", border: "none", color: MID_GRAY, fontSize: 12, fontFamily: "Arial,sans-serif", cursor: "pointer", padding: "10px 0 0", letterSpacing: 1 },
  sectionTitle: { fontSize: 21, fontWeight: 400, color: CREAM, marginBottom: 6 },
  note: { fontSize: 13, color: MID_GRAY, fontFamily: "Arial,sans-serif", marginBottom: 28, marginTop: 4 },

  // Inputs
  input: { width: "100%", background: "#111", border: `1px solid ${DIM}`, borderRadius: 4, color: CREAM, fontSize: 16, fontFamily: "Arial,sans-serif", padding: "13px 16px", boxSizing: "border-box", outline: "none", marginBottom: 14 },
  textarea: { width: "100%", background: "#111", border: `1px solid ${DIM}`, borderRadius: 4, color: CREAM, fontSize: 14, fontFamily: "Arial,sans-serif", padding: "13px 16px", resize: "vertical", minHeight: 90, boxSizing: "border-box", outline: "none" },
  checkRow: { display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10, cursor: "pointer" },
  checkbox: checked => ({ width: 18, height: 18, borderRadius: 2, border: `1px solid ${checked ? GOLD : "#555"}`, background: checked ? GOLD : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1, transition: "all 0.15s" }),
  checkLabel: { fontSize: 12, color: MID_GRAY, fontFamily: "Arial,sans-serif", lineHeight: 1.5 },

  // Avatar
  avatarCard: sel => ({ padding: "18px 22px", border: `1px solid ${sel ? GOLD : "#333"}`, borderRadius: 6, marginBottom: 10, cursor: "pointer", background: sel ? `${GOLD}14` : "transparent", transition: "all 0.2s" }),
  avatarAge: { fontSize: 10, letterSpacing: 3, color: GOLD, fontFamily: "Arial,sans-serif", marginBottom: 3 },
  avatarName: sel => ({ fontSize: 15, color: sel ? GOLD : CREAM, fontWeight: 400, marginBottom: 2 }),
  avatarDesc: { fontSize: 12, color: MID_GRAY, fontFamily: "Arial,sans-serif" },

  // Questions
  qBlock: { marginBottom: 26 },
  qText: { fontSize: 14, color: CREAM, lineHeight: 1.55, marginBottom: 10, fontFamily: "Arial,sans-serif" },
  scaleRow: { display: "flex", gap: 6, flexWrap: "wrap" },
  scaleBtn: sel => ({ flex: 1, minWidth: 56, padding: "9px 4px", background: sel ? GOLD : "transparent", border: `1px solid ${sel ? GOLD : "#3a3a3a"}`, borderRadius: 3, color: sel ? OBSIDIAN : MID_GRAY, fontSize: 10, fontFamily: "Arial,sans-serif", fontWeight: sel ? 700 : 400, cursor: "pointer", textAlign: "center", transition: "all 0.15s", letterSpacing: 0.3 }),

  // Email gate
  gateBox: { background: "#0f0f0f", border: `1px solid ${GOLD}30`, borderRadius: 8, padding: "36px 32px", textAlign: "center", marginTop: 8 },
  gateIcon: { fontSize: 36, marginBottom: 14 },
  gateTitle: { fontSize: 20, color: CREAM, fontWeight: 400, marginBottom: 8 },
  gateSub: { fontSize: 13, color: MID_GRAY, fontFamily: "Arial,sans-serif", lineHeight: 1.6, marginBottom: 28 },
  gateBullets: { textAlign: "left", marginBottom: 28, background: "#161616", borderRadius: 6, padding: "18px 20px" },
  gateBullet: { fontSize: 13, color: CREAM, fontFamily: "Arial,sans-serif", padding: "5px 0", display: "flex", alignItems: "center", gap: 10 },
  gateDot: { width: 5, height: 5, borderRadius: "50%", background: GOLD, flexShrink: 0 },

  // Primary button
  btn: dis => ({ width: "100%", padding: "15px", background: dis ? "#222" : GOLD, color: dis ? "#555" : OBSIDIAN, border: "none", borderRadius: 4, fontSize: 11, fontFamily: "Arial,sans-serif", fontWeight: 700, letterSpacing: 3, textTransform: "uppercase", cursor: dis ? "not-allowed" : "pointer", marginTop: 28, transition: "all 0.2s" }),
  btnOutline: { width: "100%", padding: "14px", background: "transparent", color: GOLD, border: `1px solid ${GOLD}50`, borderRadius: 4, fontSize: 11, fontFamily: "Arial,sans-serif", fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", cursor: "pointer", marginTop: 16, transition: "all 0.2s" },

  // Loading
  loadBox: { textAlign: "center", padding: "60px 0" },
  loadTitle: { fontSize: 17, color: GOLD, marginBottom: 8 },
  loadSub: { fontSize: 13, color: MID_GRAY, fontFamily: "Arial,sans-serif" },
  spinner: { width: 36, height: 36, border: "2px solid #2a2a2a", borderTop: `2px solid ${GOLD}`, borderRadius: "50%", margin: "28px auto", animation: "spin 0.9s linear infinite" },
  loadSteps: { marginTop: 24, display: "inline-block", textAlign: "left" },
  loadStep: active => ({ fontSize: 12, color: active ? GOLD : "#444", fontFamily: "Arial,sans-serif", padding: "3px 0", transition: "color 0.4s" }),

  // Report
  reportHead: { textAlign: "center", marginBottom: 44, paddingBottom: 28, borderBottom: `1px solid ${GOLD}25` },
  sectionBlock: { marginBottom: 32, paddingBottom: 28, borderBottom: "1px solid #181818" },
  sectionLabel: { fontSize: 10, letterSpacing: 4, color: GOLD, fontFamily: "Arial,sans-serif", fontWeight: 700, textTransform: "uppercase", marginBottom: 12 },
  reportBody: { fontSize: 14, color: CREAM, lineHeight: 1.85, fontFamily: "Arial,sans-serif", whiteSpace: "pre-wrap" },
  scoreRow: { marginBottom: 14 },
  scoreTop: { display: "flex", justifyContent: "space-between", marginBottom: 5 },
  scoreName: { fontSize: 13, color: CREAM, fontFamily: "Arial,sans-serif" },
  scoreNum: { fontSize: 12, color: GOLD, fontFamily: "Arial,sans-serif", fontWeight: 700 },
  scoreTrack: { height: 3, background: "#1e1e1e", borderRadius: 2 },
  scoreBar: (v, max) => { const p = (v / max) * 100; return { height: "100%", width: `${p}%`, background: p > 70 ? "#c0392b" : p > 40 ? GOLD : "#27ae60", borderRadius: 2, transition: "width 1s ease" }; },
  scoreNote: { fontSize: 11, color: MID_GRAY, fontFamily: "Arial,sans-serif", marginTop: 4 },
  labBlock: { paddingBottom: 12, marginBottom: 12, borderBottom: "1px solid #181818" },
  labName: { fontSize: 13, color: GOLD, fontFamily: "Arial,sans-serif", fontWeight: 700, marginBottom: 4 },
  labDesc: { fontSize: 13, color: CREAM, fontFamily: "Arial,sans-serif", lineHeight: 1.6 },
  ctaBox: { background: `${GOLD}12`, border: `1px solid ${GOLD}35`, borderRadius: 8, padding: "28px 24px" },
  ctaTitle: { fontSize: 18, color: GOLD, fontWeight: 400, marginBottom: 10 },
  ctaBody: { fontSize: 13, color: CREAM, fontFamily: "Arial,sans-serif", lineHeight: 1.75, marginBottom: 20 },
  ctaBtn: { display: "inline-block", padding: "13px 30px", background: GOLD, color: OBSIDIAN, fontFamily: "Arial,sans-serif", fontWeight: 700, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", border: "none", borderRadius: 4, cursor: "pointer" },
  disclaimer: { fontSize: 11, color: "#555", fontFamily: "Arial,sans-serif", lineHeight: 1.6, background: "#0d0d0d", borderRadius: 4, padding: "18px 20px", marginTop: 8 },
  successBadge: { display: "inline-flex", alignItems: "center", gap: 8, background: `#27ae6015`, border: `1px solid #27ae6040`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "#27ae60", fontFamily: "Arial,sans-serif", marginBottom: 20 },
};

// ─── Score renderer ───────────────────────────────────────────────
function ScoreSection({ content }) {
  const lines = content.split("\n").filter(l => l.trim());
  return (
    <div>
      {lines.map((line, i) => {
        const m = line.match(/^(.+?):\s*(\d+)\/10\s*[—–-]\s*(.+)$/);
        if (!m) return null;
        const [, name, score, note] = m;
        const val = parseInt(score);
        return (
          <div key={i} style={S.scoreRow}>
            <div style={S.scoreTop}>
              <span style={S.scoreName}>{name.trim()}</span>
              <span style={S.scoreNum}>{val}/10</span>
            </div>
            <div style={S.scoreTrack}>
              <div style={S.scoreBar(val, 10)} />
            </div>
            <div style={S.scoreNote}>{note.trim()}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Lab renderer ─────────────────────────────────────────────────
function LabSection({ content }) {
  const items = content.split("\n").filter(l => l.trim());
  const labs = [];
  let cur = null;
  for (const line of items) {
    const s = line.replace(/^[•\-\*]\s*/, "").trim();
    if (s.includes(":") && s.length < 80) {
      if (cur) labs.push(cur);
      const ci = s.indexOf(":");
      cur = { name: s.slice(0, ci).trim(), desc: s.slice(ci + 1).trim() };
    } else if (cur && s) {
      cur.desc += " " + s;
    }
  }
  if (cur) labs.push(cur);
  if (!labs.length) return <p style={{ ...S.reportBody, fontSize: 13 }}>{content}</p>;
  return (
    <div>
      {labs.map((lab, i) => (
        <div key={i} style={S.labBlock}>
          <div style={S.labName}>{lab.name}</div>
          <div style={S.labDesc}>{lab.desc}</div>
        </div>
      ))}
      <p style={{ fontSize: 11, color: MID_GRAY, fontFamily: "Arial,sans-serif", marginTop: 8, fontStyle: "italic" }}>
        All markers available through Rupa Health.
      </p>
    </div>
  );
}

// ─── Email gate component ─────────────────────────────────────────
function EmailGate({ firstName, onSubmit, loading }) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const valid = email.includes("@") && email.includes(".") && consent;

  return (
    <div style={S.gateBox}>
      <div style={S.gateIcon}>✨</div>
      <div style={S.gateTitle}>Your report is ready, {firstName}</div>
      <p style={S.gateSub}>
        Enter your email to receive your personalized hormone report — and Dr. Alejandra will send you a clinical note with your recommended next step.
      </p>

      <div style={S.gateBullets}>
        {[
          "Your personalized Hormone Assessment Report",
          "4 functional lab markers for your pattern",
          "Your recommended ALGN program path",
          "A follow-up note from Dr. Alejandra",
        ].map((item, i) => (
          <div key={i} style={S.gateBullet}>
            <div style={S.gateDot} />
            {item}
          </div>
        ))}
      </div>

      <input
        style={S.input}
        type="email"
        placeholder="your@email.com"
        value={email}
        onChange={e => setEmail(e.target.value)}
        onKeyDown={e => e.key === "Enter" && valid && onSubmit(email)}
        autoFocus
      />

      <div style={S.checkRow} onClick={() => setConsent(c => !c)}>
        <div style={S.checkbox(consent)}>
          {consent && <span style={{ color: OBSIDIAN, fontSize: 11, fontWeight: 700, lineHeight: 1 }}>✓</span>}
        </div>
        <span style={S.checkLabel}>
          I agree to receive my report and occasional wellness insights from ALGN Wellness. I can unsubscribe anytime. No spam, ever.
        </span>
      </div>

      <button
        style={S.btn(!valid || loading)}
        disabled={!valid || loading}
        onClick={() => onSubmit(email)}
      >
        {loading ? "Sending…" : "Send My Report →"}
      </button>

      <p style={{ fontSize: 11, color: "#444", fontFamily: "Arial,sans-serif", marginTop: 14, lineHeight: 1.5 }}>
        Your information is private and confidential. ALGN Wellness does not sell or share your data.
      </p>
    </div>
  );
}

// ─── Loading states ───────────────────────────────────────────────
const LOAD_STEPS = [
  "Analyzing your symptom patterns…",
  "Identifying your hormone drivers…",
  "Calculating your body system scores…",
  "Selecting your lab recommendations…",
  "Composing your personal report…",
];

function LoadingView() {
  const [activeStep, setActiveStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setActiveStep(s => Math.min(s + 1, LOAD_STEPS.length - 1)), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={S.loadBox}>
      <div style={S.loadTitle}>Generating your report</div>
      <div style={S.loadSub}>Dr. Alejandra's AI is analyzing your assessment</div>
      <div style={S.spinner} />
      <div style={S.loadSteps}>
        {LOAD_STEPS.map((step, i) => (
          <div key={i} style={S.loadStep(i <= activeStep)}>
            {i < activeStep ? "✓ " : i === activeStep ? "→ " : "  "}{step}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────
export default function App() {
  // Steps: 0=name, 1=avatar, 2..N+1=sections, N+2=opentext, N+3=emailgate
  const SECTION_COUNT = SECTIONS.length;
  const EMAIL_STEP = 2 + SECTION_COUNT + 1;
  const TOTAL_STEPS = EMAIL_STEP + 1;

  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [scores, setScores] = useState({});
  const [openText, setOpenText] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const [gateLoading, setGateLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [report, setReport] = useState(null);
  const [parsedSections, setParsedSections] = useState([]);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [error, setError] = useState("");

  const reportRef = useRef(null);

  useEffect(() => {
    if (report) {
      setParsedSections(parseReport(report));
      setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [report]);

  const isNameStep = step === 0;
  const isAvatarStep = step === 1;
  const sectionIndex = step - 2;
  const isSectionStep = step >= 2 && step < 2 + SECTION_COUNT;
  const isOpenTextStep = step === 2 + SECTION_COUNT;
  const isEmailStep = step === EMAIL_STEP;

  const progressPct = Math.round((step / (TOTAL_STEPS - 1)) * 100);

  function setScore(key, val) {
    setScores(p => ({ ...p, [key]: val }));
  }

  function sectionComplete() {
    if (!isSectionStep) return true;
    return SECTIONS[sectionIndex].questions.every((_, qi) => scores[`${SECTIONS[sectionIndex].id}-${qi}`] !== undefined);
  }

  function canProceed() {
    if (isNameStep) return firstName.trim().length >= 2;
    if (isAvatarStep) return avatar !== null;
    if (isSectionStep) return sectionComplete();
    return true;
  }

  function next() {
    setStep(s => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Step 1: capture email + submit to backend lead endpoint
  async function handleEmailSubmit(submittedEmail) {
    setGateLoading(true);
    setError("");
    try {
      // Fire lead capture — don't block on it
      fetch(`${API_BASE}/api/lead`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: submittedEmail.trim().toLowerCase(),
          avatar,
          stage: "assessment_completed",
        }),
      }).catch(() => {}); // non-blocking — continue even if this fails

      setEmail(submittedEmail.trim().toLowerCase());
      setLeadCaptured(true);
      setGateLoading(false);

      // Step 2: generate report
      await generateReport(submittedEmail.trim().toLowerCase());
    } catch (e) {
      setGateLoading(false);
      setError("Something went wrong. Please try again.");
    }
  }

  async function generateReport(capturedEmail) {
    setReportLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/assess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          email: capturedEmail || email,
          avatar,
          scores,
          openText,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Server error");
      }
      const data = await res.json();
      setReport(data.report || "");
    } catch (e) {
      setReport(
        "YOUR HORMONE PATTERN\nWe encountered an issue generating your personalized report. Please try again or contact Dr. Alejandra directly.\n\nIMPORTANT DISCLAIMER\nThis tool is for educational purposes only and does not constitute medical advice."
      );
    }
    setReportLoading(false);
  }

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div style={S.app}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button:focus { outline: 2px solid ${GOLD}60; }
        input:focus, textarea:focus { border-color: ${GOLD} !important; }
      `}</style>

      <div style={S.wrap}>

        {/* Header */}
        <div style={S.header}>
          <div style={S.brand}>ALGN WELLNESS</div>
          <h1 style={S.heroTitle}>Women's Hormone Assessment</h1>
          <p style={S.heroSub}>Your biology, decoded in 5 minutes</p>
        </div>

        {/* ── Pre-report flow ── */}
        {!report && !reportLoading && (
          <>
            {/* Progress bar */}
            {!isEmailStep && (
              <div style={{ marginBottom: 28 }}>
                <div style={S.stepChip}>
                  {isNameStep ? "Get Started" :
                   isAvatarStep ? "Your Profile" :
                   isSectionStep ? `${sectionIndex + 1} of ${SECTION_COUNT} — ${SECTIONS[sectionIndex].label}` :
                   "Final Step"}
                </div>
                <div style={S.bar}><div style={S.fill(progressPct)} /></div>
              </div>
            )}

            {/* Back button */}
            {step > 0 && !isEmailStep && (
              <button style={S.backBtn} onClick={() => { setStep(s => s - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}>
                ← Back
              </button>
            )}

            {/* Name */}
            {isNameStep && (
              <div>
                <div style={S.sectionTitle}>Let's start with your name</div>
                <p style={S.note}>We'll personalize your report just for you.</p>
                <input style={S.input} type="text" placeholder="First name" value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && canProceed() && next()}
                  autoFocus />
              </div>
            )}

            {/* Avatar */}
            {isAvatarStep && (
              <div>
                <div style={S.sectionTitle}>Which best describes you?</div>
                <p style={S.note}>Choose the profile that feels most familiar.</p>
                {AVATAR_OPTIONS.map(a => (
                  <div key={a.id} style={S.avatarCard(avatar === a.id)} onClick={() => setAvatar(a.id)}>
                    <div style={S.avatarAge}>{a.age}</div>
                    <div style={S.avatarName(avatar === a.id)}>{a.label}</div>
                    <div style={S.avatarDesc}>{a.desc}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Symptom sections */}
            {isSectionStep && (() => {
              const sec = SECTIONS[sectionIndex];
              return (
                <div>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{sec.icon}</div>
                  <div style={S.sectionTitle}>{sec.label}</div>
                  <p style={S.note}>Rate how often each applies to you.</p>
                  {sec.questions.map((q, qi) => {
                    const key = `${sec.id}-${qi}`;
                    return (
                      <div key={qi} style={S.qBlock}>
                        <div style={S.qText}>{q}</div>
                        <div style={S.scaleRow}>
                          {SCALE.map((label, val) => (
                            <button key={val} style={S.scaleBtn(scores[key] === val)} onClick={() => setScore(key, val)}>
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* Open text */}
            {isOpenTextStep && (
              <div>
                <div style={S.sectionTitle}>In your own words</div>
                <p style={S.note}>What's bothering you most? What do you want to feel like? <span style={{ color: "#444" }}>(Optional)</span></p>
                <textarea style={S.textarea} placeholder="Tell Dr. Alejandra what's going on…"
                  value={openText} onChange={e => setOpenText(e.target.value)} rows={5} />
              </div>
            )}

            {/* Email gate — shown after questions */}
            {isEmailStep && (
              <>
                {error && <p style={{ color: "#e74c3c", fontFamily: "Arial,sans-serif", fontSize: 13, marginBottom: 12 }}>{error}</p>}
                <EmailGate firstName={firstName} onSubmit={handleEmailSubmit} loading={gateLoading} />
              </>
            )}

            {/* CTA button (not on email step) */}
            {!isEmailStep && (
              <button style={S.btn(!canProceed())} disabled={!canProceed()} onClick={next}>
                {isOpenTextStep ? "Continue to Your Report →" : "Continue →"}
              </button>
            )}
          </>
        )}

        {/* ── Loading ── */}
        {reportLoading && <LoadingView />}

        {/* ── Report ── */}
        {report && !reportLoading && (
          <div ref={reportRef}>
            {/* Report header */}
            <div style={S.reportHead}>
              <div style={S.brand}>ALGN WELLNESS</div>
              {leadCaptured && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                  <div style={S.successBadge}>✓ Report sent to {email}</div>
                </div>
              )}
              <h2 style={{ fontSize: 22, fontWeight: 400, color: CREAM, margin: "0 0 4px" }}>
                {firstName}'s Hormone Assessment Report
              </h2>
              <p style={{ fontSize: 12, color: MID_GRAY, fontFamily: "Arial,sans-serif", margin: 0 }}>
                Prepared by Dr. Alejandra, DC · For educational purposes only
              </p>
            </div>

            {parsedSections.map((sec, i) => {
              if (sec.header === "IMPORTANT DISCLAIMER") {
                return <div key={i} style={S.disclaimer}><strong style={{ fontSize: 10, letterSpacing: 2, color: "#555" }}>NOTICE</strong><p style={{ margin: "6px 0 0", fontSize: 11, lineHeight: 1.6 }}>{sec.content}</p></div>;
              }
              if (sec.header === "YOUR NEXT STEP") {
                return (
                  <div key={i} style={{ marginBottom: 32 }}>
                    <div style={S.sectionLabel}>{sec.header}</div>
                    <div style={S.ctaBox}>
                      <div style={S.ctaTitle}>Your Path Forward</div>
                      <div style={S.ctaBody}>{sec.content}</div>
                      <button style={S.ctaBtn} onClick={() => window.open(JANE_URL, "_blank")}>Book Your Session →</button>
                    </div>
                  </div>
                );
              }
              if (sec.header === "YOUR BODY SYSTEM SCORES") {
                return <div key={i} style={S.sectionBlock}><div style={S.sectionLabel}>{sec.header}</div><ScoreSection content={sec.content} /></div>;
              }
              if (sec.header === "RECOMMENDED LAB MARKERS") {
                return <div key={i} style={S.sectionBlock}><div style={S.sectionLabel}>{sec.header}</div><LabSection content={sec.content} /></div>;
              }
              return (
                <div key={i} style={sec.header === "A NOTE FROM DR. ALEJANDRA" ? { marginBottom: 32 } : S.sectionBlock}>
                  <div style={S.sectionLabel}>{sec.header}</div>
                  <div style={S.reportBody}>{sec.content}</div>
                </div>
              );
            })}

            <button style={S.btnOutline} onClick={() => { setStep(0); setReport(null); setScores({}); setAvatar(null); setFirstName(""); setOpenText(""); setEmail(""); setLeadCaptured(false); window.scrollTo({ top: 0 }); }}>
              Start a New Assessment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
