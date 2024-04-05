import React, { forwardRef } from "react";
import { useFieldContext } from "~/components/form/fields/field.context";
import {
  ToggleInput,
  ToggleInputProps,
} from "~/components/form/inputs/toggle.input";

export const ToggleInputField = forwardRef<
  HTMLInputElement,
  Partial<ToggleInputProps>
>(({ ...props }, ref) => {
  const { name, getInputProps, error } = useFieldContext();

  return (
    <ToggleInput
      name={name}
      ref={ref}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      aria-label={name}
      autoComplete={name}
      {...props}
      {...getInputProps()}
    />
  );
});
