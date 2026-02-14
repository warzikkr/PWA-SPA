interface Props {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}

export function Slider({ label, value, onChange, min = 0, max = 10, step = 1, error }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-brand-dark">{label}</span>
          <span className="text-lg font-semibold text-brand-green">{value}</span>
        </div>
      )}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-lg appearance-none bg-gray-200 accent-brand-green"
      />
      <div className="flex justify-between text-xs text-brand-muted">
        <span>{min}</span>
        <span>{max}</span>
      </div>
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
}
