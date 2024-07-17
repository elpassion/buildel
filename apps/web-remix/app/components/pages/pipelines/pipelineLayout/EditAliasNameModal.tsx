import React, { useMemo } from 'react';
import { Modal } from '@elpassion/taco/Modal';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { UpdateAliasSchema } from '~/api/pipeline/pipeline.contracts';
import { Field, HiddenField } from '~/components/form/fields/field.context';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import type { IPipelineAlias } from '~/components/pages/pipelines/pipeline.types';

interface EditAliasNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: IPipelineAlias;
}

export const EditAliasNameModal: React.FC<EditAliasNameModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const validator = useMemo(() => withZod(UpdateAliasSchema), []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeButtonProps={{ iconName: 'x', 'aria-label': 'Close' }}
      header={
        <header className="p-1 text-white">
          <p className="text-3xl mb-2">Edit Alias</p>

          <p className="text-sm text-neutral-400">
            Edit your <span className="font-bold">{initialData.name}</span>{' '}
            alias.
          </p>
        </header>
      }
    >
      <div className="p-1 w-[330px] md:w-[450px] ">
        <ValidatedForm
          noValidate
          method="PATCH"
          validator={validator}
          defaultValues={initialData}
          onSubmit={onClose}
        >
          <HiddenField name="id" value={initialData.id} />

          <Field name="name">
            <TextInputField label="Name" data-testid="alias-name" />
          </Field>

          <SubmitButton size="sm" className="mt-6 ml-auto mr-0">
            Save
          </SubmitButton>
        </ValidatedForm>
      </div>
    </Modal>
  );
};
