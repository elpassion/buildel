import type { ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useField } from '@rvf/remix';
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

export const AsyncSelectField = ({
  url,
  id,
  defaultValue,
  label,
  supportingText,
  errorMessage,
  ...props
}: AsyncSelectFieldProps & { ref?: React.RefObject<HTMLSelectElement> }) => {
  const isMounted = useIsMounted();
  const { name, getInputProps, validate } = useFieldContext({
    validationBehavior: {
      initial: 'onBlur',
      whenTouched: 'onBlur',
      whenSubmitted: 'onBlur',
    },
  });

  const { getControlProps, onChange } = useField<string | undefined>(name());

  const selectedId = getControlProps().value;

  const [apiError, setApiError] = useState<string | undefined>();

  useEffect(() => {
    if (defaultValue && !selectedId) {
      onChange(defaultValue);
    }
  }, [defaultValue, selectedId]);

  const fetcher = useCallback(
    async (_search: string, args?: RequestInit) => {
      return asyncSelectApi
        .getData(url, args)
        .catch((e) => {
          setApiError(e);
          validate();
          return [];
        })
        .then((opts) => opts.map(toSelectOption))
        .then((opts) => {
          const curr = opts.find((o) => o.value === selectedId);

          if (!curr && isMounted()) {
            onChange(undefined);
            validate();
          }
          if (opts.length > 0) setApiError(undefined);

          return opts;
        });
    },
    [url],
  );

  return (
    <>
      <HiddenField value={selectedId ?? ''} {...getInputProps()} />
      <FieldLabel>{label}</FieldLabel>
      <AsyncSelectInput
        id={id ?? name()}
        onBlur={getInputProps().onBlur}
        placeholder="Select..."
        fetchOptions={fetcher}
        onChange={onChange}
        value={selectedId}
        data-testid={id}
        getPopupContainer={(node) => node.parentNode}
        {...props}
      />
      <FieldMessage error={apiError || errorMessage}>
        {apiError || supportingText}
      </FieldMessage>
    </>
  );
};

AsyncSelectField.displayName = 'AsyncSelectField';

export function toSelectOption(item: IAsyncSelectItem) {
  return {
    id: item.id.toString(),
    value: item.id.toString(),
    label: item.name,
  };
}
