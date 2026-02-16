/**
 * BodySVG.tsx — Professional anatomical body outlines (Female/Male × Front/Back).
 *
 * ViewBox 0 0 100 200.  Outlines drawn with cubic-Bézier curves for smooth,
 * fashion-croquis quality.  Front/back share the same silhouette — only the
 * anatomical guide lines differ.
 */
import type { BodyGender, BodySide } from '../../types';

/* ── palette ── */
const O = '#b0b0b0';
const G = '#d4d4d4';
const SW = '0.45';
const GW = '0.3';
const DASH = '1.5 1.5';

/* ================================================================
   Shared silhouettes — each gender has ONE outline used for both
   front and back views.
   ================================================================ */

function FemaleSilhouette() {
  return (
    <g stroke={O} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <ellipse cx="50" cy="14" rx="8" ry="10" />

      {/* Neck */}
      <path d="M43.5 23 C43 27 42 30 41.5 33" />
      <path d="M56.5 23 C57 27 58 30 58.5 33" />

      {/* Torso */}
      <path d="
        M24 37
        C22 37 21 40 22 44
        C24 49 28 52 32 55
        C34 57 35 60 35 63
        C35 67 32 72 29 77
        C27 81 28 85 33 88
        C38 90 44 91 50 92
        C56 91 62 90 67 88
        C72 85 73 81 71 77
        C68 72 65 67 65 63
        C65 60 66 57 68 55
        C72 52 76 49 78 44
        C79 40 78 37 76 37
        C70 35 60 34 50 33
        C40 34 30 35 24 37 Z
      " />

      {/* Left arm */}
      <path d="
        M22 43
        C19 50 17 57 15 65
        C13 73 12 81 11 89
        C10 95 10 99 11 103
        C12 105 14 104 15 102
        C15 98 16 92 17 86
        C18 78 19 70 21 62
        C23 54 25 48 27 44
      " />

      {/* Right arm */}
      <path d="
        M78 43
        C81 50 83 57 85 65
        C87 73 88 81 89 89
        C90 95 90 99 89 103
        C88 105 86 104 85 102
        C85 98 84 92 83 86
        C82 78 81 70 79 62
        C77 54 75 48 73 44
      " />

      {/* Left leg */}
      <path d="
        M36 88
        C35 96 34 106 33 118
        C32 130 32 140 31 152
        C31 162 30 172 30 178
        L28 192
        L36 192
        C36 186 37 178 37 170
        C38 158 38 146 39 134
        C40 122 41 110 42 98
        C42 94 43 91 44 88
      " />

      {/* Right leg */}
      <path d="
        M56 88
        C57 91 58 94 58 98
        C59 110 60 122 61 134
        C62 146 62 158 63 170
        C63 178 64 186 64 192
        L72 192
        L70 178
        C69 172 69 162 69 152
        C68 140 68 130 67 118
        C66 106 65 96 64 88
      " />
    </g>
  );
}

function MaleSilhouette() {
  return (
    <g stroke={O} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      {/* Head */}
      <ellipse cx="50" cy="14" rx="8.5" ry="10" />

      {/* Neck (wider) */}
      <path d="M43 23 C42 27 41 30 40 33" />
      <path d="M57 23 C58 27 59 30 60 33" />

      {/* Torso — broader shoulders, less waist taper, narrower hips */}
      <path d="
        M21 37
        C19 37 18 40 19 44
        C21 49 25 52 30 55
        C32 57 33 60 33 63
        C33 67 31 72 31 77
        C30 81 31 85 36 88
        C41 90 46 91 50 92
        C54 91 59 90 64 88
        C69 85 70 81 69 77
        C69 72 67 67 67 63
        C67 60 68 57 70 55
        C75 52 79 49 81 44
        C82 40 81 37 79 37
        C72 35 60 34 50 33
        C40 34 28 35 21 37 Z
      " />

      {/* Left arm (thicker) */}
      <path d="
        M20 43
        C17 50 14 57 12 65
        C10 73 9 81 8 89
        C7 95 7 99 8 103
        C9 106 12 105 13 102
        C13 98 13 92 14 86
        C15 78 17 70 19 62
        C21 54 23 48 25 44
      " />

      {/* Right arm */}
      <path d="
        M80 43
        C83 50 86 57 88 65
        C90 73 91 81 92 89
        C93 95 93 99 92 103
        C91 106 88 105 87 102
        C87 98 87 92 86 86
        C85 78 83 70 81 62
        C79 54 77 48 75 44
      " />

      {/* Left leg (slightly wider) */}
      <path d="
        M38 88
        C37 96 35 106 34 118
        C33 130 33 140 32 152
        C32 162 31 172 31 178
        L29 192
        L37 192
        C37 186 37 178 38 170
        C38 158 39 146 40 134
        C40 122 41 110 42 98
        C43 94 44 91 46 88
      " />

      {/* Right leg */}
      <path d="
        M54 88
        C56 91 57 94 58 98
        C59 110 60 122 60 134
        C61 146 62 158 62 170
        C63 178 63 186 63 192
        L71 192
        L69 178
        C69 172 68 162 68 152
        C67 140 67 130 66 118
        C65 106 63 96 62 88
      " />
    </g>
  );
}

/* ================================================================
   Guide lines — differ between front and back views
   ================================================================ */

function FrontGuides({ isMale }: { isMale?: boolean }) {
  const sx = isMale ? 21 : 24;
  const ex = isMale ? 79 : 76;
  return (
    <g stroke={G} strokeWidth={GW} fill="none">
      {/* Face hints */}
      <circle cx="46.5" cy="12" r="0.9" />
      <circle cx="53.5" cy="12" r="0.9" />
      <path d="M48 17 Q50 18.5 52 17" />

      {/* Collarbone */}
      <path d={`M44 34 C38 36 30 37 ${sx} 37`} />
      <path d={`M56 34 C62 36 70 37 ${ex} 37`} />

      {/* Centre line */}
      <line x1="50" y1="34" x2="50" y2="92" strokeDasharray="2 2" opacity="0.25" strokeWidth="0.4" />

      {/* Bust / Pec line */}
      <path d={`M${sx + 8} 50 Q42 ${isMale ? 53 : 54} 50 ${isMale ? 52 : 53} Q58 ${isMale ? 53 : 54} ${ex - 8} 50`} strokeDasharray={DASH} />

      {/* Waist */}
      <path d={`M${sx + 10} 63 Q42 65 50 64 Q58 65 ${ex - 10} 63`} strokeDasharray={DASH} />

      {/* Navel */}
      <circle cx="50" cy="68" r="0.7" />

      {/* Hip line */}
      <path d="M30 77 Q40 79 50 78 Q60 79 70 77" strokeDasharray={DASH} />

      {/* Kneecap hints */}
      <ellipse cx="36" cy="132" rx="3" ry="3.5" strokeDasharray="1 1" />
      <ellipse cx="64" cy="132" rx="3" ry="3.5" strokeDasharray="1 1" />

      {/* Ankle hints */}
      <circle cx="33" cy="180" r="1.5" />
      <circle cx="67" cy="180" r="1.5" />
    </g>
  );
}

function BackGuides({ isMale }: { isMale?: boolean }) {
  return (
    <g stroke={G} strokeWidth={GW} fill="none">
      {/* Hair line hint */}
      <path d="M43 8 Q46 5 50 4.5 Q54 5 57 8" />

      {/* Spine */}
      <line x1="50" y1="28" x2="50" y2="92" strokeWidth="0.5" />

      {/* Scapulae */}
      <path d={`M${isMale ? 34 : 36} 43 Q${isMale ? 39 : 40} 49 ${isMale ? 46 : 46} 45`} strokeDasharray="1 1" />
      <path d={`M${isMale ? 66 : 64} 43 Q${isMale ? 61 : 60} 49 ${isMale ? 54 : 54} 45`} strokeDasharray="1 1" />

      {/* Mid-back line */}
      <path d="M33 57 Q42 59 50 58 Q58 59 67 57" strokeDasharray={DASH} />

      {/* Lower-back line */}
      <path d="M32 72 Q41 74 50 73 Q59 74 68 72" strokeDasharray={DASH} />

      {/* Glute line */}
      <path d="M36 85 Q44 90 50 88 Q56 90 64 85" strokeDasharray="1 1" />

      {/* Knee crease */}
      <path d="M33 132 Q36 134 40 132" />
      <path d="M60 132 Q64 134 67 132" />

      {/* Ankle hints */}
      <circle cx="33" cy="180" r="1.5" />
      <circle cx="67" cy="180" r="1.5" />

      {/* Achilles tendon */}
      <line x1="33.5" y1="162" x2="33" y2="178" strokeDasharray="1 1.5" />
      <line x1="66.5" y1="162" x2="67" y2="178" strokeDasharray="1 1.5" />
    </g>
  );
}

/* ================================================================
   Exported SVG components (4 variants)
   ================================================================ */

export function FemaleFrontSVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none">
      <FemaleSilhouette />
      <FrontGuides />
    </svg>
  );
}

export function FemaleBackSVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none">
      <FemaleSilhouette />
      <BackGuides />
    </svg>
  );
}

export function MaleFrontSVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none">
      <MaleSilhouette />
      <FrontGuides isMale />
    </svg>
  );
}

export function MaleBackSVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none">
      <MaleSilhouette />
      <BackGuides isMale />
    </svg>
  );
}

/* ── Selector helper ── */

const SVG_MAP: Record<`${BodyGender}_${BodySide}`, () => React.JSX.Element> = {
  female_front: FemaleFrontSVG,
  female_back: FemaleBackSVG,
  male_front: MaleFrontSVG,
  male_back: MaleBackSVG,
};

export function getBodySVG(gender: BodyGender, side: BodySide) {
  const Component = SVG_MAP[`${gender}_${side}`];
  return <Component />;
}
