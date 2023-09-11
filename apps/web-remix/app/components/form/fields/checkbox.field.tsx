import React, { forwardRef } from "react";
import { useFieldContext } from "~/components/form/fields/field.context";
import {
  CheckboxInput,
  CheckboxInputProps,
} from "~/components/form/inputs/checkbox.input";

export const CheckboxInputField = forwardRef<
  HTMLInputElement,
  Partial<CheckboxInputProps>
>((props, ref) => {
  const { name, getInputProps, error } = useFieldContext();
  return (
    <CheckboxInput
      // @ts-ignore
      name={name}
      ref={ref}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      autoComplete={name}
      step={1}
      {...props}
      {...getInputProps()}
    />
  );
});
