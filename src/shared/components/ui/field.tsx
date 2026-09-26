import * as React from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { cn } from "@/shared/utils/cn";

type FieldRootProps = React.ComponentProps<typeof BaseField.Root>;

export function Field({ className, ...props }: FieldRootProps) {
  return <BaseField.Root {...props} className={cn("flex flex-col gap-1.5", className)} />;
}

type FieldLabelProps = React.ComponentProps<typeof BaseField.Label>;

export function FieldLabel({ className, ...props }: FieldLabelProps) {
  return (
    <BaseField.Label
      {...props}
      className={cn("text-xs font-semibold uppercase tracking-wider text-on-surface-variant", className)}
    />
  );
}

export const FieldControl = BaseField.Control;

type FieldMessageProps = React.ComponentProps<typeof BaseField.Description>;

export function FieldDescription({ className, ...props }: FieldMessageProps) {
  return <BaseField.Description {...props} className={cn("text-xs text-on-surface-variant", className)} />;
}

type FieldErrorProps = React.ComponentProps<typeof BaseField.Error>;

export function FieldError({ className, ...props }: FieldErrorProps) {
  return <BaseField.Error {...props} className={cn("text-xs font-medium text-error", className)} />;
}
