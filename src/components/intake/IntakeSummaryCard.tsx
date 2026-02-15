/**
 * IntakeSummaryCard — Reusable, beautiful intake display component.
 *
 * Renders intake data in 5 grouped sections. Auto-hides empty sections.
 * Works from stored intake snapshot — never depends on live client preferences.
 *
 * Used in: BookingDetailPage, SessionDetailPage, ClientProfilePage, SessionCard.
 */
import { useTranslation } from 'react-i18next';
import type { Intake } from '../../types';
import { getTherapistBrief, hasMedicalRisks } from '../../stores/selectors/therapistBrief';
import { UnifiedBodyMap } from '../bodymap/UnifiedBodyMap';
import { Badge } from '../../shared/components';

export interface IntakeSummaryCardProps {
  intake: Intake;
  /** Compact mode — session overview + red flags only (for list cards) */
  compact?: boolean;
}

export function IntakeSummaryCard({ intake, compact }: IntakeSummaryCardProps) {
  const { t } = useTranslation();
  const brief = getTherapistBrief(intake);
  const hasRisks = hasMedicalRisks(brief);

  /* ── Compact: inline summary for list cards ── */
  if (compact) {
    return (
      <div className="space-y-2">
        {/* Session overview row */}
        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-xs text-brand-muted uppercase tracking-wide mb-0.5">
              {t('therapist.duration')}
            </div>
            <div className="font-medium text-brand-dark">
              {brief.duration || '—'} {t('therapist.mins')}
            </div>
          </div>
          <div>
            <div className="text-xs text-brand-muted uppercase tracking-wide mb-0.5">
              {t('therapist.pressure')}
            </div>
            <div className="font-medium text-brand-dark capitalize">
              {brief.pressure || '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-brand-muted uppercase tracking-wide mb-0.5">
              {t('therapist.goal')}
            </div>
            <div className="text-sm font-medium text-brand-dark">
              {brief.goal.length ? brief.goal.join(', ') : '—'}
            </div>
          </div>
        </div>

        {/* Red flags */}
        {hasRisks && (
          <div className="flex flex-wrap gap-1">
            {brief.pregnancy !== 'no' && brief.pregnancy !== '' && (
              <Badge variant="danger">{t('medical.pregnant')}</Badge>
            )}
            {brief.bloodPressure && <Badge variant="danger">{t('medical.highBP')}</Badge>}
            {brief.fever && <Badge variant="danger">{t('medical.fever')}</Badge>}
            {brief.varicoseVeins && <Badge variant="danger">{t('medical.varicoseVeins')}</Badge>}
            {brief.allergies.map((a) => (
              <Badge key={a} variant="danger">{a}</Badge>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* ── Full layout ── */

  const hasSessionData = brief.duration || brief.goal.length > 0 || brief.pressure;
  const hasBodyZones = brief.focusZones.length > 0 || brief.avoidZones.length > 0;
  const hasAllergiesOrOil =
    brief.allergies.length > 0 || brief.oilPreference || brief.smellSensitivity;
  const hasAtmosphere =
    brief.atmosphere.music || brief.atmosphere.volume || brief.atmosphere.light;

  return (
    <div className="space-y-4">
      {/* ── Section 1 — Session Overview ── */}
      {hasSessionData && (
        <div className="bg-white rounded-xl border border-brand-border p-4">
          <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-3">
            {t('therapist.sessionOverview', 'Session Overview')}
          </h3>
          <div className="grid grid-cols-3 gap-4">
            {brief.duration && (
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-dark">{brief.duration}</div>
                <div className="text-xs text-brand-muted">{t('therapist.mins')}</div>
              </div>
            )}
            {brief.pressure && (
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-dark capitalize">{brief.pressure}</div>
                <div className="text-xs text-brand-muted">{t('therapist.pressure')}</div>
                {brief.deepTissue && (
                  <Badge variant="info" className="mt-1">{t('therapist.deepTissue')}</Badge>
                )}
              </div>
            )}
            {brief.goal.length > 0 && (
              <div className="text-center">
                <div className="flex flex-wrap justify-center gap-1">
                  {brief.goal.map((g) => (
                    <Badge key={g}>{g}</Badge>
                  ))}
                </div>
                <div className="text-xs text-brand-muted mt-1">{t('therapist.goal')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Section 2 — Focus & Avoid ── */}
      {hasBodyZones && (
        <div className="bg-white rounded-xl border border-brand-border p-4">
          <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-3">
            {t('therapist.bodyZones')}
          </h3>
          <UnifiedBodyMap
            mode="readonly"
            focusZones={brief.focusZones}
            avoidZones={brief.avoidZones}
            compact
          />
        </div>
      )}

      {/* ── Section 3 — Health & Safety ── */}
      {hasRisks && (
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-3">
            {t('therapist.risksAllergies')}
          </h3>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {brief.pregnancy !== 'no' && brief.pregnancy !== '' && (
              <Badge variant="danger">
                {t('medical.pregnant')} ({brief.pregnancy})
              </Badge>
            )}
            {brief.bloodPressure && <Badge variant="danger">{t('medical.highBP')}</Badge>}
            {brief.fever && <Badge variant="danger">{t('medical.fever')}</Badge>}
            {brief.varicoseVeins && <Badge variant="danger">{t('medical.varicoseVeins')}</Badge>}
          </div>
          {brief.injuries && (
            <div className="text-sm text-red-700 mt-1">
              <span className="font-medium">{t('therapist.injuries')}:</span> {brief.injuries}
            </div>
          )}
          {brief.skinIssues && (
            <div className="text-sm text-red-700 mt-1">
              <span className="font-medium">{t('therapist.skinIssues')}:</span> {brief.skinIssues}
            </div>
          )}
          {brief.painScale > 0 && (
            <div className="text-sm text-red-700 mt-1">
              <span className="font-medium">{t('therapist.pain')}:</span> {brief.painScale}/10
              {brief.painLocation ? ` — ${brief.painLocation}` : ''}
            </div>
          )}
        </div>
      )}

      {/* ── Section 4 — Allergies & Oil ── */}
      {hasAllergiesOrOil && (
        <div className="bg-white rounded-xl border border-brand-border p-4">
          <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-3">
            {t('therapist.allergiesOil', 'Allergies & Oil')}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {brief.allergies.map((a) => (
              <Badge key={a} variant="danger">{a}</Badge>
            ))}
            {brief.oilPreference && <Badge variant="info">{brief.oilPreference}</Badge>}
            {brief.smellSensitivity && (
              <Badge variant="warning">{t('therapist.smellSensitive')}</Badge>
            )}
          </div>
        </div>
      )}

      {/* ── Section 5 — Atmosphere ── */}
      {hasAtmosphere && (
        <div className="bg-white rounded-xl border border-brand-border p-4">
          <h3 className="text-xs font-semibold text-brand-muted uppercase tracking-wide mb-3">
            {t('therapist.atmosphere')}
          </h3>
          <div className="flex flex-wrap gap-2">
            {brief.atmosphere.music && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                <span className="text-brand-muted">♪</span>
                <span className="text-brand-dark font-medium">{brief.atmosphere.music}</span>
              </span>
            )}
            {brief.atmosphere.volume && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                <span className="text-brand-muted">{t('therapist.volume')}:</span>
                <span className="text-brand-dark font-medium">{brief.atmosphere.volume}</span>
              </span>
            )}
            {brief.atmosphere.light && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                <span className="text-brand-muted">{t('therapist.light')}:</span>
                <span className="text-brand-dark font-medium">{brief.atmosphere.light}</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
