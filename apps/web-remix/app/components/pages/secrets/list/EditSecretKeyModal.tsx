import React, { useMemo } from 'react';
import { Modal } from '@elpassion/taco/Modal';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CreateUpdateSecretSchema } from '~/api/secrets/secrets.contracts';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import {
  PasswordInputField,
  TextInputField,
} from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';

import type { ISecretKey } from '../variables.types';

interface EditSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ISecretKey;
}

export const EditSecretKeyModal: React.FC<EditSecretModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const validator = useMemo(() => withZod(CreateUpdateSecretSchema), []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeButtonProps={{ iconName: 'x', 'aria-label': 'Close' }}
      header={
        <header className="p-1 text-white">
          <p className="text-3xl mb-4">Edit Secret</p>

          <p className="text-sm text-neutral-400">
            Edit your <span className="font-bold">{initialData.name}</span>{' '}
            secret.
          </p>
        </header>
      }
    >
      <div className="p-1 w-[330px] md:w-[450px] ">
        <ValidatedForm
          noValidate
          method="put"
          validator={validator}
          defaultValues={initialData}
          onSubmit={() => {
            onClose();
          }}
        >
          <Field name="name">
            <TextInputField type="hidden" />
          </Field>

          <Field name="value">
            <FieldLabel>Enter Secret</FieldLabel>
            <PasswordInputField
              autoFocus
              placeholder="Type or paste in your secret key"
            />
            <FieldMessage>
              The actual token key that will authorise you in the external
              system, such as Open AI.
            </FieldMessage>
          </Field>

          <SubmitButton size="sm" className="mt-6 ml-auto mr-0">
            Update Secret
          </SubmitButton>
        </ValidatedForm>
      </div>
    </Modal>
  );
};
