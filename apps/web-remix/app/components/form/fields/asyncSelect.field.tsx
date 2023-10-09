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
import { SingleValue } from "react-select";

export const AsyncSelectField = forwardRef<
  HTMLSelectElement,
  Partial<Omit<AsyncSelectInputProps, "defaultValue">> & {
    url: string;
    defaultValue?: string;
  }
>(({ url, defaultValue }, _ref) => {
  const { name, getInputProps } = useFieldContext();
  const [selectedId, setSelectedId] = useControlField<string>(name);
  const [options, setOptions] = useState<IAsyncSelectItemList>([]);

  const loadOptions = (
    _input: string,
    callback: (options: IDropdownOption[]) => void
  ) => {
    asyncSelectApi.getData(url).then(options => {
      if (defaultValue && !options.find(option => option.id === defaultValue)) {
        options = [{ id: defaultValue, name: defaultValue }, ...options]
      }
      setOptions(options);
      callback(options.map(toSelectOption));
    })
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
        defaultOptions
        id={name}
        value={selectedOption && toSelectOption(selectedOption)}
        loadOptions={loadOptions}
        onSelect={(option: SingleValue<IDropdownOption>) => {
          if (option) {
            setSelectedId(option.id);
          }
        }}
      />
    </>
  );
});
function toSelectOption(item: IAsyncSelectItem) {
  return {
    id: item.id.toString(),
    value: item.id.toString(),
    label: item.name,
  };
}
