import React, { useCallback, useEffect, useMemo } from 'react';
import { useFetcher } from '@remix-run/react';
import { Edit } from 'lucide-react';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { IconButton } from '~/components/iconButton';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import { successToast } from '~/components/toasts/successToast';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { useModal } from '~/hooks/useModal';
import { ValidatedForm, withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';

import { updatePipelineNameSchema } from '../schema';

interface EditPipelineNameFormProps {
  defaultValues: IPipeline;
}
export function EditPipelineNameForm({
  defaultValues,
}: EditPipelineNameFormProps) {
  const { isModalOpen, openModal, closeModal, changeOpen } = useModal();
  const validator = useMemo(() => withZod(updatePipelineNameSchema), []);

  const updateFetcher = useFetcher<IPipeline>();

  const handleOnSubmit = useCallback(
    (data: { name: string }) => {
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
        size="sm"
        variant="ghost"
        aria-label="Edit workflow name"
        onClick={openModal}
      />
      <DialogDrawer open={isModalOpen} onOpenChange={changeOpen}>
        <DialogDrawerContent>
          <DialogDrawerHeader>
            <DialogDrawerTitle>Edit name</DialogDrawerTitle>

            <DialogDrawerDescription>
              Edit <span className="font-bold">{defaultValues.name}</span>{' '}
              workflow.
            </DialogDrawerDescription>
          </DialogDrawerHeader>
          <DialogDrawerBody>
            <ValidatedForm
              method="put"
              noValidate
              validator={validator}
              handleSubmit={handleOnSubmit}
              defaultValues={{ name: defaultValues.name }}
            >
              <Field name="name">
                <FieldLabel>Pipeline name</FieldLabel>
                <TextInputField placeholder="Acme" />
                <FieldMessage>This will be visible only to you</FieldMessage>
              </Field>

              <DialogDrawerFooter>
                <SubmitButton
                  type="submit"
                  size="lg"
                  className="mt-4 ml-auto mr-0"
                >
                  Save
                </SubmitButton>
              </DialogDrawerFooter>
            </ValidatedForm>
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>
    </>
  );
}
