import { useState, useRef, useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useConfigStore } from '../../../stores/configStore';
import { clientService } from '../../../services/clientService';
import { Input, SegmentedControl, Select } from '../../../shared/components';
import type { Client } from '../../../types';

const schema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  gender: z.enum(['male', 'female'], { message: 'Please select gender' }),
  contactMethod: z.string().min(1, 'Select a contact method'),
  contactValue: z.string().min(1, 'Contact value is required'),
});

export type BookingFormData = z.infer<typeof schema>;

interface BookingFormProps {
  onSubmit: (data: BookingFormData, existingClient: Client | null) => void;
  submitting?: boolean;
}

const CONTACT_PLACEHOLDERS: Record<string, string> = {
  whatsapp: 'WhatsApp number',
  phone: 'Phone number',
  telegram: 'Telegram username',
  email: 'Email address',
  instagram: 'Instagram handle',
};

const DEBOUNCE_MS = 300;

export function BookingForm({ onSubmit, submitting }: BookingFormProps) {
  const { t } = useTranslation();
  const config = useConfigStore((s) => s.config);

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
  } = useForm<BookingFormData>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: '', gender: undefined, contactMethod: '', contactValue: '' },
  });

  const selectedMethod = watch('contactMethod');

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
      if (selectedClient && value !== selectedClient.fullName) setSelectedClient(null);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (value.trim().length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
      debounceRef.current = setTimeout(async () => {
        try {
          const results = await clientService.searchByName(value.trim());
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch { setSuggestions([]); setShowSuggestions(false); }
      }, DEBOUNCE_MS);
    },
    [selectedClient],
  );

  const selectSuggestion = (client: Client) => {
    setSelectedClient(client);
    setSuggestions([]);
    setShowSuggestions(false);
    setValue('fullName', client.fullName, { shouldValidate: true });
    if (client.gender === 'male' || client.gender === 'female')
      setValue('gender', client.gender, { shouldValidate: true });
    if (client.contactMethod)
      setValue('contactMethod', client.contactMethod, { shouldValidate: true });
    if (client.contactValue)
      setValue('contactValue', client.contactValue, { shouldValidate: true });
  };

  const { ref: nameRef, ...nameRest } = register('fullName');

  return (
    <form
      onSubmit={handleSubmit((data) => onSubmit(data, selectedClient))}
      className="flex flex-col gap-5"
    >
      {/* Full Name */}
      <div ref={wrapperRef} className="relative">
        <Input
          label={t('kiosk.fullName')}
          placeholder={t('kiosk.fullNamePlaceholder')}
          ref={nameRef}
          {...nameRest}
          onChange={(e) => { nameRest.onChange(e); handleNameChange(e.target.value); }}
          onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
          autoComplete="off"
          error={errors.fullName?.message}
        />
        {selectedClient && (
          <div className="mt-1.5 flex items-center gap-2 text-xs text-green-700 bg-green-50 rounded-lg px-3 py-1.5">
            <span>Returning client</span>
            <button type="button" onClick={() => { setSelectedClient(null); setValue('contactMethod', ''); setValue('contactValue', ''); }} className="ml-auto text-green-900 font-medium">Clear</button>
          </div>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-brand-border rounded-xl shadow-lg z-20 max-h-60 overflow-y-auto">
            {suggestions.map((c) => (
              <button key={c.id} type="button" onClick={() => selectSuggestion(c)} className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-brand-border last:border-b-0">
                <div className="font-medium text-brand-dark">{c.fullName}</div>
                <div className="text-xs text-brand-muted">{c.contactMethod && `${c.contactMethod}: ${c.contactValue}`}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gender */}
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

      {/* Contact Method */}
      <Controller
        name="contactMethod"
        control={control}
        render={({ field }) => (
          <Select
            label={t('kiosk.contactMethod')}
            options={config.contactMethods.filter((c) => c.enabled).map((c) => ({ value: c.id, label: c.label }))}
            placeholder={t('common.selectPlaceholder')}
            value={field.value}
            onChange={field.onChange}
            error={errors.contactMethod?.message}
          />
        )}
      />

      {/* Contact Value */}
      <Input
        label={t('kiosk.contactValue')}
        placeholder={CONTACT_PLACEHOLDERS[selectedMethod] ?? t('kiosk.contactValuePlaceholder')}
        {...register('contactValue')}
        error={errors.contactValue?.message}
      />

      {/* Submit button rendered by parent for sticky positioning */}
      <button type="submit" id="booking-form-submit" className="hidden" disabled={submitting} />
    </form>
  );
}
