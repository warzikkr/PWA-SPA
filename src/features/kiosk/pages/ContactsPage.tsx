/**
 * ContactsPage — Screen 1: Client details.
 *
 * - Full Name with autocomplete for returning clients
 * - Gender as segmented buttons (side-by-side)
 * - Contact Method as dropdown select
 * - Contact Value with dynamic placeholder based on method
 */
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useKioskStore } from '../../../stores/kioskStore';
import { useConfigStore } from '../../../stores/configStore';
import { useClientStore } from '../../../stores/clientStore';
import { clientService } from '../../../services/clientService';
import { Input, SegmentedControl, Select } from '../../../shared/components';
import { useKioskInactivity } from '../hooks/useKioskInactivity';
import type { Client } from '../../../types';

const schema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  gender: z.enum(['male', 'female'], { message: 'Please select gender' }),
  contactMethod: z.string().min(1, 'Select a contact method'),
  contactValue: z.string().min(1, 'Contact value is required'),
});

type FormData = z.infer<typeof schema>;

const CONTACT_PLACEHOLDERS: Record<string, string> = {
  whatsapp: 'Enter WhatsApp number',
  phone: 'Enter phone number',
  telegram: 'Enter Telegram username',
  email: 'Enter email address',
  instagram: 'Enter Instagram handle',
};

const DEBOUNCE_MS = 300;

export function ContactsPage() {
  useKioskInactivity();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setClientId, setGender, updateFormData } = useKioskStore();
  const config = useConfigStore((s) => s.config);
  const findOrCreate = useClientStore((s) => s.findOrCreate);

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<Client[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      gender: undefined,
      contactMethod: '',
      contactValue: '',
    },
  });

  const selectedMethod = watch('contactMethod');

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNameChange = useCallback(
    (value: string) => {
      // Clear previous selection if user edits the name
      if (selectedClient && value !== selectedClient.fullName) {
        setSelectedClient(null);
      }

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const results = await clientService.searchByName(value.trim());
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      }, DEBOUNCE_MS);
    },
    [selectedClient],
  );

  const selectSuggestion = (client: Client) => {
    setSelectedClient(client);
    setSuggestions([]);
    setShowSuggestions(false);

    // Fill form fields from existing client
    setValue('fullName', client.fullName, { shouldValidate: true });
    if (client.gender === 'male' || client.gender === 'female') {
      setValue('gender', client.gender, { shouldValidate: true });
    }
    if (client.contactMethod) {
      setValue('contactMethod', client.contactMethod, { shouldValidate: true });
    }
    if (client.contactValue) {
      setValue('contactValue', client.contactValue, { shouldValidate: true });
    }
  };

  /** Apply saved preferences to kiosk formData */
  const applyPreferences = (client: Client) => {
    if (!client.preferences) return;
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
    updateFormData(prefData);
  };

  const onSubmit = async (data: FormData) => {
    let client: Client;

    if (selectedClient) {
      // Returning client — update name/gender if changed, reuse existing record
      client = selectedClient;
      if (data.fullName !== client.fullName || data.gender !== client.gender) {
        await useClientStore.getState().updateClient(client.id, {
          fullName: data.fullName,
          gender: data.gender,
        });
        client = { ...client, fullName: data.fullName, gender: data.gender };
      }
    } else {
      // New or matched by contact — use existing findOrCreate
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

    setClientId(client.id);
    setGender(data.gender);
    applyPreferences(client);
    updateFormData({ gender: data.gender });
    navigate('/kiosk/intake');
  };

  // Register fullName manually to intercept onChange for autocomplete
  const { ref: nameRef, ...nameRest } = register('fullName');

  return (
    <div className="flex flex-col min-h-full px-6 py-8">
      <button onClick={() => navigate(-1)} className="text-brand-muted mb-6 self-start">
        &larr; {t('common.back')}
      </button>

      <h2 className="font-serif text-2xl font-bold text-brand-dark text-center mb-2">
        {t('kiosk.yourDetails')}
      </h2>
      <p className="text-brand-muted text-center mb-8">
        {t('kiosk.yourDetailsSubtitle')}
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="max-w-md mx-auto w-full flex flex-col gap-6 pb-28"
      >
        {/* Full Name with autocomplete */}
        <div ref={wrapperRef} className="relative">
          <Input
            label={t('kiosk.fullName')}
            placeholder={t('kiosk.fullNamePlaceholder')}
            ref={nameRef}
            {...nameRest}
            onChange={(e) => {
              nameRest.onChange(e);
              handleNameChange(e.target.value);
            }}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            autoComplete="off"
            error={errors.fullName?.message}
          />

          {selectedClient && (
            <div className="mt-1.5 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
              <span>Returning client: {selectedClient.contactMethod} {selectedClient.contactValue}</span>
              <button
                type="button"
                onClick={() => {
                  setSelectedClient(null);
                  setValue('contactMethod', '');
                  setValue('contactValue', '');
                }}
                className="ml-auto text-green-900 font-medium"
              >
                Clear
              </button>
            </div>
          )}

          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-brand-border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectSuggestion(c)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-brand-border last:border-b-0"
                >
                  <div className="font-medium text-brand-dark">{c.fullName}</div>
                  <div className="text-xs text-brand-muted">
                    {c.contactMethod && `${c.contactMethod}: ${c.contactValue}`}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Gender — segmented buttons */}
        <Controller
          name="gender"
          control={control}
          render={({ field }) => (
            <SegmentedControl
              label={t('kiosk.gender', 'Gender')}
              options={[
                { id: 'male', label: t('kiosk.male', 'Male') },
                { id: 'female', label: t('kiosk.female', 'Female') },
              ]}
              value={field.value ?? ''}
              onChange={field.onChange}
              error={errors.gender?.message}
            />
          )}
        />

        {/* Contact Method — dropdown */}
        <Controller
          name="contactMethod"
          control={control}
          render={({ field }) => (
            <Select
              label={t('kiosk.contactMethod')}
              options={config.contactMethods
                .filter((c) => c.enabled)
                .map((c) => ({ value: c.id, label: c.label }))}
              placeholder={t('common.selectPlaceholder', 'Select...')}
              value={field.value}
              onChange={field.onChange}
              error={errors.contactMethod?.message}
            />
          )}
        />

        {/* Contact Value — dynamic placeholder */}
        <Input
          label={t('kiosk.contactValue')}
          placeholder={
            CONTACT_PLACEHOLDERS[selectedMethod] ??
            t('kiosk.contactValuePlaceholder')
          }
          {...register('contactValue')}
          error={errors.contactValue?.message}
        />

        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-brand-border">
          <div className="max-w-md mx-auto">
            <button
              type="submit"
              className="w-full min-h-[56px] rounded-xl bg-brand-dark text-white font-medium text-lg active:scale-[0.98] transition-transform"
            >
              {t('common.continue')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
