import React, { useCallback, useEffect, useMemo } from 'react';
import { useFetcher } from '@remix-run/react';
import { Modal } from '@elpassion/taco/Modal';
import { withZod } from '@remix-validated-form/with-zod';
import { Edit } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { IconButton } from '~/components/iconButton';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import { successToast } from '~/components/toasts/successToast';
import { useModal } from '~/hooks/useModal';
import { routes } from '~/utils/routes.utils';

import { updatePipelineNameSchema } from './schema';

interface EditPipelineNameFormProps {
  defaultValues: IPipeline;
}
export function EditPipelineNameForm({
  defaultValues,
}: EditPipelineNameFormProps) {
  const { isModalOpen, openModal, closeModal } = useModal();
  const validator = useMemo(() => withZod(updatePipelineNameSchema), []);

  const updateFetcher = useFetcher<IPipeline>();

  const handleOnSubmit = useCallback(
    (data: { name: string }, e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const pipeline = { ...defaultValues, name: data.name };

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
      closeModal();
      successToast({ description: 'Workflow name has been changed' });
    }
  }, [updateFetcher]);

  return (
    <>
      <IconButton
        icon={<Edit />}
        size="xxs"
        variant="ghost"
        aria-label="Edit workflow name"
        onClick={openModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        closeButtonProps={{ iconName: 'x', 'aria-label': 'Close' }}
        header={
          <header className="p-1 text-white mr-3">
            <p className="text-3xl mb-4">Edit name</p>

            <p className="text-sm text-neutral-400">
              Edit <span className="font-bold">{defaultValues.name}</span>{' '}
              workflow.
            </p>
          </header>
        }
      >
        <div className="p-1 w-[330px] md:w-[450px]">
          <ValidatedForm
            method="put"
            noValidate
            validator={validator}
            onSubmit={handleOnSubmit}
            defaultValues={{ name: defaultValues.name }}
          >
            <Field name="name">
              <FieldLabel>Pipeline name</FieldLabel>
              <TextInputField placeholder="Acme" />
              <FieldMessage>This will be visible only to you</FieldMessage>
            </Field>

            <SubmitButton type="submit" size="lg" className="mt-4 ml-auto mr-0">
              Save
            </SubmitButton>
          </ValidatedForm>
        </div>
      </Modal>
    </>
  );
}
