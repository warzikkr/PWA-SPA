/**
 * DEPRECATED — kept for backward compatibility.
 * All body-map logic now lives in src/components/bodymap/.
 * Use UnifiedBodyMap directly instead.
 */
export {
  REGIONS,
  BILATERAL,
  FRONT_REGIONS,
  BACK_REGIONS,
  FRONT_POSITIONS,
  BACK_POSITIONS,
  zoneKey,
  isSelected,
  getZoneEntries,
} from '../../components/bodymap/bodyMapData';
export type { ZonePos } from '../../components/bodymap/bodyMapData';

export { FemaleFrontSVG as FrontBodySVG, FemaleBackSVG as BackBodySVG } from '../../components/bodymap/BodySVG';

export { UnifiedBodyMap as BodyMap } from '../../components/bodymap/UnifiedBodyMap';
