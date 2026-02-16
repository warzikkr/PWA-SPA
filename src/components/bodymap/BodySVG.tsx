/**
 * BodySVG.tsx — Detailed SVG body outlines (front + back).
 * Single source of truth; used only by UnifiedBodyMap.
 */

const STROKE = '#bbb';
const GUIDE = '#ddd';

/** SVG body outline — front view */
export function FrontBodySVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" strokeWidth="0.5">
      {/* Head */}
      <ellipse cx="50" cy="12" rx="10" ry="11" stroke={STROKE} />
      {/* Face hints */}
      <circle cx="46" cy="10" r="1.2" stroke={GUIDE} strokeWidth="0.3" />
      <circle cx="54" cy="10" r="1.2" stroke={GUIDE} strokeWidth="0.3" />
      <line x1="50" y1="12" x2="50" y2="14.5" stroke={GUIDE} strokeWidth="0.3" />
      <path d="M47 16.5 Q50 18 53 16.5" stroke={GUIDE} strokeWidth="0.3" />
      {/* Jaw line hint */}
      <path d="M41 15 Q43 20 50 21 Q57 20 59 15" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />

      {/* Neck */}
      <rect x="45" y="23" width="10" height="6" rx="2" stroke={STROKE} />

      {/* Torso */}
      <path
        d="M30 29 Q28 29 26 35 L22 55 Q20 60 25 65 L30 70 Q35 73 40 73 L60 73 Q65 73 70 70 L75 65 Q80 60 78 55 L74 35 Q72 29 70 29 Z"
        stroke={STROKE}
      />
      {/* Collarbone */}
      <path d="M45 29 Q38 30 30 29" stroke={GUIDE} strokeWidth="0.3" />
      <path d="M55 29 Q62 30 70 29" stroke={GUIDE} strokeWidth="0.3" />
      {/* Pec line */}
      <path d="M34 37 Q42 40 50 38 Q58 40 66 37" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1.5 1" />
      {/* Centre line */}
      <line x1="50" y1="29" x2="50" y2="73" stroke={GUIDE} strokeWidth="0.4" strokeDasharray="2 2" opacity="0.3" />
      {/* Navel */}
      <circle cx="50" cy="44" r="0.8" stroke={GUIDE} strokeWidth="0.3" />
      {/* Waist hint */}
      <path d="M30 47 Q40 49 50 48 Q60 49 70 47" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1.5" />
      {/* Hip crease */}
      <path d="M40 54 Q44 56 48 55" stroke={GUIDE} strokeWidth="0.3" />
      <path d="M60 54 Q56 56 52 55" stroke={GUIDE} strokeWidth="0.3" />

      {/* Left arm */}
      <path d="M26 32 Q18 40 12 52 Q8 58 10 62 L15 58 Q20 50 24 42" stroke={STROKE} />
      {/* Right arm */}
      <path d="M74 32 Q82 40 88 52 Q92 58 90 62 L85 58 Q80 50 76 42" stroke={STROKE} />
      {/* Elbow hints */}
      <circle cx="13" cy="47" r="1.5" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />
      <circle cx="87" cy="47" r="1.5" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />
      {/* Wrist hints */}
      <line x1="8" y1="58" x2="12" y2="57" stroke={GUIDE} strokeWidth="0.3" />
      <line x1="92" y1="58" x2="88" y2="57" stroke={GUIDE} strokeWidth="0.3" />

      {/* Left leg */}
      <path d="M35 73 Q33 90 32 110 Q31 130 30 145 Q29 165 32 180 L38 180 Q40 165 40 145 Q40 130 41 110 Q42 90 42 80" stroke={STROKE} />
      {/* Right leg */}
      <path d="M58 80 Q58 90 59 110 Q60 130 60 145 Q60 165 62 180 L68 180 Q71 165 70 145 Q69 130 68 110 Q67 90 65 73" stroke={STROKE} />
      {/* Kneecap hints */}
      <ellipse cx="35" cy="138" rx="3.5" ry="4" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />
      <ellipse cx="65" cy="138" rx="3.5" ry="4" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />
      {/* Ankle hints */}
      <circle cx="35" cy="172" r="1.5" stroke={GUIDE} strokeWidth="0.3" />
      <circle cx="65" cy="172" r="1.5" stroke={GUIDE} strokeWidth="0.3" />
    </svg>
  );
}

/** SVG body outline — back view */
export function BackBodySVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" strokeWidth="0.5">
      {/* Head */}
      <ellipse cx="50" cy="12" rx="10" ry="11" stroke={STROKE} />

      {/* Neck */}
      <rect x="45" y="23" width="10" height="6" rx="2" stroke={STROKE} />

      {/* Torso */}
      <path
        d="M30 29 Q28 29 26 35 L22 55 Q20 60 25 65 L30 70 Q35 73 40 73 L60 73 Q65 73 70 70 L75 65 Q80 60 78 55 L74 35 Q72 29 70 29 Z"
        stroke={STROKE}
      />
      {/* Spine */}
      <line x1="50" y1="23" x2="50" y2="73" stroke={GUIDE} strokeWidth="0.8" />
      {/* Scapula hints */}
      <path d="M36 32 Q40 36 44 34" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />
      <path d="M64 32 Q60 36 56 34" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />
      {/* Mid-back line */}
      <path d="M34 40 Q42 42 50 41 Q58 42 66 40" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1.5 1" />
      {/* Lower-back / waist line */}
      <path d="M32 48 Q41 50 50 49 Q59 50 68 48" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1.5" />
      {/* Glute cleft hint */}
      <line x1="50" y1="52" x2="50" y2="60" stroke={GUIDE} strokeWidth="0.3" />
      {/* Glute line */}
      <path d="M38 56 Q44 60 50 58 Q56 60 62 56" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />

      {/* Left arm */}
      <path d="M26 32 Q18 40 12 52 Q8 58 10 62 L15 58 Q20 50 24 42" stroke={STROKE} />
      {/* Right arm */}
      <path d="M74 32 Q82 40 88 52 Q92 58 90 62 L85 58 Q80 50 76 42" stroke={STROKE} />
      {/* Elbow hints */}
      <circle cx="13" cy="47" r="1.5" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />
      <circle cx="87" cy="47" r="1.5" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1" />
      {/* Wrist hints */}
      <line x1="8" y1="58" x2="12" y2="57" stroke={GUIDE} strokeWidth="0.3" />
      <line x1="92" y1="58" x2="88" y2="57" stroke={GUIDE} strokeWidth="0.3" />

      {/* Left leg */}
      <path d="M35 73 Q33 90 32 110 Q31 130 30 145 Q29 165 32 180 L38 180 Q40 165 40 145 Q40 130 41 110 Q42 90 42 80" stroke={STROKE} />
      {/* Right leg */}
      <path d="M58 80 Q58 90 59 110 Q60 130 60 145 Q60 165 62 180 L68 180 Q71 165 70 145 Q69 130 68 110 Q67 90 65 73" stroke={STROKE} />
      {/* Knee crease hints */}
      <path d="M31 138 Q35 140 39 138" stroke={GUIDE} strokeWidth="0.3" />
      <path d="M61 138 Q65 140 69 138" stroke={GUIDE} strokeWidth="0.3" />
      {/* Ankle hints */}
      <circle cx="35" cy="172" r="1.5" stroke={GUIDE} strokeWidth="0.3" />
      <circle cx="65" cy="172" r="1.5" stroke={GUIDE} strokeWidth="0.3" />
      {/* Achilles tendon hints */}
      <line x1="35" y1="155" x2="35" y2="170" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1.5" />
      <line x1="65" y1="155" x2="65" y2="170" stroke={GUIDE} strokeWidth="0.3" strokeDasharray="1 1.5" />
    </svg>
  );
}
