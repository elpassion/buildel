import React, { forwardRef, useState } from "react";
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
  const [myValue, setMyValue] = useState<string | undefined>(undefined);

  return (
    <RadioCardGroupInput
      // @ts-ignore
      name={name}
      {...getInputProps()}
      value={value ?? myValue}
      onChange={(v) => {
        setMyValue(v);
        setValue(v);
        validate();
      }}
      {...props}
    />
  );
});
