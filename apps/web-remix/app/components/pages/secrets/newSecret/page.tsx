import React, { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';
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
import { DialogDrawerFooter } from '~/components/ui/dialog-drawer';

export function NewSecret() {
  const validator = useMemo(() => withZod(CreateUpdateSecretSchema), []);

  return (
    <ValidatedForm
      noValidate
      validator={validator}
      method="post"
      className="grow flex flex-col gap-2"
    >
      <div className="p-1 w-full space-y-6 grow overflow-y-auto">
        <div>
          <Field name="name">
            <FieldLabel>Name your Secret</FieldLabel>
            <TextInputField
              autoFocus
              placeholder="e.g. my open ai key"
              type="text"
            />
            <FieldMessage>
              It will help you identify the key in BUILDEL
            </FieldMessage>
          </Field>
        </div>

        <div>
          <Field name="value">
            <FieldLabel>Enter the Secret key</FieldLabel>
            <PasswordInputField placeholder="Type or paste in your token key" />
            <FieldMessage>
              The actual token key that will authorise you in the external
              system, such as Open AI.
            </FieldMessage>
          </Field>
        </div>
      </div>

      <DialogDrawerFooter>
        <SubmitButton size="sm">Save the Secret</SubmitButton>
      </DialogDrawerFooter>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'New Secret',
    },
  ];
};
