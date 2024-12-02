import React from 'react';

import { HiddenField } from '~/components/form/fields/field.context';
import { Schema } from '~/components/form/schema/Schema';
import { StringField } from '~/components/form/schema/SchemaFields';
import { generateZODSchema } from '~/components/form/schema/SchemaParser';
import { SubmitButton } from '~/components/form/submit';
import type { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';
import { ValidatedForm, withZod } from '~/utils/form';

interface VideoNodeBodyProps {
  data: IBlockConfig;
  disabled?: boolean;
  onSubmit?: (data: Record<string, any>) => void;
}

export const VideoNodeBody = ({
  data,
  disabled,
  onSubmit,
}: VideoNodeBodyProps) => {
  const schema = generateZODSchema(data.block_type?.schema as any);
  const validator = React.useMemo(() => withZod(schema), []);
  const handleSubmit = (data: Record<string, any>) => {
    onSubmit?.(data.opts);
  };

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      handleSubmit={handleSubmit}
      className="min-w-[300px]"
      noValidate
    >
      <HiddenField name="name" value={data.name} />

      <Schema
        disabled={disabled}
        schema={data.block_type?.schema.properties.opts}
        name="opts"
        size="sm"
        fields={{
          string: StringField,
          number: () => null,
          array: () => null,
          boolean: () => null,
          editor: () => null,
          asyncSelect: () => null,
          asyncCreatableSelect: () => null,
          section: () => null,
        }}
      />

      <SubmitButton size="xs" isFluid className="mt-2" disabled={disabled}>
        Save
      </SubmitButton>
    </ValidatedForm>
  );
};
