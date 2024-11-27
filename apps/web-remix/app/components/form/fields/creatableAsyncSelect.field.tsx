import type { FormEvent, PropsWithChildren, ReactNode } from 'react';
import React, { useCallback, useEffect, useState } from 'react';
import { ValidatedForm } from 'remix-validated-form';

import { asyncSelectApi } from '~/api/AsyncSelectApi';
import type { IAsyncSelectItem } from '~/api/AsyncSelectApi';
import { toSelectOption } from '~/components/form/fields/asyncSelect.field';
import {
  HiddenField,
  useFieldContext,
} from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { useControlField } from '~/components/form/fields/form.field';
import type {
  AsyncSelectInputFetchingState,
  AsyncSelectInputProps,
} from '~/components/form/inputs/select/select.input';
import { AsyncSelectInput } from '~/components/form/inputs/select/select.input';
import type { FieldProps } from '~/components/form/schema/Schema';
import { Schema } from '~/components/form/schema/Schema';
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from '~/components/form/schema/SchemaFields';
import { generateZODSchema } from '~/components/form/schema/SchemaParser';
import type { JSONSchemaField } from '~/components/form/schema/SchemaParser';
import { successToast } from '~/components/toasts/successToast';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { useModal } from '~/hooks/useModal';
import { withZod } from '~/utils/form';

import { SubmitButton } from '../submit';

export interface CreatableAsyncSelectFieldProps
  extends Partial<AsyncSelectInputProps> {
  url: string;
  id: string;
  label?: ReactNode;
  supportingText?: ReactNode;
  errorMessage?: ReactNode;
  schema: JSONSchemaField;
  renderForm: ({
    onCreate,
  }: {
    onCreate: (
      data: Record<string, any>,
      e: FormEvent<HTMLFormElement>,
    ) => void;
  }) => ReactNode;
}

export const CreatableAsyncSelectField = ({
  label,
  supportingText,
  url,
  errorMessage,
  defaultValue,
  renderForm,
  ...props
}: CreatableAsyncSelectFieldProps & {
  ref?: React.RefObject<HTMLSelectElement>;
}) => {
  const { name, getInputProps, validate } = useFieldContext({
    validationBehavior: {
      initial: 'onBlur',
      whenTouched: 'onBlur',
      whenSubmitted: 'onBlur',
    },
  });
  const { isModalOpen, openModal, closeModal, changeOpen } = useModal();

  const [state, setState] = useState<AsyncSelectInputFetchingState>('loading');
  const [options, setOptions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [selectedId, setSelectedId] = useControlField<string | undefined>(name);

  useEffect(() => {
    if (state === 'loading') return;
    const doesSelectedIdExist = options.some((opt) => opt.value === selectedId);

    if (!doesSelectedIdExist) {
      setSelectedId(undefined);
      validate();
    }
  }, [options, selectedId, state]);

  useEffect(() => {
    if (
      defaultValue &&
      options.some((opt) => opt.value === defaultValue) &&
      !selectedId
    ) {
      setSelectedId(defaultValue);
      validate();
    }
  }, [defaultValue, options, selectedId]);

  const onOptionsFetch = (options: { value: string; label: string }[]) => {
    setOptions(options);
  };

  const onOptionsFetchStateChange = (state: AsyncSelectInputFetchingState) => {
    setState(state);
  };

  const onChange = (id: string) => {
    setSelectedId(id);
    validate();
  };

  const handleCreate = async (
    data: Record<string, any>,
    e: FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    try {
      const newItem = await asyncSelectApi.createData(
        url,
        data as IAsyncSelectItem,
      );

      onChange(newItem.id.toString());
      successToast({ title: 'Success', description: 'Item created!' });
      closeModal();
    } catch (e) {
      console.error(e);
    }
  };

  const fetcher = useCallback(
    async (_search: string, args?: RequestInit) => {
      return asyncSelectApi.getData(url, args).then((opts) => {
        return opts.map(toSelectOption);
      });
    },
    [url, isModalOpen],
  );

  return (
    <>
      <HiddenField value={selectedId ?? ''} {...getInputProps()} />

      <div className="flex justify-between items-end">
        <FieldLabel>{label}</FieldLabel>

        <button
          disabled={props.disabled}
          className="text-foreground text-sm mb-[6px] bg-transparent disabled:text-muted-foreground"
          onClick={openModal}
          type="button"
          data-testid={`${props.id}-create-button`}
        >
          Add new
        </button>
      </div>

      <AsyncSelectInput
        placeholder="Select..."
        onOptionsFetch={onOptionsFetch}
        onOptionsFetchStateChange={onOptionsFetchStateChange}
        fetchOptions={fetcher}
        defaultValue={defaultValue}
        onChange={onChange}
        value={selectedId}
        onBlur={getInputProps().onBlur}
        {...props}
      />
      <FieldMessage error={errorMessage}>{supportingText}</FieldMessage>

      <DialogDrawer open={isModalOpen} onOpenChange={changeOpen}>
        <DialogDrawerContent data-testid={`${name}-modal`}>
          <DialogDrawerHeader>
            <DialogDrawerTitle>{label}</DialogDrawerTitle>

            <DialogDrawerDescription>{supportingText}</DialogDrawerDescription>
          </DialogDrawerHeader>
          <DialogDrawerBody
            onSubmit={(e) => {
              e.stopPropagation();
            }}
            onChange={(e) => {
              e.stopPropagation();
            }}
          >
            {renderForm({ onCreate: handleCreate })}
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>
    </>
  );
};

interface CreatableAsyncFormProps {
  onCreate: (data: Record<string, any>, e: FormEvent<HTMLFormElement>) => void;
  schema: JSONSchemaField;
  asyncSelect: React.FC<FieldProps>;
  asyncCreatableSelect: React.FC<FieldProps>;
}

export function CreatableAsyncForm({
  onCreate,
  schema: JSONSchema,
  asyncCreatableSelect,
  asyncSelect,
  children,
}: PropsWithChildren<CreatableAsyncFormProps>) {
  const schema = generateZODSchema(JSONSchema as any);
  const validator = React.useMemo(() => withZod(schema), []);
  const [_latestValues, setLatestValues] = useState<Record<string, any>>({});

  useEffect(() => {
    setLatestValues({});
  }, []);

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      className="w-full grow flex flex-col space-y-4"
      onSubmit={onCreate}
      onChange={(e: any) => {
        setLatestValues((prev) => ({ ...prev, [e.target.id]: e.target.value }));
      }}
      noValidate
    >
      {children}

      <Schema
        schema={JSONSchema}
        name={null}
        fields={{
          section: () => <></>,
          editor: () => <></>,
          string: StringField,
          number: NumberField,
          array: ArrayField,
          boolean: BooleanField,
          asyncSelect,
          asyncCreatableSelect,
        }}
      />

      <SubmitButton isFluid size="sm" className="mt-6" aria-label="create new">
        Create new
      </SubmitButton>
    </ValidatedForm>
  );
}

CreatableAsyncSelectField.displayName = 'CreatableAsyncSelectField';
