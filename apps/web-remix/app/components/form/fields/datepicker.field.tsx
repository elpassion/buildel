import React from "react";
import { useControlField } from "remix-validated-form";
import {
  DatepickerInput,
  DatepickerInputProps,
} from "~/components/form/inputs/datepicker.input";
import { useFieldContext } from "~/components/form/fields/field.context";

export const DatepickerField: React.FC<
  Omit<DatepickerInputProps, "onChange" | "selected">
> = (props) => {
  const { name } = useFieldContext();
  const [value, setValue] = useControlField<Date | undefined>(name);

  const handleOnChange = (date: Date | null) => {
    setValue(date ?? undefined);
  };

  return (
    <DatepickerInput onChange={handleOnChange} selected={value} {...props} />
  );
};
