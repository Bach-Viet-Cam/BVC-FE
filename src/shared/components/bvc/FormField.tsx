import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
}

// Không có htmlFor (nhóm chip, radio...) thì nhãn là <span> để không gắn nhầm control
export function FormField({ label, htmlFor, required, hint, error, children, className }: FormFieldProps) {
  const LabelTag = htmlFor ? "label" : "span";

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <LabelTag htmlFor={htmlFor} className="text-[13.5px] font-semibold text-bvc-ink">
        {label}
        {required && <span className="ml-1 text-bvc-accent-text">*</span>}
      </LabelTag>
      {children}
      {error ? (
        <p role="alert" className="text-[12.5px] font-medium text-bvc-error">
          {error}
        </p>
      ) : (
        hint && <span className="text-xs leading-snug text-bvc-muted">{hint}</span>
      )}
    </div>
  );
}
