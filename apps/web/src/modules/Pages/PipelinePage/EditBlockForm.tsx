'use client';

import { useEffect } from 'react';
import { startCase } from 'lodash';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@elpassion/taco';
import { IDropdownOption, SelectDropdown } from '@elpassion/taco/Dropdown';
import { useBlockTypes } from '~/modules/Pipelines';
import { BlockConfig } from '~/modules/Pipelines/pipelines.types';
import { Schema } from './Schema';
import { ArrayField, NumberField, StringField } from './SchemaFormFields';

export function EditBlockForm({
  onSubmit,
  blockConfig,
}: {
  onSubmit: (data: z.TypeOf<typeof BlockConfig>) => void;
  blockConfig: z.TypeOf<typeof BlockConfig>;
}) {
  const methods = useForm<z.TypeOf<typeof BlockConfig>>({
    defaultValues: blockConfig,
  });
  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mt-6 space-y-4">
          <Schema
            schema={blockConfig.block_type.schema}
            name="opts"
            fields={{
              string: StringField,
              number: NumberField,
              array: ArrayField,
            }}
          />
        </div>
        <div className="mt-6 flex">
          <Button text="Confirm" type="submit" variant="filled" />
        </div>
      </form>
    </FormProvider>
  );
}
