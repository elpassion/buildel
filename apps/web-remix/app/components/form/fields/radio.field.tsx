import React, { forwardRef, useState } from "react";
import { useFieldContext } from "~/components/form/fields/field.context";
import {
  RadioInput,
  RadioInputProps,
} from "~/components/form/inputs/radio.input";
import { useControlField, useFormContext } from "remix-validated-form";

export const RadioField = forwardRef<HTMLInputElement, RadioInputProps>(
  (props, ref) => {
    const { getValues } = useFormContext();
    const { name, getInputProps, validate } = useFieldContext();
    const [value, setValue] = useControlField<string>(name);
    const [myValue, setMyValue] = useState<string | undefined>(undefined);

    console.log(getInputProps(), value);
    console.log([...getValues().entries()]);
    return (
      <RadioInput
        {...getInputProps({ type: "radio", id: props.id })}
        {...props}
        value={value ?? myValue}
        onChange={(e) => {
          setMyValue(e.target.value);
          setValue(e.target.value);
          validate();
        }}

        // onChange={(e) => setValue(e.target.value)}
      />
    );
  }
);
