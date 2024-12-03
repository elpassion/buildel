import React, { useCallback, useEffect, useRef, useState } from 'react';
import debounce from 'lodash.debounce';
import { Option } from 'rc-select';
import { ClientOnly } from 'remix-utils/client-only';
import { useDebounce, useIsMounted } from 'usehooks-ts';

import AsyncSelectInputComponent from './select.input-impl.client';
import type { SelectInputProps } from './select.input-impl.client';

export const SelectInput: React.FC<SelectInputProps> = ({ ...props }) => {
  return (
    <ClientOnly
      fallback={
        <div className="w-full h-[40px] rounded-lg border-[1.5px] border-input bg-white" />
      }
    >
      {() => <AsyncSelectInputComponent {...props} />}
    </ClientOnly>
  );
};

export type AsyncSelectInputFetchingState = 'idle' | 'loading';

export interface AsyncSelectInputProps<T = {}>
  extends Omit<
    SelectInputProps,
    'options' | 'loading' | 'onSearch' | 'searchValue'
  > {
  fetchOptions: (
    search: string,
    args?: RequestInit,
  ) => Promise<({ value: string; label: string } & T)[]>;
  onOptionsFetch?: (options: ({ value: string; label: string } & T)[]) => void;
  onOptionsFetchStateChange?: (state: AsyncSelectInputFetchingState) => void;
}

export const AsyncSelectInput = <T = {},>({
  fetchOptions,
  onOptionsFetch,
  onOptionsFetchStateChange,
  ...props
}: AsyncSelectInputProps<T>) => {
  const isMounted = useIsMounted();
  const abortController = useRef<AbortController | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 500);
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [],
  );

  const loadOptions = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    setLoading(true);
    fetchOptions(debouncedSearch, { signal: abortController.current.signal })
      .then((options) => {
        setOptions(options);
        onOptionsFetch?.(options);
      })
      .finally(() => {
        if (isMounted()) setLoading(false);

        abortController.current = null;
      });
  }, [fetchOptions]);

  const debouncedLoadOptions = debounce(() => {
    loadOptions();
  }, 200);

  useEffect(() => {
    debouncedLoadOptions();

    return () => {
      debouncedLoadOptions.cancel();
    };

    // do not refresh options when searchValue changes for now. API is not ready for it yet. Search value is used for client side filtering only.
  }, [loadOptions]);

  useEffect(() => {
    onOptionsFetchStateChange?.(loading ? 'loading' : 'idle');
  }, [loading]);

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
