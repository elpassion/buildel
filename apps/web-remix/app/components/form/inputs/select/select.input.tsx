import React, { useCallback, useEffect, useState } from "react";
import Select, { SelectProps } from "rc-select";
import { Icon } from "@elpassion/taco";
import { useDebounce } from "usehooks-ts";

export type SelectInputProps = SelectProps;

export const SelectInput: React.FC<SelectInputProps> = ({ ...props }) => {
  return <Select showSearch clearIcon={<Icon iconName="x" />} {...props} />;
};

export interface AsyncSelectInputProps<T = {}>
  extends Omit<
    SelectInputProps,
    "options" | "loading" | "onSearch" | "searchValue"
  > {
  fetchOptions: (
    search: string
  ) => Promise<({ value: string; label: string } & T)[]>;
}

export const AsyncSelectInput = <T = {},>({
  fetchOptions,
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
      .then((options) => setOptions(options))
      .finally(() => setLoading(false));
  }, [fetchOptions, debouncedSearch]);

  useEffect(() => {
    loadOptions();
  }, [debouncedSearch, loadOptions]);

  return (
    <SelectInput
      loading={loading}
      options={options}
      searchValue={searchValue}
      onSearch={setSearchValue}
      {...props}
    />
  );
};
