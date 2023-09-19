import React, { forwardRef } from "react";
import { TextInput, TextInputProps } from "~/components/form/inputs/text.input";
import { useFieldContext } from "~/components/form/fields/field.context";

export const TextInputField = forwardRef<
  HTMLInputElement,
  Partial<TextInputProps>
>((props, ref) => {
  const { name, getInputProps, error } = useFieldContext();
  return (
    <TextInput
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

export const PasswordInputField = forwardRef<
  HTMLInputElement,
  Partial<TextInputProps>
>((props, ref) => {
  return <TextInputField ref={ref} type={"password"} {...props} />;
});
