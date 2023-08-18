import { Button, Input, InputNumber } from '@elpassion/taco';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { BlockConfig, useBlockTypes } from '~/modules/Pipelines/hooks';
import { startCase } from 'lodash';
import { IDropdownOption, SelectDropdown } from '@elpassion/taco/Dropdown';
import { FieldProps, Schema } from './Schema';
import { assert } from '~/utils/assert';

export function AddBlockForm({
  onSubmit,
}: {
  onSubmit: (data: z.TypeOf<typeof BlockConfig>) => void;
}) {
  const { data: blockTypes } = useBlockTypes();
  const methods = useForm<z.TypeOf<typeof BlockConfig>>({
    defaultValues: {
      name: '',
      forward_outputs: [],
      opts: {},
    },
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
