import React, { forwardRef, useRef } from "react";
import { useFieldContext } from "~/components/form/fields/field.context";
import { SmallFileInput, SmallFileInputProps } from "../inputs/file.input";

export const SmallFileInputField = forwardRef<
  HTMLInputElement,
  Partial<SmallFileInputProps>
>(({ errorMessage, ...props }, ref) => {
  const { name, getInputProps, error } = useFieldContext();

  return (
    <SmallFileInput
      name={name}
      aria-invalid={error ? true : undefined}
      aria-describedby={`${name}-error`}
      aria-errormessage={error ? `${name}-error` : undefined}
      aria-label={name}
      autoComplete={name}
      errorMessage={errorMessage ?? error}
      {...props}
      {...getInputProps()}
    />
  );
});
