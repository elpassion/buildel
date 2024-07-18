import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CreatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';

export function NewPipelinePage() {
  const validator = useMemo(() => withZod(CreatePipelineSchema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2 h-[70%]"
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1">
        <Field name="pipeline.name">
          <FieldLabel>Name</FieldLabel>
          <TextInputField
            type="text"
            autoFocus
            placeholder="eg. Text To Speech"
            aria-label="Name"
          />
          <FieldMessage>
            It will help you identify the workflow in BUILDEL
          </FieldMessage>
        </Field>

        <HiddenField name="pipeline.config.version" value="1" />

        <HiddenField name="pipeline.config.connections" value="[]" />

        <HiddenField name="pipeline.config.blocks" value={'[]'} />
      </div>
      <SubmitButton size="sm">Create workflow</SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'New Pipeline',
    },
  ];
};
