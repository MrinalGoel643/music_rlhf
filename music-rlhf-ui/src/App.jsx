import { useState, useEffect, useRef } from "react";

// ── Dummy preference data ────────────────────────────────────────────────────
const DUMMY_PAIRS = {
  default: [
    {
      song: "Knife Talk",
      artist: "Drake ft. 21 Savage",
      rationale:
        "This track leans into the same minimalist, tension-soaked trap production — where the beat does most of the emotional heavy lifting and the verses feel like controlled explosions.",
    },
    {
      song: "Pyramids",
      artist: "Frank Ocean",
      rationale:
        "Like your pick, this song splits into two distinct emotional worlds mid-track, using that structural pivot as the narrative device rather than a traditional chorus.",
    },
  ],
  rock: [
    {
      song: "Stairway to Heaven",
      artist: "Led Zeppelin",
      rationale:
        "It shares the same dynamic arc — a patient acoustic build that ruptures into cathartic, orchestrated release, using dynamic contrast as its primary emotional engine.",
    },
    {
      song: "Black Hole Sun",
      artist: "Soundgarden",
      rationale:
        "Both songs wrap genuinely unsettling imagery in hooks so melodic they feel almost cruel — the dissonance between form and content is the whole point.",
    },
  ],
  jazz: [
    {
      song: "So What",
      artist: "Miles Davis",
      rationale:
        "Both pieces build maximum expression from minimum notes, treating silence as compositional material rather than absence — the restraint is the statement.",
    },
    {
      song: "Gymnopédie No. 1",
      artist: "Erik Satie",
      rationale:
        "Shares the same unhurried, melancholic beauty — both use space and tempo to let each note breathe, making the listener slow down involuntarily.",
    },
  ],
  pop: [
    {
      song: "Take On Me",
      artist: "a-ha",
      rationale:
        "Both tracks lean into 80s-inflected synth production and soaring falsetto vocals that feel simultaneously nostalgic and euphorically present.",
    },
    {
      song: "Good as Hell",
      artist: "Lizzo",
      rationale:
        "Carries the same unapologetic, euphoric disco-pop energy — both function as self-affirmation anthems wrapped in irresistible grooves you can't sit still to.",
    },
  ],
  hiphop: [
    {
      song: "Regulate",
      artist: "Warren G & Nate Dogg",
      rationale:
        "Built on the same G-funk blueprint — LFO synth bass, Parliament samples, laid-back West Coast flow — but adds a cinematic storytelling dimension that elevates it.",
    },
    {
      song: "HUMBLE.",
      artist: "Kendrick Lamar",
      rationale:
        "Same aggressive, minimalist production philosophy: strip everything away until only the most confrontational version of the beat and the artist remain.",
    },
  ],
  rnb: [
    {
      song: "Ex-Factor",
      artist: "Lauryn Hill",
      rationale:
        "Both songs sit inside heartbreak rather than resolving it — the production mirrors the emotional stasis, everything circling back to the same unresolved feeling.",
    },
    {
      song: "Come Through",
      artist: "H.E.R.",
      rationale:
        "Exists in the same emotionally tentative space, where attraction is real but vulnerability is terrifying — told through hazy R&B production that mirrors the uncertainty.",
    },
  ],
  electronic: [
    {
      song: "Finally",
      artist: "CeCe Peniston",
      rationale:
        "The house track that defined this euphoric release template — gives you the same peak-energy payoff but in its purest, un-filtered original form.",
    },
    {
      song: "Kernkraft 400",
      artist: "Zombie Nation",
      rationale:
        "Hits the same pressure point — a single melodic synth hook deployed at peak energy, designed to make thousands of people lose their minds simultaneously.",
    },
  ],
};

function getPair(songInput) {
  const lower = songInput.toLowerCase();
  if (/rock|nirvana|zeppelin|pink floyd|queen|metallica|ac\/dc/i.test(lower)) return DUMMY_PAIRS.rock;
  if (/jazz|miles|coltrane|debussy|satie|brubeck/i.test(lower)) return DUMMY_PAIRS.jazz;
  if (/taylor|billie|dua|harry|ariana|olivia|pop/i.test(lower)) return DUMMY_PAIRS.pop;
  if (/kendrick|drake|kanye|jay|eminem|travis|hiphop|hip.hop|rap/i.test(lower)) return DUMMY_PAIRS.hiphop;
  if (/frank|weeknd|rihanna|rnb|r&b|sza|khalid/i.test(lower)) return DUMMY_PAIRS.rnb;
  if (/daft|tiesto|electronic|edm|house|techno/i.test(lower)) return DUMMY_PAIRS.electronic;
  // Rotate through pairs based on string length for variety
  const keys = Object.keys(DUMMY_PAIRS);
  return DUMMY_PAIRS[keys[songInput.length % keys.length]];
}

// ── Waveform bars decoration ─────────────────────────────────────────────────
function WaveformBars({ count = 24, className = "" }) {
  const heights = Array.from({ length: count }, (_, i) =>
    20 + Math.abs(Math.sin(i * 0.8)) * 60 + Math.abs(Math.sin(i * 0.3)) * 20
  );
  return (
    <div className={`waveform ${className}`}>
      {heights.map((h, i) => (
        <div key={i} className="waveform-bar" style={{ height: `${h}%`, animationDelay: `${i * 0.04}s` }} />
      ))}
    </div>
  );
}

// ── Vinyl record SVG ────────────────────────────────────────────────────────
function VinylRecord({ spinning }) {
  return (
    <div className={`vinyl ${spinning ? "spinning" : ""}`}>
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <circle cx="60" cy="60" r="58" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
        {[52, 44, 36, 28].map((r) => (
          <circle key={r} cx="60" cy="60" r={r} fill="none" stroke="#2a2a2a" strokeWidth="0.5" />
        ))}
        <circle cx="60" cy="60" r="10" fill="#C9954C" />
        <circle cx="60" cy="60" r="3" fill="#1a1a1a" />
        <line x1="60" y1="20" x2="60" y2="50" stroke="#333" strokeWidth="0.5" opacity="0.4" />
        <line x1="90" y1="30" x2="68" y2="48" stroke="#333" strokeWidth="0.5" opacity="0.4" />
      </svg>
    </div>
  );
}

// ── Preference Card ─────────────────────────────────────────────────────────
function PreferenceCard({ label, song, artist, rationale, selected, onClick }) {
  return (
    <button
      className={`pref-card ${selected ? "selected" : ""}`}
      onClick={onClick}
    >
      <div className="card-label">{label}</div>
      <div className="card-content">
        <div className="card-song">{song}</div>
        <div className="card-artist">{artist}</div>
        <p className="card-rationale">{rationale}</p>
      </div>
      <div className="card-select-ring">
        <div className="card-select-dot" />
      </div>
    </button>
  );
}

// ── History item ─────────────────────────────────────────────────────────────
function HistoryItem({ entry, index }) {
  const label = entry.choice === "tie" ? "Tied" : entry.choice === "A" ? "Chose A" : "Chose B";
  const color = entry.choice === "tie" ? "#888" : entry.choice === "A" ? "#C9954C" : "#7EB8A4";
  return (
    <div className="history-item" style={{ animationDelay: `${index * 0.05}s` }}>
      <div className="history-song">"{entry.song}"</div>
      <div className="history-badge" style={{ color }}>
        {label}
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [songInput, setSongInput] = useState("");
  const [submittedSong, setSubmittedSong] = useState("");
  const [pair, setPair] = useState(null);
  const [selected, setSelected] = useState(null); // "A" | "B" | "tie"
  const [history, setHistory] = useState([]);
  const [phase, setPhase] = useState("input"); // "input" | "compare" | "result"
  const [animating, setAnimating] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (phase === "input") inputRef.current?.focus();
  }, [phase]);

  function handleSubmit(e) {
    e.preventDefault();
    if (!songInput.trim()) return;
    const p = getPair(songInput.trim());
    setPair(p);
    setSubmittedSong(songInput.trim());
    setSelected(null);
    setAnimating(true);
    setTimeout(() => {
      setPhase("compare");
      setAnimating(false);
    }, 400);
  }

  function handleChoice(choice) {
    setSelected(choice);
    setAnimating(true);
    setTimeout(() => {
      setHistory((prev) => [
        { song: submittedSong, choice, pairA: pair[0], pairB: pair[1] },
        ...prev,
      ]);
      setPhase("result");
      setAnimating(false);
    }, 500);
  }

  function handleNext() {
    setAnimating(true);
    setTimeout(() => {
      setSongInput("");
      setSelected(null);
      setPair(null);
      setPhase("input");
      setAnimating(false);
    }, 300);
  }

  const totalLabeled = history.length;
  const tieCount = history.filter((h) => h.choice === "tie").length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #0e0e0e;
          --surface: #161616;
          --surface2: #1e1e1e;
          --border: #2a2a2a;
          --gold: #C9954C;
          --gold-dim: #8a6030;
          --teal: #7EB8A4;
          --text: #e8e0d5;
          --text-dim: #7a7068;
          --text-mid: #a89e94;
          --red: #C96B6B;
        }

        html, body { height: 100%; background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; }

        #root { min-height: 100vh; display: flex; flex-direction: column; }

        /* ── Layout ── */
        .app { display: flex; min-height: 100vh; }

        .sidebar {
          width: 280px;
          flex-shrink: 0;
          background: var(--surface);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          padding: 32px 24px;
          gap: 32px;
        }

        .main {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 32px;
          min-height: 100vh;
          position: relative;
          overflow: hidden;
        }

        /* ── Sidebar ── */
        .brand {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .brand-label {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 500;
        }
        .brand-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 900;
          line-height: 1.2;
          color: var(--text);
        }

        .stats-block { display: flex; flex-direction: column; gap: 12px; }
        .stats-label {
          font-size: 10px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: var(--text-dim);
          font-weight: 500;
        }
        .stat-row { display: flex; justify-content: space-between; align-items: baseline; }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--gold);
        }
        .stat-desc { font-size: 12px; color: var(--text-dim); }

        .divider { height: 1px; background: var(--border); }

        .history-block { display: flex; flex-direction: column; gap: 10px; flex: 1; overflow: hidden; }
        .history-scroll { display: flex; flex-direction: column; gap: 8px; overflow-y: auto; flex: 1; }
        .history-scroll::-webkit-scrollbar { width: 3px; }
        .history-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        .history-item {
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 10px 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideIn 0.3s ease forwards;
          opacity: 0;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .history-song { font-size: 12px; color: var(--text-mid); flex: 1; truncate: ellipsis; overflow: hidden; white-space: nowrap; }
        .history-badge { font-size: 11px; font-weight: 500; flex-shrink: 0; margin-left: 8px; }

        .empty-history { font-size: 12px; color: var(--text-dim); text-align: center; margin-top: 16px; }

        /* ── Waveform ── */
        .waveform {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 40px;
        }
        .waveform-bar {
          width: 3px;
          background: var(--gold);
          border-radius: 2px;
          opacity: 0.3;
          animation: pulse 1.8s ease-in-out infinite alternate;
        }
        @keyframes pulse {
          from { opacity: 0.15; transform: scaleY(0.6); }
          to   { opacity: 0.5; transform: scaleY(1); }
        }

        /* ── Vinyl ── */
        .vinyl { width: 80px; height: 80px; }
        .vinyl.spinning svg { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        /* ── Main content ── */
        .content-wrapper {
          width: 100%;
          max-width: 680px;
          transition: opacity 0.3s ease, transform 0.3s ease;
        }
        .content-wrapper.animating { opacity: 0; transform: translateY(12px); }

        /* ── Input phase ── */
        .input-phase { display: flex; flex-direction: column; align-items: center; gap: 32px; text-align: center; }

        .eyebrow {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 500;
        }
        .headline {
          font-family: 'Playfair Display', serif;
          font-size: clamp(32px, 5vw, 52px);
          font-weight: 900;
          line-height: 1.1;
          color: var(--text);
        }
        .headline em { font-style: italic; color: var(--gold); }
        .subhead { font-size: 15px; color: var(--text-dim); max-width: 440px; line-height: 1.6; }

        .input-row { display: flex; gap: 12px; width: 100%; max-width: 500px; }
        .song-input {
          flex: 1;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 16px 20px;
          font-size: 15px;
          color: var(--text);
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border-color 0.2s;
        }
        .song-input:focus { border-color: var(--gold); }
        .song-input::placeholder { color: var(--text-dim); }

        .btn-primary {
          background: var(--gold);
          color: #0e0e0e;
          border: none;
          border-radius: 10px;
          padding: 16px 28px;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.2s, transform 0.1s;
          letter-spacing: 0.5px;
        }
        .btn-primary:hover { background: #d9a55c; }
        .btn-primary:active { transform: scale(0.97); }

        /* ── Compare phase ── */
        .compare-phase { display: flex; flex-direction: column; gap: 28px; }

        .compare-header { display: flex; flex-direction: column; gap: 8px; }
        .compare-eyebrow { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: var(--text-dim); }
        .compare-song {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--text);
        }
        .compare-song span { color: var(--gold); font-style: italic; }
        .compare-prompt { font-size: 14px; color: var(--text-dim); }

        .cards-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        .pref-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 24px;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }
        .pref-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 60%, rgba(201,149,76,0.04));
          pointer-events: none;
        }
        .pref-card:hover { border-color: var(--gold-dim); transform: translateY(-2px); background: var(--surface2); }
        .pref-card.selected { border-color: var(--gold); background: #1c1810; }
        .pref-card.selected::before { background: linear-gradient(135deg, transparent 40%, rgba(201,149,76,0.08)); }

        .card-label {
          font-size: 10px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--gold);
          font-weight: 600;
        }
        .card-song { font-size: 16px; font-weight: 600; color: var(--text); line-height: 1.3; }
        .card-artist { font-size: 12px; color: var(--text-dim); margin-top: -8px; }
        .card-rationale { font-size: 13px; color: var(--text-mid); line-height: 1.65; flex: 1; }

        .card-select-ring {
          width: 20px; height: 20px;
          border-radius: 50%;
          border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          align-self: flex-end;
          flex-shrink: 0;
          transition: border-color 0.2s;
        }
        .pref-card.selected .card-select-ring { border-color: var(--gold); }
        .card-select-dot {
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--gold);
          transform: scale(0);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .pref-card.selected .card-select-dot { transform: scale(1); }

        .tie-row { display: flex; justify-content: center; }
        .btn-tie {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 12px 32px;
          font-size: 13px;
          color: var(--text-dim);
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: border-color 0.2s, color 0.2s, background 0.2s;
          letter-spacing: 1px;
        }
        .btn-tie:hover { border-color: var(--text-mid); color: var(--text); }
        .btn-tie.selected { border-color: var(--teal); color: var(--teal); background: #0d1c19; }

        /* ── Result phase ── */
        .result-phase { display: flex; flex-direction: column; align-items: center; gap: 28px; text-align: center; }

        .result-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--surface2);
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 8px 18px;
          font-size: 12px;
          color: var(--text-mid);
          letter-spacing: 1px;
        }
        .result-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); }

        .result-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          line-height: 1.2;
        }
        .result-winner { color: var(--gold); font-style: italic; }
        .result-tie-text { color: var(--teal); }

        .result-detail {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px 24px;
          text-align: left;
          width: 100%;
          max-width: 480px;
        }
        .result-detail-song { font-size: 15px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
        .result-detail-artist { font-size: 12px; color: var(--text-dim); margin-bottom: 12px; }
        .result-detail-rationale { font-size: 13px; color: var(--text-mid); line-height: 1.65; }

        .result-count { font-size: 13px; color: var(--text-dim); }
        .result-count strong { color: var(--gold); }

        .btn-next {
          background: transparent;
          border: 1px solid var(--gold);
          color: var(--gold);
          border-radius: 10px;
          padding: 14px 36px;
          font-size: 14px;
          font-weight: 500;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
          letter-spacing: 0.5px;
        }
        .btn-next:hover { background: var(--gold); color: #0e0e0e; }

        /* ── Background decoration ── */
        .bg-glow {
          position: absolute;
          width: 500px; height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(201,149,76,0.04) 0%, transparent 70%);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        /* ── Responsive ── */
        @media (max-width: 720px) {
          .app { flex-direction: column; }
          .sidebar { width: 100%; flex-direction: row; flex-wrap: wrap; padding: 20px; gap: 20px; }
          .history-block { display: none; }
          .cards-row { grid-template-columns: 1fr; }
          .main { padding: 32px 20px; }
        }
      `}</style>

      <div className="app">
        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="brand">
            <div className="brand-label">RLHF Demo</div>
            <div className="brand-title">Music<br />Preference<br />Lab</div>
          </div>

          <VinylRecord spinning={phase === "compare"} />

          <div className="divider" />

          <div className="stats-block">
            <div className="stats-label">Session Stats</div>
            <div className="stat-row">
              <div>
                <div className="stat-num">{totalLabeled}</div>
                <div className="stat-desc">labeled</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="stat-num" style={{ color: "#7EB8A4" }}>{tieCount}</div>
                <div className="stat-desc">ties</div>
              </div>
            </div>
            <WaveformBars count={20} />
          </div>

          <div className="divider" />

          <div className="history-block">
            <div className="stats-label">History</div>
            <div className="history-scroll">
              {history.length === 0 ? (
                <div className="empty-history">No preferences yet</div>
              ) : (
                history.map((entry, i) => (
                  <HistoryItem key={i} entry={entry} index={i} />
                ))
              )}
            </div>
          </div>
        </aside>

        {/* ── Main ── */}
        <main className="main">
          <div className="bg-glow" />

          <div className={`content-wrapper ${animating ? "animating" : ""}`}>
            {/* ── INPUT ── */}
            {phase === "input" && (
              <div className="input-phase">
                <div className="eyebrow">Human Preference Collection</div>
                <h1 className="headline">
                  What song are you<br /><em>obsessed</em> with?
                </h1>
                <p className="subhead">
                  Enter a song and we'll show you two recommendations. Pick the one
                  with the better rationale — or call it a tie.
                </p>
                <form className="input-row" onSubmit={handleSubmit}>
                  <input
                    ref={inputRef}
                    className="song-input"
                    type="text"
                    placeholder="e.g. Bohemian Rhapsody by Queen"
                    value={songInput}
                    onChange={(e) => setSongInput(e.target.value)}
                  />
                  <button className="btn-primary" type="submit">
                    Generate →
                  </button>
                </form>
              </div>
            )}

            {/* ── COMPARE ── */}
            {phase === "compare" && pair && (
              <div className="compare-phase">
                <div className="compare-header">
                  <div className="compare-eyebrow">Because you love</div>
                  <div className="compare-song">
                    <span>"{submittedSong}"</span>
                  </div>
                  <div className="compare-prompt">
                    Which recommendation has the better rationale?
                  </div>
                </div>

                <div className="cards-row">
                  <PreferenceCard
                    label="Option A"
                    song={pair[0].song}
                    artist={pair[0].artist}
                    rationale={pair[0].rationale}
                    selected={selected === "A"}
                    onClick={() => handleChoice("A")}
                  />
                  <PreferenceCard
                    label="Option B"
                    song={pair[1].song}
                    artist={pair[1].artist}
                    rationale={pair[1].rationale}
                    selected={selected === "B"}
                    onClick={() => handleChoice("B")}
                  />
                </div>

                <div className="tie-row">
                  <button
                    className={`btn-tie ${selected === "tie" ? "selected" : ""}`}
                    onClick={() => handleChoice("tie")}
                  >
                    Both are equally good — Tie
                  </button>
                </div>
              </div>
            )}

            {/* ── RESULT ── */}
            {phase === "result" && history[0] && (
              <div className="result-phase">
                <div className="result-badge">
                  <div className="result-badge-dot" />
                  Preference recorded
                </div>

                {history[0].choice === "tie" ? (
                  <div className="result-title">
                    <span className="result-tie-text">It's a tie.</span>
                    <br />
                    <span style={{ fontSize: "20px", color: "var(--text-dim)", fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}>
                      Both rationales held their own.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="result-title">
                      <span className="result-winner">
                        Option {history[0].choice}
                      </span>{" "}
                      wins.
                    </div>
                    <div className="result-detail">
                      <div className="result-detail-song">
                        {history[0].choice === "A" ? history[0].pairA.song : history[0].pairB.song}
                      </div>
                      <div className="result-detail-artist">
                        {history[0].choice === "A" ? history[0].pairA.artist : history[0].pairB.artist}
                      </div>
                      <div className="result-detail-rationale">
                        {history[0].choice === "A" ? history[0].pairA.rationale : history[0].pairB.rationale}
                      </div>
                    </div>
                  </>
                )}

                <div className="result-count">
                  <strong>{totalLabeled}</strong> preference{totalLabeled !== 1 ? "s" : ""} labeled this session
                </div>

                <button className="btn-next" onClick={handleNext}>
                  Label another →
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
