interface Props {
  steps: string[];
  current: number;
}

export function StepProgress({ steps, current }: Props) {
  return (
    <div className="flex items-center gap-1 w-full px-4">
      {steps.map((_, i) => (
        <div
          key={i}
          className={`
            h-1 flex-1 rounded-full transition-colors
            ${i <= current ? 'bg-brand-green' : 'bg-gray-200'}
          `}
        />
      ))}
    </div>
  );
}
