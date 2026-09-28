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
      {label ? <legend className="text-foreground text-sm font-medium">{label}</legend> : null}
      <div className="flex flex-col gap-0">
        {options.map((option) => (
          <label
            key={option.value}
            className="text-foreground flex min-h-11 cursor-pointer items-center gap-2.5 text-sm"
          >
            <input
              type="checkbox"
              checked={value.includes(option.value)}
              disabled={disabled}
              onChange={() => toggle(option.value)}
              aria-invalid={error ? true : undefined}
              className="accent-primary h-4.5 w-4.5 rounded-sm"
            />
            {option.label}
          </label>
        ))}
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
