import React, { forwardRef, ReactNode, useCallback } from "react";
import { useControlField } from "remix-validated-form";
import { InputText, Label } from "@elpassion/taco";
import { asyncSelectApi, IAsyncSelectItem } from "~/api/AsyncSelectApi";
import {
  HiddenField,
  useFieldContext,
} from "~/components/form/fields/field.context";
import {
  AsyncSelectInputProps,
  AsyncSelectInput,
} from "~/components/form/inputs/select/select.input";

export interface AsyncSelectFieldProps extends Partial<AsyncSelectInputProps> {
  url: string;
  label?: ReactNode;
  supportingText?: ReactNode;
  errorMessage?: ReactNode;
  id: string;
}

export const AsyncSelectField = forwardRef<
  HTMLSelectElement,
  AsyncSelectFieldProps
>(
  (
    { url, defaultValue, label, supportingText, errorMessage, ...props },
    _ref
  ) => {
    const { name, getInputProps } = useFieldContext();
    const [selectedId, setSelectedId] = useControlField<string | undefined>(
      name
    );

    const fetcher = useCallback(async () => {
      return asyncSelectApi
        .getData(url)
        .then((opts) => opts.map(toSelectOption))
        .then((opts) => {
          const curr = opts.find((o) => o.value === selectedId);
          if (!curr) setSelectedId(undefined);

          return opts;
        });
    }, [url, selectedId]);

    return (
      <>
        <HiddenField value={selectedId} {...getInputProps()} />
        <Label text={label} />
        <AsyncSelectInput
          placeholder="Select..."
          fetchOptions={fetcher}
          defaultValue={defaultValue}
          onChange={setSelectedId}
          value={selectedId}
          data-testid={props.id}
          {...props}
        />
        <InputText
          text={errorMessage ?? supportingText}
          error={!!errorMessage}
        />
      </>
    );
  }
);
export function toSelectOption(item: IAsyncSelectItem) {
  return {
    id: item.id.toString(),
    value: item.id.toString(),
    label: item.name,
  };
}
