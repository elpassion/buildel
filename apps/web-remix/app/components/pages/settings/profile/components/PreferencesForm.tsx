import React, { useMemo } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import type { ICurrentUser } from '~/api/CurrentUserApi';
import { UpdateUserSchema } from '~/api/CurrentUserApi';
import { CheckboxInputField } from '~/components/form/fields/checkbox.field';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { SubmitButton } from '~/components/form/submit';

interface PreferencesFormProps {
  defaultValues?: Partial<ICurrentUser>;
}

export const PreferencesForm = ({ defaultValues }: PreferencesFormProps) => {
  const validator = useMemo(() => withZod(UpdateUserSchema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="put"
      noValidate
      defaultValues={{
        ...defaultValues,
        marketing_agreement: defaultValues?.marketing_agreement ?? false,
      }}
      className="w-full"
    >
      <div className="w-full">
        <Field name="marketing_agreement">
          <FieldLabel className="flex items-center gap-1">
            <CheckboxInputField />
            <span>Receive Marketing Communications</span>
          </FieldLabel>

          <FieldMessage>
            Subscribe to receive our newsletters with the latest updates. You
            can unsubscribe anytime.
          </FieldMessage>
        </Field>
      </div>

      <SubmitButton size="lg" className="mt-4 mx-auto">
        Save
      </SubmitButton>
    </ValidatedForm>
  );
};
