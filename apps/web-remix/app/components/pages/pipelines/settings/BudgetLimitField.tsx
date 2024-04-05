import React from "react";
import { ToggleInput } from "~/components/form/inputs/toggle.input";
import { useFieldContext } from "~/components/form/fields/field.context";
import { useControlField, useFormContext } from "remix-validated-form";
import { InputText, Label } from "@elpassion/taco";
import {
  NumberInput,
  NumberInputProps,
} from "~/components/form/inputs/number.input";

export const BudgetLimitField: React.FC<Partial<NumberInputProps>> = ({
  supportingText,
  label,
  ...rest
}) => {
  const { name } = useFieldContext();
  const { fieldErrors } = useFormContext();
  const [value, setValue] = useControlField<number | null>(name);

  const onCheck = (bool: boolean) => {
    if (bool) {
      setValue(0);
    } else {
      setValue(null);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.valueAsNumber);
  };
  return (
    <div>
      <div className="flex gap-2" onClick={(e) => e.preventDefault()}>
        <Label text={label} />
        <ToggleInput
          autoComplete={name}
          checked={value !== null}
          onChange={onCheck}
          value=""
        />
      </div>

      <NumberInput
        id={name}
        name={name}
        value={value ?? 0}
        onChange={onChange}
        min={0}
        {...rest}
        disabled={value === null}
      />

      <InputText
        text={fieldErrors[name] || supportingText}
        error={!!fieldErrors[name]}
      />
    </div>
  );
};
