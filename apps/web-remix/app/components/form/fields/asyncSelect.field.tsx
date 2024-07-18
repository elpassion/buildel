import type { ReactNode } from 'react';
import React, { forwardRef, useCallback } from 'react';
import { useControlField } from 'remix-validated-form';
import { useIsMounted } from 'usehooks-ts';

import type { IAsyncSelectItem } from '~/api/AsyncSelectApi';
import { asyncSelectApi } from '~/api/AsyncSelectApi';
import {
  HiddenField,
  useFieldContext,
} from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import type { AsyncSelectInputProps } from '~/components/form/inputs/select/select.input';
import { AsyncSelectInput } from '~/components/form/inputs/select/select.input';

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
    _ref,
  ) => {
    const isMounted = useIsMounted();
    const { name, getInputProps } = useFieldContext({
      validationBehavior: {
        initial: 'onBlur',
        whenTouched: 'onBlur',
        whenSubmitted: 'onBlur',
      },
    });
    const [selectedId, setSelectedId] = useControlField<string | undefined>(
      name,
    );

    const fetcher = useCallback(async () => {
      return asyncSelectApi
        .getData(url)
        .then((opts) => opts.map(toSelectOption))
        .then((opts) => {
          const curr = opts.find((o) => o.value === selectedId);
          if (!curr && isMounted()) setSelectedId(undefined);

          return opts;
        });
    }, [url, selectedId]);

    return (
      <>
        <HiddenField value={selectedId ?? ''} {...getInputProps()} />
        <FieldLabel>{label}</FieldLabel>
        <AsyncSelectInput
          onBlur={getInputProps().onBlur}
          placeholder="Select..."
          fetchOptions={fetcher}
          defaultValue={defaultValue}
          onChange={setSelectedId}
          value={selectedId}
          data-testid={props.id}
          {...props}
        />
        <FieldMessage error={errorMessage}>{supportingText}</FieldMessage>
      </>
    );
  },
);

AsyncSelectField.displayName = 'AsyncSelectField';

export function toSelectOption(item: IAsyncSelectItem) {
  return {
    id: item.id.toString(),
    value: item.id.toString(),
    label: item.name,
  };
}
