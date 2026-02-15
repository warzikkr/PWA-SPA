/**
 * BodySVG.tsx — Shared SVG body outlines (front + back).
 * Single source of truth; used only by UnifiedBodyMap.
 */

/** SVG body outline — front view */
export function FrontBodySVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" stroke="#ccc" strokeWidth="0.5">
      <ellipse cx="50" cy="12" rx="10" ry="11" />
      <rect x="45" y="23" width="10" height="6" rx="2" />
      <path d="M30 29 Q28 29 26 35 L22 55 Q20 60 25 65 L30 70 Q35 73 40 73 L60 73 Q65 73 70 70 L75 65 Q80 60 78 55 L74 35 Q72 29 70 29 Z" />
      <path d="M26 32 Q18 40 12 52 Q8 58 10 62 L15 58 Q20 50 24 42" />
      <path d="M74 32 Q82 40 88 52 Q92 58 90 62 L85 58 Q80 50 76 42" />
      <path d="M35 73 Q33 90 32 110 Q31 130 30 145 Q29 165 32 180 L38 180 Q40 165 40 145 Q40 130 41 110 Q42 90 42 80" />
      <path d="M58 80 Q58 90 59 110 Q60 130 60 145 Q60 165 62 180 L68 180 Q71 165 70 145 Q69 130 68 110 Q67 90 65 73" />
      <line x1="50" y1="29" x2="50" y2="73" strokeDasharray="2 2" opacity="0.3" />
    </svg>
  );
}

/** SVG body outline — back view */
export function BackBodySVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" stroke="#ccc" strokeWidth="0.5">
      <ellipse cx="50" cy="12" rx="10" ry="11" />
      <rect x="45" y="23" width="10" height="6" rx="2" />
      <path d="M30 29 Q28 29 26 35 L22 55 Q20 60 25 65 L30 70 Q35 73 40 73 L60 73 Q65 73 70 70 L75 65 Q80 60 78 55 L74 35 Q72 29 70 29 Z" />
      <path d="M26 32 Q18 40 12 52 Q8 58 10 62 L15 58 Q20 50 24 42" />
      <path d="M74 32 Q82 40 88 52 Q92 58 90 62 L85 58 Q80 50 76 42" />
      <path d="M35 73 Q33 90 32 110 Q31 130 30 145 Q29 165 32 180 L38 180 Q40 165 40 145 Q40 130 41 110 Q42 90 42 80" />
      <path d="M58 80 Q58 90 59 110 Q60 130 60 145 Q60 165 62 180 L68 180 Q71 165 70 145 Q69 130 68 110 Q67 90 65 73" />
      <line x1="50" y1="29" x2="50" y2="73" strokeDasharray="2 2" opacity="0.3" />
      {/* Spine line */}
      <line x1="50" y1="23" x2="50" y2="73" stroke="#ddd" strokeWidth="0.8" />
    </svg>
  );
}
