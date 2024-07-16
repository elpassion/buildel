import React, { useCallback, useEffect, useState } from "react";
import { Option } from "rc-select";
import { ClientOnly } from "remix-utils/client-only";
import { useDebounce, useIsMounted } from "usehooks-ts";
import AsyncSelectInputComponent from "./select.input-impl.client";
import type {
  SelectInputProps,
} from "./select.input-impl.client";

export const SelectInput: React.FC<SelectInputProps> = ({ ...props }) => {
  return (
    <ClientOnly
      fallback={
        <div className="w-full h-[44px] rounded-lg border-[1.5px] border-neutral-200 bg-neutral-800" />
      }
    >
      {() => <AsyncSelectInputComponent {...props} />}
    </ClientOnly>
  );
};

export interface AsyncSelectInputProps<T = {}>
  extends Omit<
    SelectInputProps,
    "options" | "loading" | "onSearch" | "searchValue"
  > {
  fetchOptions: (
    search: string
  ) => Promise<({ value: string; label: string } & T)[]>;
  onOptionsFetch?: (options: ({ value: string; label: string } & T)[]) => void;
}

export const AsyncSelectInput = <T = {},>({
  fetchOptions,
  onOptionsFetch,
  ...props
}: AsyncSelectInputProps<T>) => {
  const isMounted = useIsMounted();
  const [loading, setLoading] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    []
  );

  const loadOptions = useCallback(() => {
    setLoading(true);
    fetchOptions(debouncedSearch)
      .then((options) => {
        setOptions(options);
        onOptionsFetch?.(options);
      })
      .finally(() => isMounted() && setLoading(false));
  }, [fetchOptions, debouncedSearch]);

  useEffect(() => {
    loadOptions();
  }, [debouncedSearch, loadOptions]);

  return (
    <SelectInput
      loading={loading}
      // options={options}
      searchValue={searchValue}
      onSearch={setSearchValue}
      {...props}
    >
      {options.map((opt) => (
        <Option
          key={opt.value}
          title={opt.label}
          data-testid={`${props.id}-option`}
        >
          {opt.label}
        </Option>
      ))}
    </SelectInput>
  );
};
