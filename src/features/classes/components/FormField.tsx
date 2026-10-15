interface FormFieldProps {
  id: string;
  label: string;
  isRequired?: boolean;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}

export const INPUT_CLASSES =
  "h-[46px] w-full rounded-[13px] border border-bvc-border-strong bg-white px-[13px] text-[14.5px] text-bvc-ink focus:border-bvc-accent focus:outline-none aria-[invalid=true]:border-bvc-error read-only:bg-bvc-soft disabled:bg-bvc-soft disabled:text-bvc-muted";

export function FormField({ id, label, isRequired = false, hint, error, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-[6px]">
      <label htmlFor={id} className="text-[13.5px] font-semibold">
        {label} {isRequired && <span className="text-bvc-accent-text">*</span>}
      </label>
      {children}
      {error ? (
        <span id={`${id}-error`} role="alert" className="text-[12px] text-bvc-error">
          {error}
        </span>
      ) : (
        hint && <span className="text-[12px] text-bvc-muted">{hint}</span>
      )}
    </div>
  );
}
