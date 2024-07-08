import React, { forwardRef, ReactNode } from "react";
import { useControlField, useFormContext } from "remix-validated-form";
import { InputText, Label } from "@elpassion/taco";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import { SelectInput } from "~/components/form/inputs/select/select.input";
import { SelectInputProps } from "~/components/form/inputs/select/select.input-impl.client";

interface SelectFieldProps extends SelectInputProps {
  label?: ReactNode;
  supportingText?: ReactNode;
  errorMessage?: ReactNode;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    { defaultValue, options, label, supportingText, errorMessage, ...props },
    _ref,
  ) => {
    const { name, getInputProps } = useFieldContext();
    const [selectedId, setSelectedId] = useControlField<string | string[]>(
      name,
    );

    const { fieldErrors } = useFormContext();

    return (
      <div>
        <HiddenField
          value={
            Array.isArray(selectedId)
              ? JSON.stringify(selectedId)
              : selectedId ?? ""
          }
          {...getInputProps()}
        />
        <Label text={label} />
        <SelectInput
          id={name}
          options={options}
          value={selectedId}
          placeholder="Select..."
          onChange={setSelectedId}
          {...props}
        />
        <InputText
          text={errorMessage || fieldErrors[name] || supportingText}
          error={!!(errorMessage || fieldErrors[name])}
        />
      </div>
    );
  },
);
