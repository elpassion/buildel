import { useMemo } from 'react';
import type { MetaFunction } from '@remix-run/node';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { ValidatedForm, withZod } from '~/utils/form';
import { metaWithDefaults } from '~/utils/metadata';

import { changePasswordSchema } from './schema';

export function ChangePasswordPage() {
  const validator = useMemo(() => withZod(changePasswordSchema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2 h-[70%]"
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1 flex flex-col gap-4">
        <div>
          <Field name="current_password">
            <FieldLabel>Current password</FieldLabel>
            <TextInputField type="password" autoFocus />
            <FieldMessage />
          </Field>
        </div>
        <div>
          <Field name="password">
            <FieldLabel>New password</FieldLabel>
            <TextInputField type="password" />
            <FieldMessage />
          </Field>
        </div>
        <div>
          <Field name="password_confirmation">
            <FieldLabel>Confirm password</FieldLabel>
            <TextInputField type="password" />
            <FieldMessage />
          </Field>
        </div>
      </div>

      <p className="text-red-500 text-sm">
        This operation will log out all your currently logged in devices with
        this one included.
      </p>

      <SubmitButton size="sm">Change password</SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Change password',
    },
  ];
});
