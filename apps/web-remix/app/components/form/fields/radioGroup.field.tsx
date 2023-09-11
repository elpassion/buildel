import React, { forwardRef } from "react";
import { useControlField } from "remix-validated-form";
import { useFieldContext } from "~/components/form/fields/field.context";
import {
  RadioCardGroupInput,
  RadioCardGroupInputProps,
} from "~/components/form/inputs/radioGroup.input";

export const RadioGroupField = forwardRef<
  HTMLInputElement,
  Partial<Omit<RadioCardGroupInputProps, "value" | "onChange">>
>((props, ref) => {
  const { name, getInputProps, validate } = useFieldContext();
  const [value, setValue] = useControlField<string>(name);
  // console.log(name);
  return (
    <RadioCardGroupInput
      // @ts-ignore
      name={name}
      {...getInputProps()}
      value={value}
      onChange={(v) => {
        setValue(v);
        validate();
      }}
      {...props}
    />
  );
});
