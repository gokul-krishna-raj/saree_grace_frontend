import { cn } from "@/lib/cn";

export interface CheckboxGroupOption {
  value: string;
  label: string;
}

export interface CheckboxGroupProps {
  label?: string;
  options: CheckboxGroupOption[];
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

export function CheckboxGroup({
  label,
  options,
  value,
  onChange,
  error,
  disabled,
  className,
}: CheckboxGroupProps) {
  function toggle(optionValue: string) {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <fieldset className={cn("flex flex-col gap-2", className)}>
      {label ? <legend className="text-maroon-900 text-sm font-medium">{label}</legend> : null}
      <div className="flex flex-wrap gap-3">
        {options.map((option) => (
          <label key={option.value} className="text-maroon-800 flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              disabled={disabled}
              onChange={() => toggle(option.value)}
              aria-invalid={error ? true : undefined}
              className="border-maroon-200 text-maroon-700 focus-visible:outline-maroon-600 h-5 w-5 rounded focus-visible:outline-2"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
