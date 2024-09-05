import React, { useMemo } from 'react';
import { useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { UpdateSecretSchema } from '~/api/secrets/secrets.contracts';
import { AsyncSelectField } from '~/components/form/fields/asyncSelect.field';
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
import { loader } from './loader.server';

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
  const { organizationId } = useLoaderData<typeof loader>();
  const validator = useMemo(() => withZod(UpdateSecretSchema), []);

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
            defaultValues={{
              ...initialData,
              alias: initialData.alias ?? undefined,
            }}
            onSubmit={() => {
              onClose();
            }}
          >
            <div className="py-1 gap-4 flex flex-col">
              <Field name="name">
                <TextInputField type="hidden" />
              </Field>

              <div>
                <Field name="value">
                  <FieldLabel>Enter Secret</FieldLabel>
                  <PasswordInputField
                    autoFocus
                    placeholder={
                      initialData.hidden_value ||
                      `Type or paste in your secret key`
                    }
                  />
                  <FieldMessage>
                    The actual token key that will authorise you in the external
                    system, such as Open AI.
                  </FieldMessage>
                </Field>
              </div>

              <div>
                <Field name="alias">
                  <AsyncSelectField
                    url={`/api/organizations/${organizationId}/secrets/aliases`}
                    label="Default for:"
                    id="alias"
                    supportingText="The default provider for this secret"
                    defaultValue={initialData.alias}
                    allowClear
                    getPopupContainer={(triggerNode) =>
                      triggerNode.parentNode.parentNode
                    }
                  />
                </Field>
              </div>
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
