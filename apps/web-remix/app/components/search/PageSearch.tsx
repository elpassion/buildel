import React, { useRef } from 'react';
import { useSearchParams } from '@remix-run/react';
import debounce from 'lodash.debounce';

import type { SearchInputProps } from '~/components/form/inputs/search.input.tsx';
import { SearchInput } from '~/components/form/inputs/search.input.tsx';

export function PageSearch({
  defaultValue,
  ...rest
}: Partial<SearchInputProps>) {
  const ref = useRef<HTMLInputElement>(null);
  const [_, setSearchParams] = useSearchParams();

  const onSearchChange = debounce((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => {
      prev.set('search', e.target.value);

      return prev;
    });
  }, 500);

  const onSearchClear = () => {
    setSearchParams((prev) => {
      prev.set('search', '');

      return prev;
    });

    if (ref.current) {
      ref.current.value = '';
      ref.current.focus();
    }
  };

  return (
    <SearchInput
      ref={ref}
      onClear={onSearchClear}
      onChange={onSearchChange}
      autoFocus={!!defaultValue}
      defaultValue={defaultValue}
      {...rest}
    />
  );
}
