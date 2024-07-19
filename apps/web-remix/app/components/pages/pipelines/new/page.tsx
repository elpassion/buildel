import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CreatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { BasicLink } from '~/components/link/BasicLink';
import {
  DefaultTemplateItem,
  WorkflowTemplatesList,
} from '~/components/pages/pipelines/list/WorkflowTemplates';
import type { loader } from '~/components/pages/pipelines/new/loader.server';
import { DialogDrawerFooter } from '~/components/ui/dialog-drawer';
import { routes } from '~/utils/routes.utils';

export function NewPipelinePage() {
  const { step } = useLoaderData<typeof loader>();

  return (
    <div className="px-4 pb-3 md:pb-0 md:px-0">
      {step === 'form' ? <NameFormStep /> : <TemplatesStep />}
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'New Pipeline',
    },
  ];
};

function NameFormStep() {
  const validator = useMemo(() => withZod(CreatePipelineSchema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2"
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

      <DialogDrawerFooter>
        <SubmitButton size="sm">Create workflow</SubmitButton>
      </DialogDrawerFooter>
    </ValidatedForm>
  );
}

function TemplatesStep() {
  const { templates, organizationId } = useLoaderData<typeof loader>();

  return (
    <>
      <BasicLink to={routes.pipelinesNew(organizationId) + '?step=form'}>
        <DefaultTemplateItem className="mb-4" />
      </BasicLink>

      <h4 className="text-muted-foreground mb-1 font-medium text-sm">
        Templates
      </h4>
      <WorkflowTemplatesList
        items={templates}
        action={`/${organizationId}/pipelines`}
      />
    </>
  );
}
