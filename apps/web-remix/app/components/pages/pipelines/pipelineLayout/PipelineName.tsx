import React, { useCallback, useMemo } from 'react';
import { useFetcher } from '@remix-run/react';
import { ValidatedForm } from 'remix-validated-form';
import { useBoolean } from 'usehooks-ts';

import { Field, useFieldContext } from '~/components/form/fields/field.context';
import { TextInputField } from '~/components/form/fields/text.field';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import { cn } from '~/utils/cn';
import { withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';

import { updatePipelineNameSchema } from '../schema';

interface PipelineNameProps {
  pipeline: IPipeline;
}

export const PipelineName = ({ pipeline }: PipelineNameProps) => {
  const {
    value: isEditing,
    setTrue: edit,
    setFalse: closeEditing,
  } = useBoolean(false);
  const updateFetcher = useFetcher<IPipeline>();

  const submit = useCallback(
    (data: { name: string }, e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const updated = { ...pipeline, name: data.name };

      updateFetcher.submit(updated, {
        method: 'PUT',
        encType: 'application/json',
        action:
          routes.pipelineBuild(pipeline.organization_id, pipeline.id) +
          '?index',
      });

      closeEditing();
    },
    [pipeline],
  );

  if (isEditing) {
    return (
      <PipelineNameForm
        defaultValues={pipeline}
        onBlur={submit}
        onSubmit={submit}
      />
    );
  }

  return (
    <p
      className="text-foreground cursor-pointer max-w-[250px] line-clamp-1 text-sm"
      onClick={edit}
    >
      {pipeline.name}
    </p>
  );
};

interface PipelineNameFormProps {
  defaultValues: IPipeline;
  onBlur?: (
    data: { name: string },
    e: React.FocusEvent<HTMLFormElement>,
  ) => void;
  onSubmit: (
    data: { name: string },
    e: React.FormEvent<HTMLFormElement>,
  ) => void;
}

function PipelineNameForm({
  defaultValues,
  onBlur,
  onSubmit,
}: PipelineNameFormProps) {
  const validator = useMemo(() => withZod(updatePipelineNameSchema), []);

  const blur = async (e: React.FocusEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);

    const result = await validator.validate(formData);

    if (result.error) return onBlur?.({ name: defaultValues.name }, e);

    onBlur?.(result.data, e);
  };

  return (
    <ValidatedForm
      noValidate
      method="PUT"
      onBlur={blur}
      validator={validator}
      onSubmit={onSubmit}
      defaultValues={defaultValues}
    >
      <Field name="name">
        <NameTextField />
      </Field>
    </ValidatedForm>
  );
}

function NameTextField() {
  const { error } = useFieldContext({
    validationBehavior: {
      initial: 'onBlur',
      whenSubmitted: 'onBlur',
      whenTouched: 'onBlur',
    },
  });

  return (
    <TextInputField
      autoFocus
      placeholder="Type a name"
      className={cn('w-[250px] text-sm h-8', { '!border-red-500': !!error })}
      validationBehavior={{
        initial: 'onBlur',
        whenSubmitted: 'onBlur',
        whenTouched: 'onBlur',
      }}
    />
  );
}
