import { useMemo } from "react";

/**
 * SceneIllustration — deterministic, code-generated scene art in 12 styles.
 *
 * Every scene stores a natural-language description (written by the writer).
 * A keyword parser maps it to a scene type; each art style renders that type
 * with its own palette, texture and composition. This is deterministic local
 * SVG artwork, not a general-purpose or AI image-generation model.
 */

// ---------------------------------------------------------------------------
// Scene-type detection from the writer's illustration description
// ---------------------------------------------------------------------------

const SCENE_TYPES = {
  landscape: ["castle", "river", "mountain", "mountains", "lake", "ocean", "sea", "beach", "waterfall", "village", "city", "cliff", "desert", "island", "horizon"],
  portal: ["doorway", "portal", "hidden door", "wooden door", "door", "threshold", "runes", "rune", "symbols", "lock", "keyhole", "basement", "stair", "stairs", "archway"],
  forest: ["forest", "tree", "trees", "wood", "lantern", "moss", "shrine", "fox", "river", "bells", "bell", "tower", "keeper", "gate", "petals", "petal", "embers"],
  clock: ["clock", "gear", "gears", "clockwork", "brass", "pendulum", "watch", "tower", "bell", "bells", "mechanism", "escapement", "key", "winding", "stair", "stairs", "spiral"],
  celestial: ["star", "stars", "sky", "moon", "moonflower", "moonflowers", "valley", "bridge", "crystal", "ruins", "guardian", "constellation", "constellations", "fruit", "garden", "dawn", "song"],
  interior: ["room", "bench", "workshop", "map", "maps", "letter", "letter", "door", "tools", "lamp", "lamplight", "candle", "candlelight", "chair"],
  figure: ["girl", "boy", "explorer", "keeper", "guardian", "clockmaker", "traveler", "figure", "child", "children", "apprentice", "old man", "two", "crowd"],
};

function detectSceneType(description) {
  const d = (description || "").toLowerCase();
  let best = "figure";
  let bestScore = 0;
  for (const [type, words] of Object.entries(SCENE_TYPES)) {
    let score = 0;
    for (const w of words) if (d.includes(w)) score++;
    if (score > bestScore) {
      best = type;
      bestScore = score;
    }
  }
  return best;
}

function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function sceneTypeFor(description) {
  return detectSceneType(description);
}

// ---------------------------------------------------------------------------
// Palettes per style (sky, ground, accent, ink)
// ---------------------------------------------------------------------------

const PALETTES = {
  "Classic Storybook": { sky: ["#f5e8cf", "#e8d5a8"], ground: "#b5a077", accent: "#c9963c", ink: "#4a3b28", glow: "#ffe9b0" },
  "Watercolor": { sky: ["#dbe9f4", "#f2e3e0"], ground: "#8fae9c", accent: "#5f7fa6", ink: "#3a4a5a", glow: "#fff3e8" },
  "Dark Forest": { sky: ["#101827", "#1b2a41"], ground: "#0d141f", accent: "#4f83cc", glow: "#9ec7ff", ink: "#0a0f18" },
  "Dreamlike": { sky: ["#cdb4de", "#e8d5f0"], ground: "#9a86b8", accent: "#b58ce0", glow: "#f5e9ff", ink: "#4a3b5c" },
  "Vintage Illustration": { sky: ["#e8d9bd", "#d6c3a0"], ground: "#a08c6a", accent: "#8c6f4a", glow: "#f5e9cf", ink: "#3d3226" },
  "Ink": { sky: ["#f2efe8", "#e5e1d5"], ground: "#c9c4b5", accent: "#1a1a1a", glow: "#ffffff", ink: "#111111" },
  "Gothic": { sky: ["#241b33", "#3a2b52"], ground: "#1a1424", accent: "#8c5fb0", glow: "#d1a3ff", ink: "#120d1a" },
  "Paper Cut": { sky: ["#f7e6d0", "#ffd9a0"], ground: "#e8b06a", accent: "#e07b54", glow: "#fff4d6", ink: "#5a3a2a" },
  "Fairy Tale": { sky: ["#ffe9f0", "#fff6dd"], ground: "#b8d8a8", accent: "#f0a8c0", glow: "#fffbe8", ink: "#5a4a58" },
  "Comic Illustration": { sky: ["#8ecae6", "#ffd166"], ground: "#6a994e", accent: "#ef476f", glow: "#ffffff", ink: "#073b4c" },
  "Mystical": { sky: ["#0f2e2e", "#1d4e4e"], ground: "#0a2020", accent: "#2ec4b6", glow: "#8ff0e0", ink: "#061616" },
  "Celestial": { sky: ["#0b1026", "#1a2456"], ground: "#0a0e1e", accent: "#e0c341", glow: "#fff7d6", ink: "#05070f" },
};

const NIGHT_STYLES = new Set(["Dark Forest", "Gothic", "Mystical", "Celestial"]);

// ---------------------------------------------------------------------------
// SVG scene-type compositions
// ---------------------------------------------------------------------------

function PortalScene({ p, night, seed }) {
  const rnd = mulberry32(seed + 101);
  return (
    <>
      {night && Array.from({ length: 22 }, (_, i) => (
        <circle key={`star-${i}`} cx={rnd() * 100} cy={rnd() * 46} r={0.35 + rnd() * 0.65} fill={p.glow} opacity={0.45 + rnd() * 0.45} />
      ))}
      {/* Ancient doorway with a luminous, otherworldly view beyond it. */}
      <path d="M18,91 V37 Q18,10 50,10 Q82,10 82,37 V91 Z" fill={p.ink} opacity="0.9" />
      <path d="M25,91 V38 Q25,18 50,18 Q75,18 75,38 V91 Z" fill={p.accent} />
      <path d="M32,91 V39 Q32,25 50,25 Q68,25 68,39 V91 Z" fill={p.sky[0]} />
      <path d="M32,70 Q43,57 51,69 T68,65 V91 H32 Z" fill={p.ground} opacity="0.85" />
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={`glow-${i}`} cx={35 + rnd() * 30} cy={34 + rnd() * 36} r={0.5 + rnd() * 0.8} fill={p.glow} opacity="0.9" />
      ))}
      {/* Carved symbols on the frame */}
      {Array.from({ length: 5 }, (_, i) => (
        <g key={`rune-${i}`} stroke={p.glow} strokeWidth="0.8" fill="none" opacity="0.9">
          <path d={`M${21 + i * 2},${35 + i * 9} l3,3 l-3,3 M${79 - i * 2},${35 + i * 9} l-3,3 l3,3`} />
        </g>
      ))}
      <circle cx="58" cy="73" r="2.3" fill={p.glow} stroke={p.ink} strokeWidth="0.7" />
      <path d="M58,75 v5 m0,-2 h2" stroke={p.ink} strokeWidth="1" fill="none" />
      <path d="M10,92 Q50,84 90,92" stroke={p.ink} strokeWidth="1.5" fill="none" opacity="0.6" />
    </>
  );
}

function ForestScene({ p, night, seed }) {
  const rnd = mulberry32(seed);
  const trees = Array.from({ length: 7 }, (_, i) => {
    const x = 6 + i * 14 + rnd() * 6;
    const h = 45 + rnd() * 35;
    return { x, h, w: 3 + rnd() * 4 };
  });
  return (
    <>
      {trees.map((t, i) => (
        <g key={i} opacity={0.5 + (i % 3) * 0.2}>
          <rect x={t.x} y={72 - t.h} width={t.w} height={t.h} rx={1} fill={p.ink} opacity={0.85} />
          <ellipse cx={t.x + t.w / 2} cy={72 - t.h} rx={9 + t.w} ry={5 + t.h / 6} fill={p.ink} opacity={0.75} />
        </g>
      ))}
      <ellipse cx="50" cy="88" rx="70" ry="12" fill={p.ground} opacity="0.9" />
      {/* blue lantern */}
      <circle cx="62" cy="38" r="2.2" fill={p.glow} opacity="0.95" />
      <circle cx="62" cy="38" r="6" fill={p.glow} opacity="0.25" />
      <circle cx="62" cy="38" r="11" fill={p.glow} opacity="0.1" />
      <line x1="62" y1="30" x2="62" y2="36" stroke={p.ink} strokeWidth="0.5" />
      {/* fireflies */}
      {Array.from({ length: 8 }, (_, i) => {
        const x = 20 + rnd() * 60;
        const y = 30 + rnd() * 45;
        return <circle key={i} cx={x} cy={y} r="0.7" fill={p.glow} opacity={0.4 + rnd() * 0.5} />;
      })}
      {night && <path d="M10,26 Q30,18 50,25 T90,24" stroke={p.glow} strokeWidth="0.4" fill="none" opacity="0.3" />}
    </>
  );
}

function ClockScene({ p, seed }) {
  const rnd = mulberry32(seed + 7);
  return (
    <>
      {/* giant clock face */}
      <circle cx="50" cy="46" r="26" fill={p.sky[0]} stroke={p.accent} strokeWidth="1.6" />
      <circle cx="50" cy="46" r="21" fill="none" stroke={p.ink} strokeWidth="0.8" opacity="0.6" />
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * 19}
            y1={46 + Math.sin(a) * 19}
            x2={50 + Math.cos(a) * 22}
            y2={46 + Math.sin(a) * 22}
            stroke={p.ink}
            strokeWidth="0.8"
          />
        );
      })}
      <line x1="50" y1="46" x2="50" y2="30" stroke={p.ink} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="50" y1="46" x2="61" y2="50" stroke={p.ink} strokeWidth="1.1" strokeLinecap="round" />
      {/* gears */}
      {[
        [24, 76, 9],
        [78, 72, 11],
        [60, 84, 7],
      ].map(([cx, cy, r], i) => (
        <g key={i} stroke={p.ink} fill={p.accent} opacity="0.9">
          {Array.from({ length: 8 }, (_, j) => {
            const a = (j / 8) * Math.PI * 2;
            return (
              <rect
                key={j}
                x={cx + Math.cos(a) * r - 1}
                y={cy + Math.sin(a) * r - 1.4}
                width="2"
                height="2.8"
                rx="0.5"
                stroke="none"
                fill={p.ink}
              />
            );
          })}
          <circle cx={cx} cy={cy} r={r} fill={i % 2 ? p.accent : p.ground} stroke={p.ink} strokeWidth="1" />
          <circle cx={cx} cy={cy} r={r / 3} fill={p.sky[0]} stroke={p.ink} strokeWidth="0.6" />
        </g>
      ))}
      <line x1="0" y1="90" x2="100" y2="90" stroke={p.ink} strokeWidth="1.2" opacity="0.6" />
      {Array.from({ length: 5 }, (_, i) => (
        <circle key={i} cx={15 + i * 18 + rnd() * 6} cy={22 + rnd() * 10} r="0.8" fill={p.glow} opacity="0.5" />
      ))}
    </>
  );
}

function CelestialScene({ p, seed }) {
  const rnd = mulberry32(seed + 13);
  return (
    <>
      {Array.from({ length: 40 }, (_, i) => (
        <circle key={i} cx={rnd() * 100} cy={rnd() * 70} r={0.3 + rnd() * 0.8} fill="#ffffff" opacity={0.4 + rnd() * 0.6} />
      ))}
      {/* constellation */}
      <g stroke={p.accent} strokeWidth="0.4" opacity="0.8">
        <line x1="30" y1="20" x2="42" y2="30" />
        <line x1="42" y1="30" x2="56" y2="24" />
        <line x1="56" y1="24" x2="68" y2="34" />
      </g>
      {/* star-tree */}
      <rect x="49" y="52" width="2.4" height="20" fill={p.glow} opacity="0.9" />
      <circle cx="50" cy="46" r="7" fill={p.glow} opacity="0.95" />
      <circle cx="50" cy="46" r="13" fill={p.glow} opacity="0.25" />
      <circle cx="50" cy="46" r="20" fill={p.glow} opacity="0.1" />
      {[[38, 62], [62, 58], [55, 70]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill={p.glow} opacity="0.8" />
      ))}
      {/* moonflower field */}
      <path d="M0,88 Q25,80 50,88 T100,88 V100 H0 Z" fill={p.ground} opacity="0.95" />
      {Array.from({ length: 10 }, (_, i) => (
        <circle key={i} cx={8 + i * 10 + rnd() * 4} cy={86 - rnd() * 4} r="1.4" fill={p.glow} opacity="0.7" />
      ))}
    </>
  );
}

function InteriorScene({ p, seed }) {
  const rnd = mulberry32(seed + 23);
  return (
    <>
      {/* room frame */}
      <rect x="8" y="8" width="84" height="80" fill={p.sky[1]} stroke={p.ink} strokeWidth="1" opacity="0.6" />
      <rect x="8" y="8" width="84" height="46" fill={p.sky[0]} opacity="0.7" />
      {/* table */}
      <rect x="20" y="62" width="60" height="4" fill={p.ink} opacity="0.9" />
      <rect x="24" y="66" width="4" height="16" fill={p.ink} opacity="0.8" />
      <rect x="72" y="66" width="4" height="16" fill={p.ink} opacity="0.8" />
      {/* pocket watch with painted door */}
      <circle cx="50" cy="58" r="7" fill={p.glow} stroke={p.accent} strokeWidth="1.4" />
      <rect x="48.6" y="54.5" width="2.8" height="5" fill={p.accent} />
      <circle cx="44" cy="40" r="5" fill={p.glow} opacity="0.85" />
      <circle cx="44" cy="40" r="9" fill={p.glow} opacity="0.3" />
      <rect x="60" y="52" width="12" height="10" fill={p.sky[1]} stroke={p.ink} strokeWidth="0.7" />
      {Array.from({ length: 4 }, (_, i) => (
        <rect key={i} x={26 + i * 14} y={54} width="3" height="8" fill={p.accent} opacity="0.8" />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={16 + rnd() * 68} cy={18 + rnd() * 28} r="0.6" fill={p.glow} opacity="0.4" />
      ))}
    </>
  );
}

function FigureScene({ p, seed, night }) {
  const rnd = mulberry32(seed + 31);
  return (
    <>
      {night ? (
        <>
          {Array.from({ length: 24 }, (_, i) => (
            <circle key={i} cx={rnd() * 100} cy={rnd() * 55} r={0.3 + rnd() * 0.7} fill="#ffffff" opacity={0.4 + rnd() * 0.5} />
          ))}
        </>
      ) : (
        <circle cx="76" cy="22" r="8" fill={p.glow} opacity="0.9" />
      )}
      <path d="M0,84 Q25,76 50,84 T100,84 V100 H0 Z" fill={p.ground} opacity="0.95" />
      {/* central figure */}
      <g>
        <circle cx="50" cy="42" r="5" fill={p.ink} />
        <path d="M50,47 C44,50 43,60 45,72 L55,72 C57,60 56,50 50,47 Z" fill={p.ink} />
        <path d="M45,58 L38,64 M55,58 L62,64" stroke={p.ink} strokeWidth="2.4" strokeLinecap="round" />
      </g>
      {/* lantern */}
      <circle cx="63" cy="56" r="2" fill={p.glow} />
      <circle cx="63" cy="56" r="5" fill={p.glow} opacity="0.3" />
      {Array.from({ length: 6 }, (_, i) => (
        <circle key={i} cx={20 + rnd() * 60} cy={30 + rnd() * 40} r="0.7" fill={p.glow} opacity={0.3 + rnd() * 0.5} />
      ))}
    </>
  );
}

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Style overlays — what makes each style look genuinely different
// ---------------------------------------------------------------------------

function StyleOverlay({ styleName }) {
  switch (styleName) {
    case "Watercolor":
      return (
        <>
          <div className="cyp-ov cyp-ov-watercolor" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cyp-svg">
            <ellipse cx="30" cy="70" rx="30" ry="18" fill="#ffffff" opacity="0.12" />
            <ellipse cx="70" cy="40" rx="26" ry="22" fill="#ffffff" opacity="0.1" />
          </svg>
        </>
      );
    case "Ink":
      return (
        <>
          <div className="cyp-ov cyp-ov-ink" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cyp-svg">
            {Array.from({ length: 14 }, (_, i) => (
              <line key={i} x1="0" y1={6 + i * 7} x2="100" y2={4 + i * 7} stroke="#111" strokeWidth="0.15" opacity="0.35" />
            ))}
          </svg>
        </>
      );
    case "Paper Cut":
      return (
        <>
          <div className="cyp-ov cyp-ov-paper" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cyp-svg">
            <path d="M0,100 V70 Q25,58 50,70 T100,66 V100 Z" fill="#000" opacity="0.18" />
            <path d="M0,100 V82 Q30,72 60,82 T100,80 V100 Z" fill="#000" opacity="0.22" />
          </svg>
        </>
      );
    case "Comic Illustration":
      return (
        <>
          <div className="cyp-ov cyp-ov-comic" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cyp-svg">
            {Array.from({ length: 7 }, (_, r) =>
              Array.from({ length: 10 }, (_, c) => (
                <circle key={`${r}-${c}`} cx={c * 10 + 5} cy={r * 12 + 6} r="1.1" fill="#000" opacity="0.14" />
              )),
            )}
          </svg>
        </>
      );
    case "Gothic":
      return (
        <>
          <div className="cyp-ov cyp-ov-gothic" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cyp-svg">
            {Array.from({ length: 5 }, (_, i) => (
              <path
                key={i}
                d={`M${8 + i * 20},100 V40 Q${12 + i * 20},22 ${16 + i * 20},40 V100`}
                fill="#000"
                opacity="0.28"
              />
            ))}
          </svg>
        </>
      );
    case "Vintage Illustration":
      return (
        <>
          <div className="cyp-ov cyp-ov-vintage" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cyp-svg">
            <rect x="3" y="3" width="94" height="94" fill="none" stroke="#3d3226" strokeWidth="0.8" opacity="0.5" />
            <rect x="6" y="6" width="88" height="88" fill="none" stroke="#3d3226" strokeWidth="0.4" opacity="0.4" />
          </svg>
        </>
      );
    case "Dreamlike":
      return <div className="cyp-ov cyp-ov-dream" />;
    case "Fairy Tale":
      return <div className="cyp-ov cyp-ov-fairytale" />;
    case "Mystical":
      return (
        <>
          <div className="cyp-ov cyp-ov-mystical" />
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="cyp-svg">
            {Array.from({ length: 6 }, (_, i) => (
              <circle key={i} cx={18 + i * 13} cy={30 + (i % 3) * 18} r="5" fill="none" stroke="#8ff0e0" strokeWidth="0.3" opacity="0.5" />
            ))}
          </svg>
        </>
      );
    case "Celestial":
      return <div className="cyp-ov cyp-ov-celestial" />;
    default:
      return <div className="cyp-ov cyp-ov-storybook" />;
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SceneIllustration({ description, style, seed, className = "" }) {
  const { sceneType, palette, night } = useMemo(() => {
    const st = detectSceneType(description);
    const pal = PALETTES[style] || PALETTES["Classic Storybook"];
    return { sceneType: st, palette: pal, night: NIGHT_STYLES.has(style) };
  }, [description, style]);

  const h = useMemo(() => hashString(`${description}|${style}|${seed ?? 0}`), [description, style, seed]);

  return (
    <div
      className={`cyp-illustration ${className}`}
      role="img"
      aria-label={description?.trim() || `Illustration of a ${sceneType} scene`}
      style={{ background: `linear-gradient(180deg, ${palette.sky[0]}, ${palette.sky[1]})` }}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMax slice" className="cyp-svg cyp-svg-main">
        <SceneArt type={sceneType} p={palette} night={night} seed={h % 100000} description={description} />
      </svg>
      <StyleOverlay styleName={style} />
    </div>
  );
}

const NAMED_COLORS = {
  red: "#d94b4b", crimson: "#a51f3d", orange: "#e88b3d", yellow: "#f4d35e",
  gold: "#d7ad3f", green: "#4f9b68", emerald: "#16866a", teal: "#2a9d8f",
  blue: "#3986d4", cyan: "#53d6e5", turquoise: "#35b9b0", purple: "#9462c7",
  violet: "#8757c5", pink: "#e98cb7", rose: "#d86a88", white: "#fff8ed",
  black: "#171a26", silver: "#b9c5d3", gray: "#9299a6", grey: "#9299a6",
  brown: "#855b3d", ivory: "#f5edda", lavender: "#b7a0e6",
};

function colorFromDescription(description, fallback) {
  const words = (description || "").toLowerCase().match(/[a-z]+/g) || [];
  for (const word of words) if (NAMED_COLORS[word]) return NAMED_COLORS[word];
  return fallback;
}

function LandscapeScene({ p, night, seed, description }) {
  const d = (description || "").toLowerCase();
  const rnd = mulberry32(seed + 43);
  const castle = /castle|fortress|palace|keep|citadel/.test(d);
  const river = /river|stream|waterfall|water|lake|ocean|sea|canal/.test(d);
  const moon = /moon|lunar|night|midnight/.test(d);
  const mountain = /mountain|hill|cliff|volcano/.test(d);
  const waterColor = colorFromDescription(d.match(/(?:glowing |sparkling |crystal |deep )?(?:blue|green|turquoise|teal|silver|purple|red|golden)\s+(?:river|water|lake|ocean|sea)/)?.[0] || "", "#3986d4");
  const skyColor = colorFromDescription(d.match(/(?:under|beneath|below|in)\s+(?:a\s+)?(?:bright\s+|glowing\s+)?(?:purple|violet|blue|red|orange|pink|golden|silver|white|yellow)\s+(?:moon|sky)/)?.[0] || "", p.sky[0]);
  const moonColor = colorFromDescription(d.match(/(?:purple|violet|blue|red|orange|pink|golden|silver|white|yellow|crimson)\s+moon/)?.[0] || "", p.glow);
  const castleColor = colorFromDescription(d.match(/(?:red|crimson|orange|yellow|gold|green|emerald|blue|purple|violet|pink|brown|gray|grey|white|black|silver)\s+(?:stone\s+)?(?:castle|fortress|palace|keep|citadel)/)?.[0] || "", p.accent);
  return (
    <>
      <rect x="0" y="0" width="100" height="100" fill={skyColor} opacity="0.25" />
      {Array.from({ length: night || moon ? 28 : 10 }, (_, i) => <circle key={`star-${i}`} cx={rnd()*100} cy={rnd()*56} r={0.25+rnd()*0.65} fill={p.glow} opacity={0.3+rnd()*0.6} />)}
      {moon && <><circle cx="78" cy="20" r="11" fill={moonColor} opacity="0.22"/><circle cx="78" cy="20" r="6.5" fill={moonColor}/><circle cx="75.5" cy="17.5" r="1.3" fill="#fff" opacity="0.45"/></>}
      {mountain && <><path d="M0 66 L18 32 L34 58 L53 25 L78 61 L92 39 L100 58 V100 H0Z" fill={p.ink} opacity="0.55"/><path d="M18 32 L25 45 L18 42 L13 47Z M53 25 L62 43 L53 38 L46 44Z" fill={p.glow} opacity="0.8"/></>}
      {castle && <g stroke={p.ink} strokeWidth="0.8" fill={castleColor}>
        <path d="M18 80 V49 H28 V40 H35 V49 H43 V59 H57 V49 H65 V40 H72 V49 H82 V80Z" />
        <path d="M13 51 V31 H24 V51 M31 50 V24 H43 V50 M58 50 V27 H70 V50 M77 51 V31 H88 V51" fill={p.ground}/>
        <path d="M13 31 L18.5 24 L24 31 M31 24 L37 16 L43 24 M58 27 L64 19 L70 27 M77 31 L82.5 24 L88 31" fill={castleColor}/>
        <path d="M43 80 V66 Q50 56 57 66 V80" fill={p.ink}/>
        <rect x="22" y="57" width="4" height="7" fill={p.glow}/><rect x="70" y="57" width="4" height="7" fill={p.glow}/>
      </g>}
      {!castle && !mountain && <path d="M0 67 Q24 53 48 67 T100 63 V100 H0Z" fill={p.ground} opacity="0.9"/>}
      {river && <><path d="M37 63 Q51 68 44 78 Q36 87 48 100 H91 Q75 85 81 77 Q90 66 74 62Z" fill={waterColor} opacity="0.96"/><path d="M50 72 Q55 77 48 83 T55 97" fill="none" stroke="#fff" strokeWidth="1.2" opacity="0.75"/><path d="M62 76 l7 1 M58 87 l10 1" stroke="#fff" strokeWidth="0.7" opacity="0.7"/></>}
      {!river && <path d="M0 83 Q28 76 52 84 T100 82 V100 H0Z" fill={p.ground}/>}
      {Array.from({ length: 9 }, (_, i) => <circle key={`glow-${i}`} cx={4+rnd()*92} cy={55+rnd()*35} r={0.4+rnd()*0.8} fill={p.glow} opacity="0.5"/>)}
    </>
  );
}

function SceneArt({ type, p, night, seed, description }) {
  switch (type) {
    case "landscape":
      return <LandscapeScene p={p} night={night} seed={seed} description={description} />;
    case "portal":
      return <PortalScene p={p} night={night} seed={seed} />;
    case "forest":
      return <ForestScene p={p} night={night} seed={seed} />;
    case "clock":
      return <ClockScene p={p} seed={seed} />;
    case "celestial":
      return <CelestialScene p={p} seed={seed} />;
    case "interior":
      return <InteriorScene p={p} seed={seed} />;
    default:
      return <FigureScene p={p} night={night} seed={seed} />;
  }
}
