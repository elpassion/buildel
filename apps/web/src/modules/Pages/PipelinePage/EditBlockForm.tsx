'use client';

import { startCase } from 'lodash';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Button, Input, InputNumber } from '@elpassion/taco';
import { IDropdownOption, SelectDropdown } from '@elpassion/taco/Dropdown';
import {
  BlockConfig,
  useBlockTypes,
} from '~/modules/Pipelines/pipelines.hooks';
import { assert } from '~/utils/assert';
import { FieldProps, Schema } from './Schema';

export function EditBlockForm({
  onSubmit,
  blockConfig,
}: {
  onSubmit: (data: z.TypeOf<typeof BlockConfig>) => void;
  blockConfig: z.TypeOf<typeof BlockConfig>;
}) {
  const { data: blockTypes } = useBlockTypes();
  const methods = useForm<z.TypeOf<typeof BlockConfig>>({
    defaultValues: blockConfig,
  });
  const { handleSubmit, register, setValue, watch } = methods;
  const blockType = register('type');
  const blockTypeValue = watch('type');

  if (!blockTypes) return null;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <SelectDropdown
          id={blockType.name}
          name={blockType.name}
          ref={blockType.ref}
          defaultValue={{
            label: startCase(blockTypeValue),
            value: blockTypeValue,
            id: blockTypeValue,
          }}
          onSelect={(item) => {
            setValue(
              blockType.name,
              item ? (item as IDropdownOption).value : null!,
            );
          }}
          options={blockTypes.map((blockType) => ({
            id: blockType.type,
            label: startCase(blockType.type),
            value: blockType.type,
          }))}
          isMulti={false}
          isClearable
        />
        <div className="mt-6 space-y-4">
          {blockTypeValue && (
            <Schema
              schema={
                blockTypes.find(
                  (blockType) => blockType.type === blockTypeValue,
                )!.schema
              }
              name={null}
              fields={{
                string: StringField,
                number: NumberField,
              }}
            />
          )}
        </div>
        <Button
          text="Confirm"
          type="submit"
          variant="filled"
          className="mt-6"
        />
      </form>
    </FormProvider>
  );
}

function StringField({ field, name }: FieldProps) {
  const { register } = useFormContext();
  assert(field.type === 'string');
  return (
    <Input
      id={name!}
      {...register(name!)}
      label={field.title}
      supportingText={field.description}
    />
  );
}

function NumberField({ field, name }: FieldProps) {
  const { register, setValue } = useFormContext();
  const { onChange, ...methods } = register(name!);
  assert(field.type === 'number');
  return (
    <InputNumber
      id={name!}
      onChange={(value) => setValue(name!, value)}
      {...methods}
      label={field.title}
      supportingText={field.description}
    />
  );
}
