import React, { forwardRef } from "react";
import { useFieldContext } from "~/components/form/fields/field.context";
import {
  CheckboxInput,
  CheckboxInputProps,
} from "~/components/form/inputs/checkbox.input";
import { useControlField } from "remix-validated-form";

export const CheckboxInputField = forwardRef<
  HTMLInputElement,
  Partial<CheckboxInputProps>
>((props, ref) => {
  const { name, getInputProps, validate, error } = useFieldContext();
  const [formValue, setFormValue] = useControlField<boolean>(name);

  return (
    <CheckboxInput
      ref={ref}
      {...props}
      {...getInputProps({ type: "checkbox", id: props.id })}
      checked={formValue}
      onChange={(e) => {
        setFormValue(e.target.checked);
        validate();
      }}
    />
  );
});
