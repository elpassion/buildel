import React, { useMemo } from 'react';
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
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';

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
    <DialogDrawer
      open={isOpen}
      onOpenChange={(value) => {
        if (value) return;
        onClose();
      }}
    >
      <DialogDrawerContent>
        <DialogDrawerHeader>
          <DialogDrawerTitle>Edit Secret</DialogDrawerTitle>
          <DialogDrawerDescription>
            Edit your <span className="font-bold">{initialData.name}</span>{' '}
            secret.
          </DialogDrawerDescription>
        </DialogDrawerHeader>
        <DialogDrawerBody>
          <ValidatedForm
            noValidate
            method="put"
            validator={validator}
            defaultValues={initialData}
            onSubmit={() => {
              onClose();
            }}
          >
            <div className="py-1">
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
            </div>

            <DialogDrawerFooter>
              <SubmitButton size="sm" className="mt-6 ml-auto mr-0">
                Update Secret
              </SubmitButton>
            </DialogDrawerFooter>
          </ValidatedForm>
        </DialogDrawerBody>
      </DialogDrawerContent>
    </DialogDrawer>
  );
};
