import React, { forwardRef } from "react";
import { SingleValue } from "react-select";
import { IDropdownOption } from "@elpassion/taco/Dropdown";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import { useControlField, useFormContext } from "remix-validated-form";
import {
  SelectInput,
  SelectInputProps,
} from "~/components/form/inputs/select.input";

type SelectFieldProps = Omit<SelectInputProps, "onSelect" | "id">;

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  ({ defaultValue, options, ...props }, _ref) => {
    const { name, getInputProps } = useFieldContext();
    const [selectedId, setSelectedId] = useControlField<string>(name);

    const getSelectedOption = () => {
      return options.find((option) => option.id.toString() === selectedId);
    };

    const selectedOption = getSelectedOption();

    const { fieldErrors } = useFormContext();

    return (
      <>
        <HiddenField value={selectedId ?? ""} {...getInputProps()} />
        <SelectInput
          key={name}
          id={name}
          options={options}
          errorMessage={fieldErrors[name]}
          value={selectedOption && toSelectOption(selectedOption)}
          onSelect={(option: SingleValue<IDropdownOption>) => {
            if (option) {
              setSelectedId(option.id);
            }
          }}
          {...props}
        />
      </>
    );
  }
);
export function toSelectOption(item: IDropdownOption) {
  return {
    id: item.id.toString(),
    value: item.id.toString(),
    label: item.label,
  };
}
