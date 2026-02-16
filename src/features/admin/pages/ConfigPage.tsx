import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useConfigStore } from '../../../stores/configStore';
import { Button, Input, Toggle } from '../../../shared/components';
import { Modal } from '../../../shared/components/Modal';
import type { ConfigOption, TherapistConfigOption, TherapistScheduleSlot, StepDefinition, FieldDefinition, FieldOption, AppConfig } from '../../../types/config';

type OptionListKey = keyof {
  [K in keyof AppConfig as AppConfig[K] extends ConfigOption[] ? K : never]: true;
};

const optionTabs: { key: OptionListKey; tKey: string }[] = [
  { key: 'contactMethods', tKey: 'config.contactMethods' },
  { key: 'marketingSources', tKey: 'config.marketingSources' },
  { key: 'statuses', tKey: 'config.statuses' },
  { key: 'tags', tKey: 'config.tags' },
  { key: 'rooms', tKey: 'config.rooms' },
  { key: 'therapists', tKey: 'config.therapists' },
  { key: 'musicPresets', tKey: 'config.musicPresets' },
  { key: 'oilOptions', tKey: 'config.oilOptions' },
  { key: 'bodyZones', tKey: 'config.bodyZones' },
  { key: 'languages', tKey: 'config.languages' },
];

const FIELD_TYPES_WITH_OPTIONS = ['select', 'multiselect', 'segmented'];

export function ConfigPage() {
  const { t } = useTranslation();
  const { config, updateConfig, updateIntakeSchema, updateOptionList, resetConfig } = useConfigStore();
  const [tab, setTab] = useState<'intake' | 'options'>('intake');
  const [activeOption, setActiveOption] = useState<OptionListKey>('contactMethods');
  const [editStep, setEditStep] = useState<StepDefinition | null>(null);
  const [editField, setEditField] = useState<{ stepId: string; field: FieldDefinition } | null>(null);
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newFieldOptionLabel, setNewFieldOptionLabel] = useState('');

  /* ---- Intake Schema Editor ---- */
  const moveStep = (idx: number, dir: -1 | 1) => {
    const steps = [...config.intakeSchema].sort((a, b) => a.order - b.order);
    const target = idx + dir;
    if (target < 0 || target >= steps.length) return;
    const tmp = steps[idx].order;
    steps[idx] = { ...steps[idx], order: steps[target].order };
    steps[target] = { ...steps[target], order: tmp };
    updateIntakeSchema(steps);
  };

  const toggleStep = (id: string) => {
    const steps = config.intakeSchema.map((s) =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    updateIntakeSchema(steps);
  };

  const deleteStep = (id: string) => {
    updateIntakeSchema(config.intakeSchema.filter((s) => s.id !== id));
  };

  const saveStepEdit = (step: StepDefinition) => {
    const steps = config.intakeSchema.map((s) => (s.id === step.id ? step : s));
    updateIntakeSchema(steps);
    setEditStep(null);
  };

  const addStep = () => {
    const newStep: StepDefinition = {
      id: `step_${Date.now()}`,
      title: t('admin.newStep'),
      enabled: true,
      order: config.intakeSchema.length,
      fields: [],
    };
    updateIntakeSchema([...config.intakeSchema, newStep]);
  };

  const saveFieldEdit = () => {
    if (!editField) return;
    const steps = config.intakeSchema.map((s) => {
      if (s.id !== editField.stepId) return s;
      return {
        ...s,
        fields: s.fields.map((f) => (f.id === editField.field.id ? editField.field : f)),
      };
    });
    updateIntakeSchema(steps);
    setEditField(null);
  };

  const addFieldToStep = (stepId: string) => {
    const newField: FieldDefinition = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      enabled: true,
      order: 100,
    };
    const steps = config.intakeSchema.map((s) => {
      if (s.id !== stepId) return s;
      return { ...s, fields: [...s.fields, newField] };
    });
    updateIntakeSchema(steps);
  };

  const deleteField = (stepId: string, fieldId: string) => {
    const steps = config.intakeSchema.map((s) => {
      if (s.id !== stepId) return s;
      return { ...s, fields: s.fields.filter((f) => f.id !== fieldId) };
    });
    updateIntakeSchema(steps);
  };

  /* ---- Field Options sub-editor ---- */
  const fieldOptions = editField?.field.options ?? [];

  const addFieldOption = () => {
    if (!newFieldOptionLabel.trim() || !editField) return;
    const opt: FieldOption = {
      id: `opt_${Date.now()}`,
      label: newFieldOptionLabel.trim(),
      enabled: true,
    };
    setEditField({
      ...editField,
      field: { ...editField.field, options: [...fieldOptions, opt] },
    });
    setNewFieldOptionLabel('');
  };

  const removeFieldOption = (optId: string) => {
    if (!editField) return;
    setEditField({
      ...editField,
      field: { ...editField.field, options: fieldOptions.filter((o) => o.id !== optId) },
    });
  };

  const toggleFieldOption = (optId: string) => {
    if (!editField) return;
    setEditField({
      ...editField,
      field: {
        ...editField.field,
        options: fieldOptions.map((o) => (o.id === optId ? { ...o, enabled: !o.enabled } : o)),
      },
    });
  };

  const moveFieldOption = (idx: number, dir: -1 | 1) => {
    if (!editField) return;
    const opts = [...fieldOptions];
    const target = idx + dir;
    if (target < 0 || target >= opts.length) return;
    [opts[idx], opts[target]] = [opts[target], opts[idx]];
    setEditField({ ...editField, field: { ...editField.field, options: opts } });
  };

  const renameFieldOption = (optId: string, label: string) => {
    if (!editField) return;
    setEditField({
      ...editField,
      field: {
        ...editField.field,
        options: fieldOptions.map((o) => (o.id === optId ? { ...o, label } : o)),
      },
    });
  };

  /* ---- Options Editor ---- */
  const currentOptions = (config[activeOption] ?? []) as ConfigOption[];

  const toggleOption = (id: string) => {
    const opts = currentOptions.map((o) =>
      o.id === id ? { ...o, enabled: !o.enabled } : o
    );
    updateOptionList(activeOption, opts);
  };

  const deleteOption = (id: string) => {
    updateOptionList(activeOption, currentOptions.filter((o) => o.id !== id));
  };

  const addOption = () => {
    if (!newOptionLabel.trim()) return;
    const opt: ConfigOption = {
      id: `${activeOption}_${Date.now()}`,
      label: newOptionLabel.trim(),
      enabled: true,
    };
    updateOptionList(activeOption, [...currentOptions, opt]);
    setNewOptionLabel('');
  };

  const moveOption = (idx: number, dir: -1 | 1) => {
    const opts = [...currentOptions];
    const target = idx + dir;
    if (target < 0 || target >= opts.length) return;
    [opts[idx], opts[target]] = [opts[target], opts[idx]];
    updateOptionList(activeOption, opts);
  };

  const sortedSteps = [...config.intakeSchema].sort((a, b) => a.order - b.order);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-2xl font-bold text-brand-dark">{t('admin.configuration')}</h2>
        <Button size="sm" variant="ghost" onClick={resetConfig}>
          {t('admin.resetToDefaults')}
        </Button>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1 max-w-xs">
        <button
          onClick={() => setTab('intake')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            tab === 'intake' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted'
          }`}
        >
          {t('admin.intakeSchema')}
        </button>
        <button
          onClick={() => setTab('options')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            tab === 'options' ? 'bg-white text-brand-dark shadow-sm' : 'text-brand-muted'
          }`}
        >
          {t('admin.options')}
        </button>
      </div>

      {tab === 'intake' && (
        <div className="space-y-3">
          {sortedSteps.map((step, idx) => (
            <div
              key={step.id}
              className={`bg-white rounded-xl border p-4 ${
                step.enabled ? 'border-brand-border' : 'border-dashed border-gray-300 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="flex flex-col">
                  <button onClick={() => moveStep(idx, -1)} className="text-xs text-brand-muted hover:text-brand-dark">&#9650;</button>
                  <button onClick={() => moveStep(idx, 1)} className="text-xs text-brand-muted hover:text-brand-dark">&#9660;</button>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-brand-dark">{step.title}</div>
                  <div className="text-xs text-brand-muted">{step.fields.length} {t('admin.fields')}</div>
                </div>
                <Toggle label="" checked={step.enabled} onChange={() => toggleStep(step.id)} />
                <button onClick={() => setEditStep(step)} className="text-xs text-brand-green hover:underline">{t('common.edit')}</button>
                <button onClick={() => deleteStep(step.id)} className="text-xs text-red-500 hover:underline">{t('common.delete')}</button>
              </div>

              <div className="ml-8 space-y-1">
                {step.fields.sort((a, b) => a.order - b.order).map((field) => (
                  <div key={field.id} className="flex items-center gap-2 text-sm py-1">
                    <span className={`flex-1 ${field.enabled ? 'text-brand-dark' : 'text-brand-muted line-through'}`}>
                      {field.label}
                    </span>
                    <span className="text-xs text-brand-muted bg-gray-100 px-2 py-0.5 rounded">{field.type}</span>
                    <button onClick={() => setEditField({ stepId: step.id, field: { ...field } })} className="text-xs text-brand-green">{t('common.edit')}</button>
                    <button onClick={() => deleteField(step.id, field.id)} className="text-xs text-red-500">{t('common.delete')}</button>
                  </div>
                ))}
                <button onClick={() => addFieldToStep(step.id)} className="text-xs text-brand-green hover:underline mt-1">
                  {t('admin.addField')}
                </button>
              </div>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addStep}>
            {t('admin.addStep')}
          </Button>
        </div>
      )}

      {tab === 'options' && (
        <div className="flex gap-6">
          <div className="w-48 shrink-0 space-y-1">
            {optionTabs.map((ot) => (
              <button
                key={ot.key}
                onClick={() => setActiveOption(ot.key)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeOption === ot.key
                    ? 'bg-brand-green text-white'
                    : 'text-brand-dark hover:bg-gray-100'
                }`}
              >
                {t(ot.tKey)}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-white rounded-xl border border-brand-border p-4">
            <h3 className="font-semibold text-brand-dark mb-4">
              {t(optionTabs.find((ot) => ot.key === activeOption)?.tKey ?? '')}
            </h3>

            <div className="space-y-2 mb-4">
              {currentOptions.map((opt, idx) => (
                <div key={opt.id} className="flex items-center gap-3 py-1">
                  <div className="flex flex-col">
                    <button onClick={() => moveOption(idx, -1)} className="text-xs text-brand-muted hover:text-brand-dark leading-none">&#9650;</button>
                    <button onClick={() => moveOption(idx, 1)} className="text-xs text-brand-muted hover:text-brand-dark leading-none">&#9660;</button>
                  </div>
                  <span className={`flex-1 text-sm ${opt.enabled ? 'text-brand-dark' : 'text-brand-muted line-through'}`}>
                    {opt.label}
                  </span>
                  <Toggle label="" checked={opt.enabled} onChange={() => toggleOption(opt.id)} />
                  <button onClick={() => deleteOption(opt.id)} className="text-xs text-red-500 hover:underline">{t('common.delete')}</button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder={t('admin.newOption')}
                value={newOptionLabel}
                onChange={(e) => setNewOptionLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addOption()}
              />
              <Button size="sm" onClick={addOption}>{t('common.add')}</Button>
            </div>

            {activeOption === 'languages' && (
              <div className="mt-6 pt-4 border-t border-brand-border">
                <label className="text-sm font-medium text-brand-dark">{t('admin.inactivityTimeout')}</label>
                <input
                  type="number"
                  className="mt-1 w-32 px-3 py-2 border border-brand-border rounded-lg text-sm"
                  value={config.inactivityTimeout}
                  onChange={(e) => updateConfig({ inactivityTimeout: Number(e.target.value) || 120 })}
                />
              </div>
            )}

            {activeOption === 'therapists' && (
              <TherapistScheduleEditor config={config} updateConfig={updateConfig} />
            )}
          </div>
        </div>
      )}

      {/* Edit Step modal */}
      <Modal open={!!editStep} onClose={() => setEditStep(null)} title={t('admin.editStep')}>
        {editStep && (
          <div className="space-y-4">
            <Input
              label={t('admin.stepTitle')}
              value={editStep.title}
              onChange={(e) => setEditStep({ ...editStep, title: e.target.value })}
            />
            <Input
              label={t('admin.stepDescription')}
              value={editStep.description ?? ''}
              onChange={(e) => setEditStep({ ...editStep, description: e.target.value })}
            />
            <Button fullWidth onClick={() => saveStepEdit(editStep)}>{t('common.save')}</Button>
          </div>
        )}
      </Modal>

      {/* Edit Field modal */}
      <Modal open={!!editField} onClose={() => setEditField(null)} title={t('admin.editField')}>
        {editField && (
          <div className="space-y-4">
            <Input
              label={t('admin.fieldLabel')}
              value={editField.field.label}
              onChange={(e) =>
                setEditField({ ...editField, field: { ...editField.field, label: e.target.value } })
              }
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-dark">{t('admin.fieldType')}</label>
              <select
                className="w-full px-3 py-2 border border-brand-border rounded-lg text-sm"
                value={editField.field.type}
                onChange={(e) =>
                  setEditField({
                    ...editField,
                    field: { ...editField.field, type: e.target.value as FieldDefinition['type'] },
                  })
                }
              >
                {['text', 'textarea', 'select', 'multiselect', 'checkbox', 'toggle', 'slider', 'bodymap', 'signature', 'segmented'].map((ft) => (
                  <option key={ft} value={ft}>{ft}</option>
                ))}
              </select>
            </div>
            <Input
              label={t('admin.fieldPlaceholder')}
              value={editField.field.placeholder ?? ''}
              onChange={(e) =>
                setEditField({ ...editField, field: { ...editField.field, placeholder: e.target.value } })
              }
            />
            <Toggle
              label={t('admin.fieldRequired')}
              checked={editField.field.required}
              onChange={(v) =>
                setEditField({ ...editField, field: { ...editField.field, required: v } })
              }
            />
            <Toggle
              label={t('admin.fieldEnabled')}
              checked={editField.field.enabled}
              onChange={(v) =>
                setEditField({ ...editField, field: { ...editField.field, enabled: v } })
              }
            />
            <Input
              label={t('admin.fieldOrder')}
              type="number"
              value={String(editField.field.order)}
              onChange={(e) =>
                setEditField({
                  ...editField,
                  field: { ...editField.field, order: Number(e.target.value) },
                })
              }
            />

            {/* Options sub-editor (for select/multiselect/segmented) */}
            {FIELD_TYPES_WITH_OPTIONS.includes(editField.field.type) && (
              <div className="border-t border-brand-border pt-4">
                <h4 className="text-sm font-semibold text-brand-dark mb-3">{t('admin.fieldOptions')}</h4>
                <div className="space-y-2 mb-3">
                  {fieldOptions.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <div className="flex flex-col">
                        <button type="button" onClick={() => moveFieldOption(idx, -1)} className="text-xs text-brand-muted hover:text-brand-dark leading-none">&#9650;</button>
                        <button type="button" onClick={() => moveFieldOption(idx, 1)} className="text-xs text-brand-muted hover:text-brand-dark leading-none">&#9660;</button>
                      </div>
                      <input
                        className="flex-1 px-2 py-1 border border-brand-border rounded text-sm"
                        value={opt.label}
                        onChange={(e) => renameFieldOption(opt.id, e.target.value)}
                      />
                      <Toggle label="" checked={opt.enabled} onChange={() => toggleFieldOption(opt.id)} />
                      <button type="button" onClick={() => removeFieldOption(opt.id)} className="text-xs text-red-500">×</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-2 py-1 border border-brand-border rounded text-sm"
                    placeholder={t('admin.newOption')}
                    value={newFieldOptionLabel}
                    onChange={(e) => setNewFieldOptionLabel(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addFieldOption()}
                  />
                  <button
                    type="button"
                    onClick={addFieldOption}
                    className="px-3 py-1 bg-brand-green text-white rounded text-sm"
                  >
                    {t('common.add')}
                  </button>
                </div>
              </div>
            )}

            <Button fullWidth onClick={saveFieldEdit}>{t('common.save')}</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ── Therapist Schedule Editor (inline component) ── */

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function TherapistScheduleEditor({
  config,
  updateConfig,
}: {
  config: AppConfig;
  updateConfig: (partial: Partial<AppConfig>) => Promise<void>;
}) {
  const therapists = config.therapists as TherapistConfigOption[];

  const getSlot = (th: TherapistConfigOption, dow: number): TherapistScheduleSlot | undefined =>
    th.schedule?.find((s) => s.dayOfWeek === dow);

  const updateSchedule = (therapistId: string, dow: number, slot: TherapistScheduleSlot | null) => {
    const updated = therapists.map((th) => {
      if (th.id !== therapistId) return th;
      const schedule = (th.schedule ?? []).filter((s) => s.dayOfWeek !== dow);
      if (slot) schedule.push(slot);
      return { ...th, schedule };
    });
    updateConfig({ therapists: updated });
  };

  const toggleDay = (therapistId: string, dow: number) => {
    const th = therapists.find((t) => t.id === therapistId);
    if (!th) return;
    const existing = getSlot(th, dow);
    if (existing) {
      updateSchedule(therapistId, dow, null);
    } else {
      updateSchedule(therapistId, dow, { dayOfWeek: dow, startTime: '10:00', endTime: '18:00' });
    }
  };

  const updateTime = (therapistId: string, dow: number, field: 'startTime' | 'endTime', value: string) => {
    const th = therapists.find((t) => t.id === therapistId);
    if (!th) return;
    const existing = getSlot(th, dow);
    if (!existing) return;
    updateSchedule(therapistId, dow, { ...existing, [field]: value });
  };

  return (
    <div className="mt-6 pt-4 border-t border-brand-border space-y-6">
      {/* Slot settings */}
      <div className="flex items-center gap-6">
        <div>
          <label className="text-sm font-medium text-brand-dark">Slot Duration (min)</label>
          <input
            type="number"
            className="mt-1 w-24 px-3 py-2 border border-brand-border rounded-lg text-sm"
            value={config.slotDurationMinutes}
            onChange={(e) => updateConfig({ slotDurationMinutes: Number(e.target.value) || 60 })}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-brand-dark">Buffer (min)</label>
          <input
            type="number"
            className="mt-1 w-24 px-3 py-2 border border-brand-border rounded-lg text-sm"
            value={config.bookingBufferMinutes}
            onChange={(e) => updateConfig({ bookingBufferMinutes: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <h4 className="font-semibold text-brand-dark">Therapist Schedules</h4>

      {therapists.filter((th) => th.enabled).map((th) => (
        <div key={th.id} className="border border-brand-border rounded-lg p-3">
          <div className="font-medium text-brand-dark mb-3">{th.label}</div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 0].map((dow) => {
              const slot = getSlot(th, dow);
              const isActive = !!slot;
              return (
                <div key={dow} className="flex items-center gap-3">
                  <span className="w-10 text-xs font-medium text-brand-muted">{DAY_LABELS[dow]}</span>
                  <button
                    onClick={() => toggleDay(th.id, dow)}
                    className={`w-8 h-5 rounded-full transition-colors relative ${isActive ? 'bg-brand-green' : 'bg-gray-300'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isActive ? 'left-3.5' : 'left-0.5'}`} />
                  </button>
                  {isActive ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="time"
                        className="px-2 py-1 border border-brand-border rounded text-sm"
                        value={slot!.startTime}
                        onChange={(e) => updateTime(th.id, dow, 'startTime', e.target.value)}
                      />
                      <span className="text-brand-muted text-sm">—</span>
                      <input
                        type="time"
                        className="px-2 py-1 border border-brand-border rounded text-sm"
                        value={slot!.endTime}
                        onChange={(e) => updateTime(th.id, dow, 'endTime', e.target.value)}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-brand-muted">Off</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
