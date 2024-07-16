import React, { useCallback, useEffect, useMemo } from 'react';
import { useFetcher } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { Field } from '~/components/form/fields/field.context';
import { SubmitButton } from '~/components/form/submit';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import { successToast } from '~/components/toasts/successToast';
import { routes } from '~/utils/routes.utils';

import { BudgetLimitField } from './BudgetLimitField';
import { LogsToggleField } from './LogsToggleField';
import { updatePipelineSettingsSchema } from './schema';
import type { UpdatePipelineSettingsSchema } from './schema';

interface EditPipelineSettingsFormProps {
  defaultValues: IPipeline;
}
export function EditPipelineSettingsForm({
  defaultValues,
}: EditPipelineSettingsFormProps) {
  const validator = useMemo(() => withZod(updatePipelineSettingsSchema), []);

  const updateFetcher = useFetcher<IPipeline>();
  const handleOnSubmit = useCallback(
    (
      data: UpdatePipelineSettingsSchema,
      e: React.FormEvent<HTMLFormElement>,
    ) => {
      e.preventDefault();

      const pipeline = {
        ...defaultValues,
        budget_limit: data.budget_limit ?? null,
        logs_enabled: data.logs_enabled,
      };

      updateFetcher.submit(pipeline, {
        method: 'PUT',
        encType: 'application/json',
        action:
          routes.pipelineBuild(pipeline.organization_id, pipeline.id) +
          '?index',
      });
    },
    [defaultValues],
  );

  useEffect(() => {
    if (updateFetcher.data) {
      successToast({ description: 'Workflow settings have been changed' });
    }
  }, [updateFetcher.data]);

  return (
    <ValidatedForm
      method="put"
      noValidate
      validator={validator}
      onSubmit={handleOnSubmit}
      defaultValues={{
        budget_limit: defaultValues.budget_limit,
        logs_enabled: defaultValues.logs_enabled,
      }}
    >
      <div className="flex flex-col gap-4">
        <Field name="budget_limit">
          <BudgetLimitField
            label="Limit"
            supportingText="The limit setting in a pipeline refers to a financial limit ($) imposed on the operations within the pipeline."
          />
        </Field>

        <Field name="logs_enabled">
          <LogsToggleField
            label="Enable logging"
            supportingText="Control whether the application records pipelines logs."
          />
        </Field>
      </div>

      <SubmitButton type="submit" size="sm" className="mt-4 ml-auto mr-0">
        Save
      </SubmitButton>
    </ValidatedForm>
  );
}
