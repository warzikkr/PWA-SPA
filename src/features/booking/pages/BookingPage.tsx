/**
 * BookingPage — Public /book page.
 *
 * Multi-step flow:
 *   1. Calendar → select date
 *   2. Time slots → select time
 *   3. Form → client details
 *   4. Intake choice → fill now or skip
 *   5. (optional) Inline intake wizard
 *   6. Confirmation
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../stores/configStore';
import { useClientStore } from '../../../stores/clientStore';
import { useBookingStore } from '../../../stores/bookingStore';
import { useIntakeStore } from '../../../stores/intakeStore';
import { availabilityService, type TimeSlot } from '../../../services/availabilityService';
import { StepProgress } from '../../../shared/components';
import { CalendarView } from '../components/CalendarView';
import { TimeSlotGrid } from '../components/TimeSlotGrid';
import { BookingForm, type BookingFormData } from '../components/BookingForm';
import { IntakeChoice } from '../components/IntakeChoice';
import { BookingConfirmation } from '../components/BookingConfirmation';
import { SessionPrefsStep, BodyMapStep, HealthStep, AtmosphereStep } from '../../kiosk/steps';
import type { Client } from '../../../types';

type Step = 'calendar' | 'time' | 'form' | 'intake_choice' | 'intake' | 'confirmation';

const INTAKE_STEPS = [
  { id: 'session_prefs', title: 'Session Preferences' },
  { id: 'body_map', title: 'Focus & Avoid' },
  { id: 'health', title: 'Health & Sensitivity' },
  { id: 'atmosphere', title: 'Atmosphere' },
] as const;

const MAIN_STEPS = ['Date', 'Time', 'Details', 'Done'];

function stepIndex(step: Step): number {
  switch (step) {
    case 'calendar': return 0;
    case 'time': return 1;
    case 'form':
    case 'intake_choice':
    case 'intake': return 2;
    case 'confirmation': return 3;
    default: return 0;
  }
}

export function BookingPage() {
  const { t } = useTranslation();
  const config = useConfigStore((s) => s.config);
  const loadConfig = useConfigStore((s) => s.loadConfig);
  const findOrCreate = useClientStore((s) => s.findOrCreate);
  const updateClient = useClientStore((s) => s.updateClient);
  const addBooking = useBookingStore((s) => s.addBooking);
  const updateBooking = useBookingStore((s) => s.updateBooking);
  const addIntake = useIntakeStore((s) => s.addIntake);

  const [step, setStep] = useState<Step>('calendar');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableDates, setAvailableDates] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Booking result for confirmation
  const [bookedName, setBookedName] = useState('');

  // Inline intake state
  const [intakeStep, setIntakeStep] = useState(0);
  const [intakeData, setIntakeData] = useState<Record<string, unknown>>({});
  const [clientId, setClientId] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [clientGender, setClientGender] = useState('');

  // Load config on mount (public page, no auth init)
  useEffect(() => { loadConfig().catch(() => {}); }, [loadConfig]);

  // Fetch available dates for 60 days
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    availabilityService.getAvailableDates(today, 60)
      .then((dates) => setAvailableDates(new Set(dates)))
      .catch(console.error);
  }, [config]);

  // Fetch time slots when date selected
  const loadSlots = useCallback(async (date: string) => {
    setSlotsLoading(true);
    try {
      const s = await availabilityService.getAvailableSlots(date);
      setSlots(s);
    } catch (err) {
      console.error('[BookingPage] loadSlots error:', err);
      setSlots([]);
    } finally {
      setSlotsLoading(false);
    }
  }, []);

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(null);
    loadSlots(date);
    setStep('time');
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep('form');
  };

  const handleFormSubmit = async (data: BookingFormData, existingClient: Client | null) => {
    if (!selectedDate || !selectedTime) return;
    setSubmitting(true);
    setError('');

    try {
      // Find or create client
      let client: Client;
      if (existingClient) {
        client = existingClient;
        if (data.fullName !== client.fullName || data.gender !== client.gender) {
          await updateClient(client.id, { fullName: data.fullName, gender: data.gender });
          client = { ...client, fullName: data.fullName, gender: data.gender };
        }
      } else {
        client = await findOrCreate({
          fullName: data.fullName,
          email: '',
          contactMethod: data.contactMethod,
          contactValue: data.contactValue,
          marketingSource: '',
          consentPromotions: false,
          consentPrivacy: true,
          gender: data.gender,
          tags: [],
        });
      }

      // Calculate end time
      const duration = config.slotDurationMinutes;
      const [h, m] = selectedTime.split(':').map(Number);
      const endMin = h * 60 + m + duration;
      const endTime = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}`;

      // Create booking
      const booking = await addBooking({
        clientId: client.id,
        status: 'scheduled',
        date: selectedDate,
        startTime: selectedTime,
        endTime,
        paymentStatus: 'unpaid',
        source: 'online',
      });

      setClientId(client.id);
      setBookingId(booking.id);
      setBookedName(data.fullName);
      setClientGender(data.gender);

      // Apply saved preferences if returning client
      if (client.preferences) {
        const prefs = client.preferences;
        const prefData: Record<string, unknown> = {};
        if (prefs.pressure) prefData.pressure = prefs.pressure;
        if (prefs.oilPreference) prefData.oil_preference = prefs.oilPreference;
        if (prefs.allergies?.length) prefData.allergies = prefs.allergies;
        if (prefs.smellSensitivity != null) prefData.smell_sensitivity = prefs.smellSensitivity;
        if (prefs.focusZones?.length) prefData.focus_zones = prefs.focusZones;
        if (prefs.avoidZones?.length) prefData.avoid_zones = prefs.avoidZones;
        if (prefs.atmosphere) {
          if (prefs.atmosphere.music) prefData.music_preset = prefs.atmosphere.music;
          if (prefs.atmosphere.volume) prefData.volume = prefs.atmosphere.volume;
          if (prefs.atmosphere.light) prefData.light_preference = prefs.atmosphere.light;
        }
        setIntakeData(prefData);
      }

      setStep('intake_choice');
    } catch (err) {
      console.error('[BookingPage] submit error:', err);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const handleIntakeStepSubmit = async (data: Record<string, unknown>) => {
    const merged = { ...intakeData, ...data };
    setIntakeData(merged);

    if (intakeStep === INTAKE_STEPS.length - 1) {
      // Final intake step — save intake
      setSubmitting(true);
      try {
        const intake = await addIntake({
          clientId,
          bookingId,
          data: merged,
          signature: '',
        });
        await updateBooking(bookingId, { intakeId: intake.id });
        setStep('confirmation');
      } catch (err) {
        console.error('[BookingPage] intake submit error:', err);
        setError(err instanceof Error ? err.message : 'Failed to save intake');
      } finally {
        setSubmitting(false);
      }
    } else {
      setIntakeStep(intakeStep + 1);
    }
  };

  const handleIntakeBack = () => {
    if (intakeStep === 0) {
      setStep('intake_choice');
    } else {
      setIntakeStep(intakeStep - 1);
    }
  };

  const renderIntakeStep = () => {
    const props = { defaultValues: intakeData, onSubmit: handleIntakeStepSubmit, onBack: handleIntakeBack, gender: clientGender };
    const current = INTAKE_STEPS[intakeStep];
    switch (current.id) {
      case 'session_prefs': return <SessionPrefsStep {...props} />;
      case 'body_map': return <BodyMapStep {...props} />;
      case 'health': return <HealthStep {...props} />;
      case 'atmosphere': return <AtmosphereStep {...props} submitLabel={t('common.submit')} />;
      default: return null;
    }
  };

  const goBack = () => {
    switch (step) {
      case 'time': setStep('calendar'); break;
      case 'form': setStep('time'); break;
      case 'intake_choice': setStep('form'); break;
      case 'intake': setStep('intake_choice'); break;
      default: break;
    }
  };

  const showBack = step !== 'calendar' && step !== 'confirmation';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-brand-border px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {showBack && (
            <button onClick={goBack} className="text-brand-muted text-sm shrink-0">&larr; {t('common.back')}</button>
          )}
          <h1 className="font-serif text-lg font-bold text-brand-dark flex-1 text-center">
            {t('booking.title', 'Book a Session')}
          </h1>
          {showBack && <div className="w-12" />}
        </div>
      </header>

      {/* Progress */}
      {step !== 'confirmation' && (
        <div className="bg-white border-b border-brand-border px-4 py-3">
          <div className="max-w-lg mx-auto">
            <StepProgress steps={MAIN_STEPS} current={stepIndex(step)} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className="flex-1 px-4 py-6">
        <div className="max-w-lg mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              {error}
              <button onClick={() => setError('')} className="ml-2 underline">Dismiss</button>
            </div>
          )}

          {step === 'calendar' && (
            <div>
              <h2 className="font-serif text-xl font-bold text-brand-dark text-center mb-2">
                {t('booking.selectDate', 'Select a Date')}
              </h2>
              <p className="text-brand-muted text-center text-sm mb-6">
                {t('booking.selectDateHint', 'Choose a date for your massage session')}
              </p>
              <CalendarView
                availableDates={availableDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </div>
          )}

          {step === 'time' && (
            <div>
              <h2 className="font-serif text-xl font-bold text-brand-dark text-center mb-2">
                {t('booking.selectTime', 'Select a Time')}
              </h2>
              <p className="text-brand-muted text-center text-sm mb-6">
                {selectedDate && new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <TimeSlotGrid
                slots={slots}
                selectedTime={selectedTime}
                onSelectTime={handleSelectTime}
                loading={slotsLoading}
              />
            </div>
          )}

          {step === 'form' && (
            <div className="pb-28">
              <h2 className="font-serif text-xl font-bold text-brand-dark text-center mb-2">
                {t('booking.yourDetails', 'Your Details')}
              </h2>
              <p className="text-brand-muted text-center text-sm mb-6">
                {selectedDate && `${new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${selectedTime}`}
              </p>
              <BookingForm onSubmit={handleFormSubmit} submitting={submitting} />
              {/* Sticky CTA */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-brand-border">
                <div className="max-w-lg mx-auto">
                  <button
                    type="button"
                    onClick={() => document.getElementById('booking-form-submit')?.click()}
                    disabled={submitting}
                    className="w-full min-h-[56px] rounded-xl bg-brand-dark text-white font-medium text-lg active:scale-[0.98] transition-transform disabled:opacity-50"
                  >
                    {submitting ? t('common.loading') : t('booking.bookNow', 'Book Now')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'intake_choice' && (
            <IntakeChoice
              onFillNow={() => { setIntakeStep(0); setStep('intake'); }}
              onSkip={() => setStep('confirmation')}
            />
          )}

          {step === 'intake' && (
            <div className="pb-28">
              <div className="mb-4">
                <StepProgress steps={INTAKE_STEPS.map((s) => s.title)} current={intakeStep} />
              </div>
              <h2 className="font-serif text-xl font-bold text-brand-dark text-center mb-6">
                {INTAKE_STEPS[intakeStep].title}
              </h2>
              {submitting && (
                <div className="flex items-center justify-center gap-3 p-4">
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin" />
                  <span className="text-sm text-brand-muted">Submitting...</span>
                </div>
              )}
              {renderIntakeStep()}
            </div>
          )}

          {step === 'confirmation' && selectedDate && selectedTime && (
            <BookingConfirmation date={selectedDate} time={selectedTime} name={bookedName} />
          )}
        </div>
      </main>
    </div>
  );
}
