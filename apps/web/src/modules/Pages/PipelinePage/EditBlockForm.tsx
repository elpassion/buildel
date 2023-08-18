'use client';

import { startCase } from 'lodash';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Button, Checkbox, Input, InputNumber } from '@elpassion/taco';
import { IDropdownOption, SelectDropdown } from '@elpassion/taco/Dropdown';
import {
  BlockConfig,
  useBlockTypes,
} from '~/modules/Pipelines/pipelines.hooks';
import { assert } from '~/utils/assert';
import { FieldProps, Schema } from './Schema';
import { useEffect } from 'react';
import { NumberField, StringField } from './SchemaFormFields';

export function EditBlockForm({
  onSubmit,
  onDelete,
  blockConfig,
}: {
  onSubmit: (data: z.TypeOf<typeof BlockConfig>) => void;
  onDelete: (data: z.TypeOf<typeof BlockConfig>) => void;
  blockConfig: z.TypeOf<typeof BlockConfig>;
}) {
  const { data: blockTypes } = useBlockTypes();
  const methods = useForm<z.TypeOf<typeof BlockConfig>>({
    defaultValues: blockConfig,
  });
  const { handleSubmit, register, setValue, watch } = methods;
  const blockTypeField = register('type');
  const blockTypeValue = watch('type');
  const blockNameValue = watch('name');
  useEffect(() => {
    methods.reset({
      name: blockNameValue,
      type: blockTypeValue,
      opts: blockConfig.opts,
      forward_outputs: blockConfig.forward_outputs,
    });
  }, [blockTypeValue]);

  if (!blockTypes) return null;

  const blockType = blockTypes.find(
    (blockType) => blockType.type === blockTypeValue,
  );

  const forwardOutputsField = register('forward_outputs');

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <SelectDropdown
          id={blockTypeField.name}
          name={blockTypeField.name}
          ref={blockTypeField.ref}
          defaultValue={{
            label: startCase(blockTypeValue),
            value: blockTypeValue,
            id: blockTypeValue,
          }}
          onSelect={(item) => {
            setValue(
              blockTypeField.name,
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
          {blockType && (
            <>
              <Schema
                schema={blockType.schema}
                name={null}
                fields={{
                  string: StringField,
                  number: NumberField,
                }}
              />
              <div className="mt-6">
                Forwarded Outputs
                <div>
                  {blockType.outputs.map((output, index) => {
                    return (
                      <Checkbox
                        key={output.name}
                        labelText={output.name}
                        id={`${output.name}.${index}`}
                        value={output.name}
                        {...forwardOutputsField}
                      />
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-6 flex">
          <Button text="Confirm" type="submit" variant="filled" />
          <Button
            onClick={() => onDelete(blockConfig)}
            text="Delete"
            type="button"
            variant="filled"
            hierarchy="destructive"
            className="ml-auto"
          />
        </div>
      </form>
    </FormProvider>
  );
}
