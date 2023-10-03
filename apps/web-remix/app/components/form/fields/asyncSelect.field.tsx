import React, { forwardRef, useEffect, useState } from "react";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import {
  AsyncSelectInput,
  AsyncSelectInputProps,
} from "~/components/form/inputs/asyncSelect.input";
import {
  asyncSelectApi,
  IAsyncSelectItem,
  IAsyncSelectItemList,
} from "~/api/AsyncSelectApi";
import { useControlField } from "remix-validated-form";
import { IDropdownOption } from "@elpassion/taco/Dropdown";
import { MultiValue, SingleValue } from "react-select";

export const AsyncSelectField = forwardRef<
  HTMLSelectElement,
  Partial<Omit<AsyncSelectInputProps, "defaultValue">> & {
    url: string;
    defaultValue?: string;
  }
>(({ url, defaultValue, ...props }, ref) => {
  const { name, getInputProps } = useFieldContext();
  const [selectedId, setSelectedId] = useControlField<string>(name);
  const [options, setOptions] = useState<IAsyncSelectItemList>([]);

  const loadOptions = (
    _input: string,
    callback: (options: IDropdownOption[]) => void
  ) => {
    asyncSelectApi.getData(url).then((res) => {
      setOptions(res);
      console.log(res.map(toSelectOption));
      callback(res.map(toSelectOption));
    });
  };

  useEffect(() => {
    if (!selectedId && defaultValue) {
      setSelectedId(defaultValue);
    }
  }, [selectedId, setSelectedId]);

  const getSelectedOption = () => {
    return options.find((option) => option.id === selectedId);
  };

  const selectedOption = getSelectedOption();

  return (
    <>
      <HiddenField value={selectedId} {...getInputProps()} />
      <AsyncSelectInput
        cacheOptions
        id={name}
        value={selectedOption && toSelectOption(selectedOption)}
        loadOptions={loadOptions}
        onSelect={(option: SingleValue<IDropdownOption>) => {
          if (option) {
            setSelectedId(option.id);
          }
        }}
        //@ts-ignore
        defaultOptions={true}
      />
    </>
  );
});

function isSingleValue(
  value: SingleValue<IDropdownOption> | MultiValue<IDropdownOption>
): value is SingleValue<IDropdownOption> {
  return (value as SingleValue<IDropdownOption>)?.id !== undefined;
}

function toSelectOption(item: IAsyncSelectItem) {
  return {
    id: item.id.toString(),
    value: item.id.toString(),
    label: item.name,
  };
}
