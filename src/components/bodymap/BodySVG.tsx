/**
 * BodySVG.tsx — Anatomical body outlines for the body-map component.
 *
 * Four variants: Female/Male × Front/Back.
 * ViewBox: 0 0 100 200  —  positions are in the same coordinate space
 * as the hitbox data in bodyMapData.ts.
 */
import type { BodyGender, BodySide } from '../../types';

const O = '#bbb';   // outline stroke
const G = '#ddd';   // guide / detail stroke
const SW = '0.5';   // main stroke width
const GW = '0.3';   // guide stroke width
const DASH = '1.5 1.5';

/* ── Shared sub-components ── */

function FaceHints() {
  return (
    <>
      <circle cx="46" cy="13" r="1" stroke={G} strokeWidth={GW} />
      <circle cx="54" cy="13" r="1" stroke={G} strokeWidth={GW} />
      <line x1="50" y1="15" x2="50" y2="17" stroke={G} strokeWidth={GW} />
      <path d="M47.5 19 Q50 20.5 52.5 19" stroke={G} strokeWidth={GW} />
    </>
  );
}

function CentreLine({ y1, y2 }: { y1: number; y2: number }) {
  return (
    <line
      x1="50" y1={y1} x2="50" y2={y2}
      stroke={G} strokeWidth="0.4" strokeDasharray="2 2" opacity="0.25"
    />
  );
}

/* ── Female Front ── */

export function FemaleFrontSVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" strokeWidth={SW}>
      {/* Head */}
      <ellipse cx="50" cy="16" rx="9" ry="11.5" stroke={O} />
      <FaceHints />

      {/* Neck */}
      <line x1="44" y1="27" x2="43" y2="35" stroke={O} />
      <line x1="56" y1="27" x2="57" y2="35" stroke={O} />

      {/* Torso */}
      <path
        d="M26 38 Q23 38 20 44 Q24 50 30 52 L34 60 Q31 68 28 76 L28 83 Q30 90 38 93 L46 93 Q50 96 54 93 L62 93 Q70 90 72 83 L72 76 Q69 68 66 60 L70 52 Q76 50 80 44 Q77 38 74 38 Z"
        stroke={O}
      />
      {/* Collarbone */}
      <path d="M44 36 Q36 38 26 38" stroke={G} strokeWidth={GW} />
      <path d="M56 36 Q64 38 74 38" stroke={G} strokeWidth={GW} />
      {/* Bust line */}
      <path d="M34 48 Q42 52 50 50 Q58 52 66 48" stroke={G} strokeWidth={GW} strokeDasharray={DASH} />
      <CentreLine y1={38} y2={93} />
      {/* Navel */}
      <circle cx="50" cy="68" r="0.8" stroke={G} strokeWidth={GW} />
      {/* Waist hint */}
      <path d="M34 60 Q42 62 50 61 Q58 62 66 60" stroke={G} strokeWidth={GW} strokeDasharray={DASH} />
      {/* Hip crease */}
      <path d="M40 82 Q44 86 48 84" stroke={G} strokeWidth={GW} />
      <path d="M60 82 Q56 86 52 84" stroke={G} strokeWidth={GW} />

      {/* Left arm */}
      <path d="M22 42 Q16 54 12 66 Q8 78 8 88 Q7 96 10 102 L14 98 Q14 90 14 82 Q16 70 18 60 Q20 50 22 44" stroke={O} />
      {/* Right arm */}
      <path d="M78 42 Q84 54 88 66 Q92 78 92 88 Q93 96 90 102 L86 98 Q86 90 86 82 Q84 70 82 60 Q80 50 78 44" stroke={O} />
      {/* Elbow hints */}
      <ellipse cx="13" cy="67" rx="2" ry="2.5" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      <ellipse cx="87" cy="67" rx="2" ry="2.5" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />

      {/* Left leg */}
      <path d="M38 93 Q36 110 35 126 Q34 140 33 152 Q32 164 31 176 L29 188 L36 188 Q37 176 37 164 Q38 152 38 140 Q39 128 40 118 Q42 106 44 93" stroke={O} />
      {/* Right leg */}
      <path d="M56 93 Q58 106 60 118 Q61 128 62 140 Q62 152 63 164 Q63 176 64 188 L71 188 Q69 176 68 164 Q67 152 66 140 Q66 128 65 126 Q64 110 62 93" stroke={O} />
      {/* Kneecap hints */}
      <ellipse cx="36.5" cy="130" rx="3" ry="4" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      <ellipse cx="63.5" cy="130" rx="3" ry="4" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      {/* Ankle hints */}
      <circle cx="33" cy="178" r="1.5" stroke={G} strokeWidth={GW} />
      <circle cx="67" cy="178" r="1.5" stroke={G} strokeWidth={GW} />
    </svg>
  );
}

/* ── Female Back ── */

export function FemaleBackSVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" strokeWidth={SW}>
      {/* Head */}
      <ellipse cx="50" cy="16" rx="9" ry="11.5" stroke={O} />
      {/* Hair hint */}
      <path d="M42 10 Q44 6 50 5 Q56 6 58 10" stroke={G} strokeWidth={GW} />

      {/* Neck */}
      <line x1="44" y1="27" x2="43" y2="35" stroke={O} />
      <line x1="56" y1="27" x2="57" y2="35" stroke={O} />

      {/* Torso */}
      <path
        d="M26 38 Q23 38 20 44 Q24 50 30 52 L34 60 Q31 68 28 76 L28 83 Q30 90 38 93 L46 93 Q50 96 54 93 L62 93 Q70 90 72 83 L72 76 Q69 68 66 60 L70 52 Q76 50 80 44 Q77 38 74 38 Z"
        stroke={O}
      />
      {/* Spine */}
      <line x1="50" y1="28" x2="50" y2="93" stroke={G} strokeWidth="0.6" />
      {/* Scapulae */}
      <path d="M36 42 Q40 48 46 44" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      <path d="M64 42 Q60 48 54 44" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      {/* Mid-back line */}
      <path d="M34 56 Q42 58 50 57 Q58 58 66 56" stroke={G} strokeWidth={GW} strokeDasharray={DASH} />
      {/* Lower-back line */}
      <path d="M32 70 Q41 72 50 71 Q59 72 68 70" stroke={G} strokeWidth={GW} strokeDasharray={DASH} />
      {/* Glute line */}
      <path d="M36 84 Q44 90 50 87 Q56 90 64 84" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />

      {/* Left arm */}
      <path d="M22 42 Q16 54 12 66 Q8 78 8 88 Q7 96 10 102 L14 98 Q14 90 14 82 Q16 70 18 60 Q20 50 22 44" stroke={O} />
      {/* Right arm */}
      <path d="M78 42 Q84 54 88 66 Q92 78 92 88 Q93 96 90 102 L86 98 Q86 90 86 82 Q84 70 82 60 Q80 50 78 44" stroke={O} />
      {/* Elbow hints */}
      <ellipse cx="13" cy="67" rx="2" ry="2.5" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      <ellipse cx="87" cy="67" rx="2" ry="2.5" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />

      {/* Left leg */}
      <path d="M38 93 Q36 110 35 126 Q34 140 33 152 Q32 164 31 176 L29 188 L36 188 Q37 176 37 164 Q38 152 38 140 Q39 128 40 118 Q42 106 44 93" stroke={O} />
      {/* Right leg */}
      <path d="M56 93 Q58 106 60 118 Q61 128 62 140 Q62 152 63 164 Q63 176 64 188 L71 188 Q69 176 68 164 Q67 152 66 140 Q66 128 65 126 Q64 110 62 93" stroke={O} />
      {/* Knee crease */}
      <path d="M33 130 Q36.5 133 40 130" stroke={G} strokeWidth={GW} />
      <path d="M60 130 Q63.5 133 67 130" stroke={G} strokeWidth={GW} />
      {/* Ankle hints */}
      <circle cx="33" cy="178" r="1.5" stroke={G} strokeWidth={GW} />
      <circle cx="67" cy="178" r="1.5" stroke={G} strokeWidth={GW} />
      {/* Achilles */}
      <line x1="33.5" y1="160" x2="33" y2="176" stroke={G} strokeWidth={GW} strokeDasharray="1 1.5" />
      <line x1="66.5" y1="160" x2="67" y2="176" stroke={G} strokeWidth={GW} strokeDasharray="1 1.5" />
    </svg>
  );
}

/* ── Male Front ── */

export function MaleFrontSVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" strokeWidth={SW}>
      {/* Head */}
      <ellipse cx="50" cy="16" rx="9.5" ry="11.5" stroke={O} />
      <FaceHints />

      {/* Neck (thicker) */}
      <line x1="43" y1="27" x2="42" y2="35" stroke={O} />
      <line x1="57" y1="27" x2="58" y2="35" stroke={O} />

      {/* Torso (wider shoulders, straighter) */}
      <path
        d="M22 38 Q19 38 17 44 Q20 50 28 52 L32 60 Q31 68 30 76 L31 83 Q33 90 40 93 L46 93 Q50 95 54 93 L60 93 Q67 90 69 83 L70 76 Q69 68 68 60 L72 52 Q80 50 83 44 Q81 38 78 38 Z"
        stroke={O}
      />
      {/* Collarbone */}
      <path d="M43 36 Q34 38 22 38" stroke={G} strokeWidth={GW} />
      <path d="M57 36 Q66 38 78 38" stroke={G} strokeWidth={GW} />
      {/* Pec line */}
      <path d="M32 48 Q40 52 50 50 Q60 52 68 48" stroke={G} strokeWidth={GW} strokeDasharray={DASH} />
      <CentreLine y1={38} y2={93} />
      {/* Navel */}
      <circle cx="50" cy="70" r="0.8" stroke={G} strokeWidth={GW} />
      {/* Waist hint */}
      <path d="M32 60 Q42 62 50 61 Q58 62 68 60" stroke={G} strokeWidth={GW} strokeDasharray={DASH} />
      {/* Hip crease */}
      <path d="M42 82 Q46 86 49 84" stroke={G} strokeWidth={GW} />
      <path d="M58 82 Q54 86 51 84" stroke={G} strokeWidth={GW} />

      {/* Left arm (bigger) */}
      <path d="M19 42 Q14 54 10 66 Q6 78 6 88 Q5 96 8 102 L13 98 Q12 90 12 82 Q14 70 16 60 Q18 50 20 44" stroke={O} />
      {/* Right arm */}
      <path d="M81 42 Q86 54 90 66 Q94 78 94 88 Q95 96 92 102 L87 98 Q88 90 88 82 Q86 70 84 60 Q82 50 80 44" stroke={O} />
      {/* Elbow hints */}
      <ellipse cx="11" cy="67" rx="2.5" ry="3" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      <ellipse cx="89" cy="67" rx="2.5" ry="3" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />

      {/* Left leg */}
      <path d="M40 93 Q38 110 37 126 Q36 140 35 152 Q34 164 33 176 L30 188 L38 188 Q38 176 38 164 Q39 152 39 140 Q40 128 41 118 Q42 106 46 93" stroke={O} />
      {/* Right leg */}
      <path d="M54 93 Q58 106 59 118 Q60 128 61 140 Q61 152 62 164 Q62 176 62 188 L70 188 Q67 176 66 164 Q66 152 65 140 Q64 128 63 126 Q62 110 60 93" stroke={O} />
      {/* Kneecap hints */}
      <ellipse cx="37.5" cy="130" rx="3.5" ry="4.5" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      <ellipse cx="62.5" cy="130" rx="3.5" ry="4.5" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      {/* Ankle hints */}
      <circle cx="34" cy="178" r="1.8" stroke={G} strokeWidth={GW} />
      <circle cx="66" cy="178" r="1.8" stroke={G} strokeWidth={GW} />
    </svg>
  );
}

/* ── Male Back ── */

export function MaleBackSVG() {
  return (
    <svg viewBox="0 0 100 200" className="w-full h-full" fill="none" strokeWidth={SW}>
      {/* Head */}
      <ellipse cx="50" cy="16" rx="9.5" ry="11.5" stroke={O} />

      {/* Neck (thicker) */}
      <line x1="43" y1="27" x2="42" y2="35" stroke={O} />
      <line x1="57" y1="27" x2="58" y2="35" stroke={O} />

      {/* Torso */}
      <path
        d="M22 38 Q19 38 17 44 Q20 50 28 52 L32 60 Q31 68 30 76 L31 83 Q33 90 40 93 L46 93 Q50 95 54 93 L60 93 Q67 90 69 83 L70 76 Q69 68 68 60 L72 52 Q80 50 83 44 Q81 38 78 38 Z"
        stroke={O}
      />
      {/* Spine */}
      <line x1="50" y1="28" x2="50" y2="93" stroke={G} strokeWidth="0.6" />
      {/* Scapulae */}
      <path d="M36 42 Q40 48 46 44" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      <path d="M64 42 Q60 48 54 44" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      {/* Mid-back line */}
      <path d="M32 56 Q42 58 50 57 Q58 58 68 56" stroke={G} strokeWidth={GW} strokeDasharray={DASH} />
      {/* Lower-back line */}
      <path d="M32 70 Q41 72 50 71 Q59 72 68 70" stroke={G} strokeWidth={GW} strokeDasharray={DASH} />
      {/* Glute line */}
      <path d="M38 84 Q44 90 50 87 Q56 90 62 84" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />

      {/* Left arm */}
      <path d="M19 42 Q14 54 10 66 Q6 78 6 88 Q5 96 8 102 L13 98 Q12 90 12 82 Q14 70 16 60 Q18 50 20 44" stroke={O} />
      {/* Right arm */}
      <path d="M81 42 Q86 54 90 66 Q94 78 94 88 Q95 96 92 102 L87 98 Q88 90 88 82 Q86 70 84 60 Q82 50 80 44" stroke={O} />
      {/* Elbow hints */}
      <ellipse cx="11" cy="67" rx="2.5" ry="3" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />
      <ellipse cx="89" cy="67" rx="2.5" ry="3" stroke={G} strokeWidth={GW} strokeDasharray="1 1" />

      {/* Left leg */}
      <path d="M40 93 Q38 110 37 126 Q36 140 35 152 Q34 164 33 176 L30 188 L38 188 Q38 176 38 164 Q39 152 39 140 Q40 128 41 118 Q42 106 46 93" stroke={O} />
      {/* Right leg */}
      <path d="M54 93 Q58 106 59 118 Q60 128 61 140 Q61 152 62 164 Q62 176 62 188 L70 188 Q67 176 66 164 Q66 152 65 140 Q64 128 63 126 Q62 110 60 93" stroke={O} />
      {/* Knee crease */}
      <path d="M34 130 Q37.5 133 41 130" stroke={G} strokeWidth={GW} />
      <path d="M59 130 Q62.5 133 66 130" stroke={G} strokeWidth={GW} />
      {/* Ankle hints */}
      <circle cx="34" cy="178" r="1.8" stroke={G} strokeWidth={GW} />
      <circle cx="66" cy="178" r="1.8" stroke={G} strokeWidth={GW} />
      {/* Achilles */}
      <line x1="34.5" y1="160" x2="34" y2="176" stroke={G} strokeWidth={GW} strokeDasharray="1 1.5" />
      <line x1="65.5" y1="160" x2="66" y2="176" stroke={G} strokeWidth={GW} strokeDasharray="1 1.5" />
    </svg>
  );
}

/* ── Selector helper ── */

const SVG_MAP: Record<`${BodyGender}_${BodySide}`, () => JSX.Element> = {
  female_front: FemaleFrontSVG,
  female_back: FemaleBackSVG,
  male_front: MaleFrontSVG,
  male_back: MaleBackSVG,
};

export function getBodySVG(gender: BodyGender, side: BodySide) {
  const Component = SVG_MAP[`${gender}_${side}`];
  return <Component />;
}
