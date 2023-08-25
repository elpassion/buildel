'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@elpassion/taco';
import { generateZODSchema } from '~/modules/Pages/PipelinePage/SchemaParser';
import { BlockConfig, IBlockConfig } from '~/modules/Pipelines/pipelines.types';
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
    resolver: zodResolver(
      generateZODSchema(JSON.parse(blockConfig.block_type.schema)),
    ),
    defaultValues: blockConfig,
  });
  const { handleSubmit } = methods;

  const handleUpdate = (data: IBlockConfig) => {
    onSubmit({ ...blockConfig, ...data });
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleUpdate)}>
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
