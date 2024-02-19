import React, { forwardRef, useEffect } from "react";
import { useFieldContext } from "~/components/form/fields/field.context";
import {
  RadioInput,
  RadioInputProps,
} from "~/components/form/inputs/radio.input";
import { useControlField } from "remix-validated-form";

export const RadioField = forwardRef<HTMLInputElement, RadioInputProps>(
  ({ defaultValue, onChange, ...props }, ref) => {
    const { name, getInputProps, validate } = useFieldContext();
    const [formValue, setFormValue] = useControlField<string>(name);

    useEffect(() => {
      if (!formValue && defaultValue) {
        setFormValue(defaultValue as string);
        validate();
      }
    }, [defaultValue, formValue, setFormValue, validate]);

    return (
      <RadioInput
        {...props}
        {...getInputProps({ type: "radio", id: props.id })}
        ref={ref}
        checked={formValue === props.value}
        onChange={(e) => {
          setFormValue(e.target.value);
          validate();
          onChange?.(e);
        }}
      />
    );
  }
);
