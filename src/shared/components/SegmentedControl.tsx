interface Option {
  id: string;
  label: string;
}

interface Props {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function SegmentedControl({ label, options, value, onChange, error }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-sm font-medium text-brand-dark">{label}</span>
      )}
      <div className="flex border border-brand-border rounded-lg overflow-hidden">
        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`
              flex-1 min-h-[48px] px-4 py-3 text-base font-medium transition-colors
              border-r last:border-r-0 border-brand-border
              ${
                value === opt.id
                  ? 'bg-white text-brand-green border-2 border-brand-green -m-px z-10 rounded-lg'
                  : 'bg-white text-brand-dark hover:bg-gray-50'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
