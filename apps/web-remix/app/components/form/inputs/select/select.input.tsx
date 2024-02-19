import { Option } from "rc-select";
import "rc-select/assets/index.css";
import React, { Suspense, lazy, useCallback, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";
import { SelectInputProps } from "./select.input-impl";

const AsyncSelectInputComponent = lazy(() => import("./select.input-impl"));

export const SelectInput: React.FC<SelectInputProps> = ({ ...props }) => {
  return (
    <Suspense
      fallback={
        <div className="w-full h-[44px] rounded-lg border-[1.5px] border-neutral-200 bg-neutral-800" />
      }
    >
      <AsyncSelectInputComponent {...props} />
    </Suspense>
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
      .finally(() => setLoading(false));
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
        <Option key={opt.value} title={opt.label}>
          {opt.label}
        </Option>
      ))}
    </SelectInput>
  );
};
