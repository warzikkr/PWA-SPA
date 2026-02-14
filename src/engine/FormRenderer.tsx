import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { StepDefinition, FieldDefinition } from './schemaTypes';
import { DynamicField } from './fieldRegistry';

interface Props {
  step: StepDefinition;
  defaultValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => void;
  submitLabel?: string;
  onBack?: () => void;
}

/** Zod schema for a BodyZoneSelection object */
const bodyZoneSelectionSchema = z.object({
  side: z.enum(['front', 'back']),
  half: z.enum(['left', 'right']),
  region: z.string(),
});

/** Build a Zod schema dynamically from field definitions */
function buildZodSchema(fields: FieldDefinition[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    if (!field.enabled) continue;

    let schema: z.ZodTypeAny;

    switch (field.type) {
      case 'text':
      case 'textarea':
        schema = field.required ? z.string().min(1, 'Required') : z.string().optional();
        break;
      case 'select':
      case 'segmented':
        schema = field.required ? z.string().min(1, 'Please select') : z.string().optional();
        break;
      case 'multiselect':
        schema = field.required
          ? z.array(z.string()).min(field.validation?.min ?? 1, 'Select at least one')
          : z.array(z.string()).optional();
        break;
      case 'bodymap':
        schema = field.required
          ? z.array(bodyZoneSelectionSchema).min(field.validation?.min ?? 1, 'Select at least one')
          : z.array(bodyZoneSelectionSchema).optional();
        break;
      case 'checkbox':
        schema = field.required
          ? z.literal(true, { message: 'Required' })
          : z.boolean().optional();
        break;
      case 'toggle':
        schema = z.boolean().optional();
        break;
      case 'slider':
        schema = z.number().optional();
        break;
      case 'signature':
        schema = field.required ? z.string().min(1, 'Signature required') : z.string().optional();
        break;
      default:
        schema = z.unknown();
    }

    shape[field.id] = schema;
  }

  return z.object(shape);
}

export function FormRenderer({ step, defaultValues, onSubmit, submitLabel = 'Continue', onBack }: Props) {
  const enabledFields = step.fields
    .filter((f) => f.enabled)
    .sort((a, b) => a.order - b.order);

  const zodSchema = buildZodSchema(enabledFields);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Record<string, unknown>>({
    resolver: zodResolver(zodSchema),
    defaultValues: defaultValues ?? {},
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      {enabledFields.map((field) => (
        <DynamicField
          key={field.id}
          field={field}
          control={control}
          error={errors[field.id]?.message as string | undefined}
        />
      ))}

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-brand-border safe-bottom">
        <div className="flex gap-3 max-w-lg mx-auto">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex-1 min-h-[52px] rounded-lg border border-brand-border text-brand-dark font-medium text-lg"
            >
              Back
            </button>
          )}
          <button
            type="submit"
            className="flex-1 min-h-[52px] rounded-lg bg-brand-dark text-white font-medium text-lg"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}
