import React, { forwardRef } from "react";
import { InputNumberProps } from "@elpassion/taco";
import { useFieldContext } from "~/components/form/fields/field.context";
import { NumberInput } from "../inputs/number.input";

export const NumberInputField = forwardRef<
  HTMLInputElement,
  Partial<InputNumberProps>
>((props, ref) => {
  const { name, getInputProps, error } = useFieldContext();
  return (
    <NumberInput
      name={name}
      ref={ref}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      autoComplete={name}
      errorMessage={error}
      {...props}
      {...getInputProps()}
    />
  );
});
