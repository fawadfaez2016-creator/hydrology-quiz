import { useState, useEffect, useMemo, useCallback } from "react";
import { allQuestions } from "./questions";

/* ------------------------------------------------------------------ *
 * Data contract unchanged: allQuestions[key] = [{question, options,
 * answer, explanation?}]. Keys must match questions.js.
 * ------------------------------------------------------------------ */
const CHAPTERS = [
  { key: "chapter1", n: 1, icon: "🌍", title: "Hydrologic Principles", c1: "#0ea5e9", c2: "#2563eb" },
  { key: "chapter2", n: 2, icon: "📊", title: "Hydrologic Analysis", c1: "#10b981", c2: "#0d9488" },
  { key: "chapter3", n: 3, icon: "📈", title: "Frequency Analysis", c1: "#f59e0b", c2: "#ea580c" },
  { key: "chapter4", n: 4, icon: "🌊", title: "Flood Routing", c1: "#06b6d4", c2: "#0284c7" },
  { key: "chapter5", n: 5, icon: "🖥️", title: "Simulation Models", c1: "#8b5cf6", c2: "#7c3aed" },
  { key: "chapter6", n: 6, icon: "🏙️", title: "Urban Hydrology", c1: "#f43f5e", c2: "#e11d48" },
  { key: "chapter7", n: 7, icon: "💧", title: "Ground Water Hydrology", c1: "#3b82f6", c2: "#4f46e5" },
  { key: "chapter8", n: 8, icon: "🗺️", title: "GIS & Spatial Info", c1: "#84cc16", c2: "#16a34a" },
  { key: "chapter9", n: 9, icon: "📡", title: "Radar Rainfall", c1: "#d946ef", c2: "#9333ea" },
];
const SPECIAL = {
  exercises: { title: "Exercises · Formulas & Graphs", icon: "📐", c1: "#f59e0b", c2: "#f97316" },
  pastYears: { title: "Past Year Questions", icon: "🗂️", c1: "#f43f5e", c2: "#e11d48" },
};
const LETTERS = ["A", "B", "C", "D", "E", "F"];
const getQuestions = (k) => (allQuestions && allQuestions[k]) || [];

/* ---------- theme palettes ---------- */
const THEMES = {
  dark: {
    bg: "#0a0e1a", grad: "radial-gradient(1100px 600px at 12% -8%, rgba(99,102,241,.18), transparent 60%), radial-gradient(900px 500px at 100% 0%, rgba(20,184,166,.14), transparent 55%), #0a0e1a",
    text: "#e8edf6", sub: "#93a2b8", faint: "#64748b",
    card: "rgba(255,255,255,0.045)", cardBorder: "rgba(255,255,255,0.09)", cardHover: "rgba(255,255,255,0.18)",
    chip: "rgba(255,255,255,0.06)", track: "rgba(255,255,255,0.10)",
    okBg: "rgba(16,185,129,.16)", okBorder: "#10b981", noBg: "rgba(244,63,94,.16)", noBorder: "#f43f5e",
    whyBg: "rgba(56,189,248,.10)", whyBorder: "rgba(56,189,248,.35)", shadow: "0 20px 50px -20px rgba(0,0,0,.7)",
  },
  light: {
    bg: "#eef2f9", grad: "radial-gradient(1000px 560px at 10% -10%, rgba(99,102,241,.12), transparent 60%), radial-gradient(820px 460px at 100% 0%, rgba(13,148,136,.10), transparent 55%), #eef2f9",
    text: "#0f172a", sub: "#566173", faint: "#94a3b8",
    card: "#ffffff", cardBorder: "#e6eaf2", cardHover: "#cdd6e6",
    chip: "#f1f5f9", track: "#e2e8f0",
    okBg: "#ecfdf5", okBorder: "#10b981", noBg: "#fff1f2", noBorder: "#f43f5e",
    whyBg: "#f0f9ff", whyBorder: "#bae6fd", shadow: "0 18px 40px -24px rgba(15,23,42,.35)",
  },
};

export default function App() {
  const [dark, setDark] = useState(true);
  const [chapter, setChapter] = useState(null);
  const [order, setOrder] = useState([]);
  const [pos, setPos] = useState(0);
  const [selected, setSelected] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  /* password gate for the Exercises section */
  const EXERCISE_PASSWORD = "FOADFOAD";
  const [unlocked, setUnlocked] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState(false);

  const openSection = (key) => {
    if (key === "exercises" && !unlocked) {
      setPwInput(""); setPwError(false); setGateOpen(true);
      return;
    }
    startChapter(key);
  };
  const submitPassword = () => {
    if (pwInput.trim() === EXERCISE_PASSWORD) {
      setUnlocked(true); setGateOpen(false); setPwError(false);
      startChapter("exercises");
    } else {
      setPwError(true);
    }
  };

  /* theme init + persist (guarded for SSR / restricted envs) */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("hydro-theme");
      if (saved) setDark(saved === "dark");
      else if (window.matchMedia) setDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    } catch {}
  }, []);
  useEffect(() => { try { localStorage.setItem("hydro-theme", dark ? "dark" : "light"); } catch {} }, [dark]);

  const T = dark ? THEMES.dark : THEMES.light;

  const questions = useMemo(() => getQuestions(chapter), [chapter]);
  const qIndex = order[pos];
  const question = questions[qIndex];
  const score = useMemo(() => Object.values(answers).filter((a) => a.correct).length, [answers]);

  const buildOrder = useCallback((key, sh) => {
    let idx = Array.from({ length: getQuestions(key).length }, (_, i) => i);
    if (sh) idx = idx.sort(() => Math.random() - 0.5);
    return idx;
  }, []);
  const startChapter = (key) => {
    setChapter(key); setOrder(buildOrder(key, shuffle));
    setPos(0); setSelected(""); setShowAnswer(false); setAnswers({}); setFinished(false);
  };
  const goHome = () => { setChapter(null); setFinished(false); };
  const restart = () => startChapter(chapter);

  const handleAnswer = useCallback((opt) => {
    if (showAnswer || !question) return;
    const correct = opt === question.answer;
    setSelected(opt); setShowAnswer(true);
    setAnswers((p) => ({ ...p, [qIndex]: { selected: opt, correct } }));
  }, [showAnswer, question, qIndex]);
  const next = useCallback(() => {
    if (pos < order.length - 1) { setPos(pos + 1); setSelected(""); setShowAnswer(false); }
    else setFinished(true);
  }, [pos, order.length]);

  useEffect(() => {
    if (!chapter || finished) return;
    const onKey = (e) => {
      if (!showAnswer && question) {
        const i = parseInt(e.key, 10) - 1;
        if (i >= 0 && i < question.options.length) handleAnswer(question.options[i]);
      } else if (showAnswer && (e.key === "Enter" || e.key === "ArrowRight")) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [chapter, finished, showAnswer, question, handleAnswer, next]);

  /* ---------------- small UI helpers ---------------- */
  const ThemeBtn = () => (
    <button onClick={() => setDark((d) => !d)} aria-label="Toggle theme"
      style={{ background: T.chip, borderColor: T.cardBorder, color: T.text }}
      className="h-10 w-10 grid place-items-center rounded-xl border transition hover:scale-105 active:scale-95">
      <span className="text-lg">{dark ? "☀️" : "🌙"}</span>
    </button>
  );

  const styleTag = (
    <style>{`
      @keyframes hqfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      @keyframes hqpop{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:none}}
      .hq-fade{animation:hqfade .35s ease both}
      .hq-pop{animation:hqpop .25s ease both}
      .hq-card{transition:transform .2s ease, box-shadow .2s ease, border-color .2s ease}
      .hq-card:hover{transform:translateY(-3px)}
      .hq-opt{transition:transform .12s ease, background .15s, border-color .15s}
      .hq-opt:not(:disabled):hover{transform:translateX(3px)}
      *::-webkit-scrollbar{width:10px;height:10px}
      *::-webkit-scrollbar-thumb{background:${dark ? "rgba(255,255,255,.14)" : "rgba(15,23,42,.18)"};border-radius:8px}
    `}</style>
  );

  const Root = ({ children, max = "max-w-5xl" }) => (
    <div style={{ background: T.grad, color: T.text, minHeight: "100vh" }}
      className="font-sans antialiased transition-colors duration-300">
      {styleTag}
      <div className={`mx-auto ${max} px-4 sm:px-6 py-8`}>{children}</div>
    </div>
  );

  const meta = CHAPTERS.find((c) => c.key === chapter) || SPECIAL[chapter] || { title: chapter, icon: "📘", c1: "#6366f1", c2: "#8b5cf6" };

  /* ============================= HOME ============================= */
  if (!chapter) {
    const totalQ =
      CHAPTERS.reduce((s, c) => s + getQuestions(c.key).length, 0) +
      getQuestions("exercises").length + getQuestions("pastYears").length;

    const Feature = ({ k, tag, title, desc }) => {
      const m = SPECIAL[k]; const cnt = getQuestions(k).length;
      const locked = k === "exercises" && !unlocked;
      return (
        <button onClick={() => openSection(k)}
          style={{ background: T.card, borderColor: T.cardBorder, boxShadow: T.shadow }}
          className="hq-card group relative overflow-hidden text-left rounded-2xl border p-5">
          <div style={{ background: `linear-gradient(135deg, ${m.c1}, ${m.c2})` }}
            className="absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-20 blur-xl" />
          <div className="relative flex items-center justify-between">
            <span style={{ background: `linear-gradient(135deg, ${m.c1}22, ${m.c2}22)`, color: m.c1, borderColor: `${m.c1}55` }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border">{tag}</span>
            <span style={{ color: T.faint }} className="text-sm">{locked ? "🔒 Locked" : `${cnt} Q`}</span>
          </div>
          <div className="relative flex items-center gap-3 mt-3">
            <div style={{ background: `linear-gradient(135deg, ${m.c1}, ${m.c2})` }}
              className="h-12 w-12 rounded-xl grid place-items-center text-2xl shadow-lg">{m.icon}</div>
            <div>
              <h3 className="text-lg font-bold leading-tight">{title}</h3>
              <p style={{ color: T.sub }} className="text-sm mt-0.5">{desc}</p>
            </div>
          </div>
        </button>
      );
    };

    return (
      <Root>
        <header className="flex items-center justify-between mb-8 hq-fade">
          <div className="flex items-center gap-3">
            <div style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              className="h-12 w-12 rounded-2xl grid place-items-center text-2xl shadow-lg">💧</div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Hydrology Practice</h1>
              <p style={{ color: T.sub }} className="text-sm">MCQ trainer · {totalQ} questions · Prof. F. Russo</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShuffle((s) => !s)}
              style={{ background: shuffle ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : T.chip, borderColor: T.cardBorder, color: shuffle ? "#fff" : T.sub }}
              className="hidden sm:inline-flex items-center gap-2 text-sm font-medium px-3.5 h-10 rounded-xl border transition hover:scale-105">
              🔀 Shuffle {shuffle ? "On" : "Off"}
            </button>
            <ThemeBtn />
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 hq-fade">
          <Feature k="exercises" tag="★ 8 of 32 marks" title="Exercises — Formulas & Graphs"
            desc="Continuity · IDF · SCS · φ-index · UH · stats" />
          <Feature k="pastYears" tag="⚑ Real exam questions" title="Past Year Questions"
            desc="Pulled from previous exam papers" />
        </section>

        <h2 style={{ color: T.faint }} className="text-xs font-bold uppercase tracking-widest mb-3">Chapters</h2>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CHAPTERS.map((c) => {
            const count = getQuestions(c.key).length; const off = count === 0;
            return (
              <button key={c.key} disabled={off} onClick={() => startChapter(c.key)}
                style={{ background: T.card, borderColor: T.cardBorder, boxShadow: T.shadow, opacity: off ? 0.45 : 1, cursor: off ? "not-allowed" : "pointer" }}
                className="hq-card group relative overflow-hidden text-left rounded-2xl border p-4">
                <div style={{ background: `linear-gradient(90deg, ${c.c1}, ${c.c2})` }}
                  className="absolute inset-x-0 top-0 h-1" />
                <div className="flex items-start justify-between">
                  <div style={{ background: `linear-gradient(135deg, ${c.c1}, ${c.c2})` }}
                    className="h-11 w-11 rounded-xl grid place-items-center text-xl shadow-md">{c.icon}</div>
                  <span style={{ background: T.chip, color: T.sub }}
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full">CH {c.n}</span>
                </div>
                <h3 className="mt-3 font-bold leading-snug">{c.title}</h3>
                <p style={{ color: T.faint }} className="text-xs mt-0.5">{off ? "Coming soon" : `${count} questions`}</p>
              </button>
            );
          })}
        </section>

        <footer style={{ color: T.faint }} className="mt-10 text-center text-xs">
          Hydrology MCQ trainer — student study tool · {dark ? "dark" : "light"} mode
        </footer>

        {/* password gate modal */}
        {gateOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(2,6,23,.65)", backdropFilter: "blur(4px)" }}
            onClick={() => setGateOpen(false)}>
            <div onClick={(e) => e.stopPropagation()}
              style={{ background: T.card, borderColor: T.cardBorder, boxShadow: T.shadow }}
              className="w-full max-w-sm rounded-2xl border p-6 hq-pop">
              <div className="flex items-center gap-3 mb-4">
                <div style={{ background: "linear-gradient(135deg,#f59e0b,#f97316)" }}
                  className="h-11 w-11 rounded-xl grid place-items-center text-2xl shadow-lg">🔒</div>
                <div>
                  <h3 className="font-bold leading-tight">Protected section</h3>
                  <p style={{ color: T.sub }} className="text-sm">Enter the password to open the Exercises.</p>
                </div>
              </div>
              <input
                type="password" autoFocus value={pwInput}
                onChange={(e) => { setPwInput(e.target.value); setPwError(false); }}
                onKeyDown={(e) => e.key === "Enter" && submitPassword()}
                placeholder="Password"
                style={{ background: T.chip, borderColor: pwError ? T.noBorder : T.cardBorder, color: T.text }}
                className="w-full px-4 py-3 rounded-xl border outline-none text-[15px] tracking-wider"
              />
              {pwError && (
                <p style={{ color: T.noBorder }} className="text-sm mt-2">Incorrect password — try again.</p>
              )}
              <div className="flex gap-3 mt-5">
                <button onClick={submitPassword} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
                  className="flex-1 px-4 py-3 rounded-xl text-white font-semibold transition hover:scale-[1.03]">Unlock</button>
                <button onClick={() => setGateOpen(false)} style={{ background: T.chip, borderColor: T.cardBorder, color: T.text }}
                  className="px-4 py-3 rounded-xl border font-semibold transition hover:scale-[1.03]">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </Root>
    );
  }

  /* Empty guard */
  if (questions.length === 0) {
    return (
      <Root max="max-w-2xl">
        <div style={{ background: T.card, borderColor: T.cardBorder, boxShadow: T.shadow }}
          className="rounded-2xl border p-10 text-center hq-pop">
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="text-lg font-bold mb-1">{meta.title}</h2>
          <p style={{ color: T.sub }} className="mb-6">No questions added for this section yet.</p>
          <button onClick={goHome} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold">← Back to menu</button>
        </div>
      </Root>
    );
  }

  /* ============================ RESULTS ============================ */
  if (finished) {
    const total = order.length;
    const pct = Math.round((score / total) * 100);
    const wrong = order.map((i) => ({ q: questions[i], a: answers[i] })).filter((x) => x.a && !x.a.correct);
    const msg = pct === 100 ? "Perfect score 🏆" : pct >= 80 ? "Strong — almost there" : pct >= 50 ? "Good — review the misses" : "Keep practising";
    const ring = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#f43f5e";
    const C = 2 * Math.PI * 54;
    return (
      <Root max="max-w-2xl">
        <div className="flex justify-end mb-4"><ThemeBtn /></div>
        <div style={{ background: T.card, borderColor: T.cardBorder, boxShadow: T.shadow }}
          className="rounded-2xl border p-6 sm:p-8 hq-pop">
          <div className="text-center">
            <p style={{ color: T.faint }} className="text-xs font-bold uppercase tracking-widest">{meta.title}</p>
            <h1 className="text-xl font-extrabold mt-1 mb-6">Results</h1>
            <div className="relative inline-flex items-center justify-center mb-3">
              <svg width="140" height="140" className="-rotate-90">
                <circle cx="70" cy="70" r="54" stroke={T.track} strokeWidth="12" fill="none" />
                <circle cx="70" cy="70" r="54" stroke={ring} strokeWidth="12" fill="none" strokeLinecap="round"
                  strokeDasharray={C} strokeDashoffset={C - (C * pct) / 100} style={{ transition: "stroke-dashoffset 1.1s ease" }} />
              </svg>
              <div className="absolute flex flex-col">
                <span className="text-4xl font-extrabold">{pct}%</span>
                <span style={{ color: T.sub }} className="text-xs">{score}/{total}</span>
              </div>
            </div>
            <p className="font-semibold mb-1">{msg}</p>
            <p style={{ color: T.sub }} className="text-sm mb-6">{score} correct · {total - score} wrong</p>
          </div>

          {wrong.length > 0 && (
            <div style={{ borderColor: T.cardBorder }} className="border-t pt-5">
              <h3 className="text-sm font-bold mb-3">Review · {wrong.length} to fix</h3>
              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {wrong.map((x, k) => (
                  <div key={k} style={{ background: T.chip, borderColor: T.cardBorder }} className="rounded-xl border p-3 text-sm">
                    <div className="font-semibold mb-1.5">{x.q.question}</div>
                    <div style={{ color: T.noBorder }}>✗ You: {x.a.selected}</div>
                    <div style={{ color: T.okBorder }}>✓ Correct: {x.q.answer}</div>
                    {x.q.explanation && <div style={{ color: T.sub }} className="mt-1.5">{x.q.explanation}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <button onClick={restart} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition hover:scale-[1.03]">↻ Retry section</button>
            <button onClick={goHome} style={{ background: T.chip, borderColor: T.cardBorder, color: T.text }}
              className="px-6 py-3 rounded-xl border text-sm font-semibold transition hover:scale-[1.03]">← Back to menu</button>
          </div>
        </div>
      </Root>
    );
  }

  /* ============================= QUIZ ============================= */
  const progress = ((pos + (showAnswer ? 1 : 0)) / order.length) * 100;
  const isLast = pos === order.length - 1;

  return (
    <Root max="max-w-3xl">
      <div className="flex items-center justify-between gap-3 mb-4">
        <button onClick={goHome} style={{ background: T.chip, borderColor: T.cardBorder, color: T.text }}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3.5 h-10 rounded-xl border transition hover:scale-105">← Menu</button>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{meta.icon}</span>
          <h1 className="text-sm sm:text-base font-bold truncate">{meta.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span style={{ background: T.chip }} className="text-sm font-bold tabular-nums px-3 h-10 inline-flex items-center rounded-xl">
            {score}<span style={{ color: T.faint }} className="font-normal">/{order.length}</span>
          </span>
          <ThemeBtn />
        </div>
      </div>

      <div style={{ background: T.track }} className="h-2 w-full rounded-full overflow-hidden mb-2">
        <div style={{ width: `${progress}%`, background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }}
          className="h-full rounded-full transition-all duration-500" />
      </div>
      <p style={{ color: T.faint }} className="text-xs mb-5">Question {pos + 1} of {order.length}</p>

      <div key={qIndex} style={{ background: T.card, borderColor: T.cardBorder, boxShadow: T.shadow }}
        className="rounded-2xl border p-5 sm:p-7 hq-fade">
        <h2 className="text-lg sm:text-xl font-semibold leading-relaxed mb-6">{question.question}</h2>

        <div className="space-y-2.5">
          {question.options.map((option, i) => {
            let bg = T.card, bd = T.cardBorder, badgeBg = T.chip, badgeColor = T.sub, op = 1;
            if (showAnswer) {
              if (option === question.answer) { bg = T.okBg; bd = T.okBorder; badgeBg = T.okBorder; badgeColor = "#fff"; }
              else if (option === selected) { bg = T.noBg; bd = T.noBorder; badgeBg = T.noBorder; badgeColor = "#fff"; }
              else { op = 0.55; }
            }
            return (
              <button key={option} onClick={() => handleAnswer(option)} disabled={showAnswer}
                style={{ background: bg, borderColor: bd, opacity: op }}
                className="hq-opt w-full flex items-center gap-3 p-3.5 rounded-xl border text-left text-[15px]">
                <span style={{ background: badgeBg, color: badgeColor }}
                  className="shrink-0 h-7 w-7 grid place-items-center rounded-lg text-xs font-bold">{LETTERS[i]}</span>
                <span className="flex-1">{option}</span>
                {showAnswer && option === question.answer && <span style={{ color: T.okBorder }} className="font-bold">✓</span>}
                {showAnswer && option === selected && option !== question.answer && <span style={{ color: T.noBorder }} className="font-bold">✗</span>}
              </button>
            );
          })}
        </div>

        {showAnswer && question.explanation && (
          <div style={{ background: T.whyBg, borderColor: T.whyBorder }} className="mt-5 rounded-xl border p-3.5 text-sm hq-pop">
            <span style={{ color: dark ? "#7dd3fc" : "#0369a1" }} className="font-bold">Why: </span>
            <span style={{ color: T.text }}>{question.explanation}</span>
          </div>
        )}

        {showAnswer && (
          <div className="mt-6 flex items-center justify-between">
            <span style={{ color: T.faint }} className="text-xs hidden sm:block">Press Enter for next</span>
            <button onClick={next} style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
              className="ml-auto px-6 py-3 rounded-xl text-white font-semibold transition hover:scale-[1.04] active:scale-95">
              {isLast ? "See results →" : "Next →"}
            </button>
          </div>
        )}
      </div>

      {!showAnswer && (
        <p style={{ color: T.faint }} className="mt-4 text-center text-xs">Tip: press 1–{question.options.length} to answer</p>
      )}
    </Root>
  );
}
