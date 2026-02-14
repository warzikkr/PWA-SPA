interface Option {
  id: string;
  label: string;
  description?: string;
}

interface Props {
  options: Option[];
  value: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  label?: string;
  error?: string;
}

export function CardSelector({ options, value, onChange, multiple, label, error }: Props) {
  const selected = Array.isArray(value) ? value : [value];

  const toggle = (id: string) => {
    if (multiple) {
      const next = selected.includes(id)
        ? selected.filter((v) => v !== id)
        : [...selected, id];
      onChange(next);
    } else {
      onChange(id);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-sm font-medium text-brand-dark">{label}</span>
      )}
      <div className="grid gap-3">
        {options.map((opt) => {
          const isSelected = selected.includes(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => toggle(opt.id)}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition-colors
                ${isSelected
                  ? 'border-brand-green bg-white'
                  : 'border-brand-border bg-white hover:border-gray-300'
                }
              `}
            >
              <div className="text-base font-medium text-brand-dark text-center">
                {opt.label}
              </div>
              {opt.description && (
                <div className="text-sm text-brand-muted mt-1 text-center">
                  {opt.description}
                </div>
              )}
            </button>
          );
        })}
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
