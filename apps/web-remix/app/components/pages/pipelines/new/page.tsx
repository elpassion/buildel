import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Button } from '@elpassion/taco';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CreatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { Field, HiddenField } from '~/components/form/fields/field.context';
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
          <TextInputField
            type="text"
            autoFocus
            placeholder="eg. Text To Speech"
            supportingText="It will help you identify the workflow in BUILDEL"
            label="Name"
            aria-label="Name"
          />
        </Field>

        <HiddenField name="pipeline.config.version" value="1" />

        <HiddenField name="pipeline.config.connections" value="[]" />

        <HiddenField name="pipeline.config.blocks" value={'[]'} />
      </div>
      <SubmitButton size="sm" hierarchy="primary">
        Create workflow
      </SubmitButton>
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
