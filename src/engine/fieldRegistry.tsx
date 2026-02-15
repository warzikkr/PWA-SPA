import { Controller, type Control } from 'react-hook-form';
import type { FieldDefinition } from './schemaTypes';
import type { BodyZoneSelection } from '../types';
import {
  Input,
  Select,
  Checkbox,
  Toggle,
  SegmentedControl,
  CardSelector,
  Slider,
  SignaturePad,
} from '../shared/components';
import { UnifiedBodyMap } from '../components/bodymap/UnifiedBodyMap';

interface FieldProps {
  field: FieldDefinition;
  control: Control<Record<string, unknown>>;
  error?: string;
}

/** Determine body map mode from field id */
function bodyMapMode(fieldId: string): 'focus' | 'avoid' {
  if (fieldId.includes('avoid')) return 'avoid';
  return 'focus';
}

export function DynamicField({ field, control, error }: FieldProps) {
  const enabledOptions = (field.options ?? []).filter((o) => o.enabled);

  switch (field.type) {
    case 'text':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue=""
          render={({ field: f }) => (
            <Input
              label={field.label}
              placeholder={field.placeholder}
              value={f.value as string}
              onChange={f.onChange}
              error={error}
            />
          )}
        />
      );

    case 'textarea':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue=""
          render={({ field: f }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-dark">{field.label}</label>
              <textarea
                className="w-full min-h-[96px] px-4 py-3 text-base border border-brand-border rounded-lg
                           focus:outline-none focus:border-brand-green focus:ring-1 focus:ring-brand-green
                           placeholder:text-brand-muted resize-none"
                placeholder={field.placeholder}
                value={f.value as string}
                onChange={f.onChange}
              />
              {error && <span className="text-sm text-red-500">{error}</span>}
            </div>
          )}
        />
      );

    case 'select':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue=""
          render={({ field: f }) => (
            <Select
              label={field.label}
              options={enabledOptions.map((o) => ({ value: o.id, label: o.label }))}
              value={f.value as string}
              onChange={f.onChange}
              placeholder="Select..."
              error={error}
            />
          )}
        />
      );

    case 'multiselect':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={[]}
          render={({ field: f }) => (
            <CardSelector
              label={field.label}
              multiple
              options={enabledOptions}
              value={f.value as string[]}
              onChange={(v) => f.onChange(v)}
              error={error}
            />
          )}
        />
      );

    case 'segmented':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue=""
          render={({ field: f }) => (
            <SegmentedControl
              label={field.label}
              options={enabledOptions}
              value={f.value as string}
              onChange={(v) => f.onChange(v)}
              error={error}
            />
          )}
        />
      );

    case 'checkbox':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={false}
          render={({ field: f }) => (
            <Checkbox
              label={field.label}
              checked={f.value as boolean}
              onChange={(e) => f.onChange(e.target.checked)}
              error={error}
            />
          )}
        />
      );

    case 'toggle':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={false}
          render={({ field: f }) => (
            <Toggle
              label={field.label}
              checked={f.value as boolean}
              onChange={(v) => f.onChange(v)}
            />
          )}
        />
      );

    case 'slider':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={field.validation?.min ?? 0}
          render={({ field: f }) => (
            <Slider
              label={field.label}
              value={f.value as number}
              onChange={(v) => f.onChange(v)}
              min={field.validation?.min ?? 0}
              max={field.validation?.max ?? 10}
              error={error}
            />
          )}
        />
      );

    case 'bodymap': {
      const editType = bodyMapMode(field.id);
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue={[]}
          render={({ field: f }) => (
            <UnifiedBodyMap
              mode="edit"
              editableType={editType}
              focusZones={editType === 'focus' ? (f.value as BodyZoneSelection[]) : []}
              avoidZones={editType === 'avoid' ? (f.value as BodyZoneSelection[]) : []}
              onChange={(v) => f.onChange(v)}
              maxSelections={field.validation?.max}
              label={field.label}
              error={error}
            />
          )}
        />
      );
    }

    case 'signature':
      return (
        <Controller
          name={field.id}
          control={control}
          defaultValue=""
          render={({ field: f }) => (
            <SignaturePad
              label={field.label}
              value={f.value as string}
              onChange={(v) => f.onChange(v)}
            />
          )}
        />
      );

    default:
      return <div className="text-red-500 text-sm">Unknown field type: {field.type}</div>;
  }
}
