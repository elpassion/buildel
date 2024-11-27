import * as React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ValidatedForm } from 'remix-validated-form';

import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { withZod } from '~/utils/form';
import { metaWithDefaults } from '~/utils/metadata';

import type { loader } from './loader.server';
import { schema } from './schema';

export function SetPasswordPage() {
  const validator = React.useMemo(() => withZod(schema), []);
  const { token } = useLoaderData<typeof loader>();

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold">Set new password </h1>
      <p className="text-center text-muted-foreground">
        Go back to
        <Link
          to={{
            pathname: '/login',
          }}
          className="text-foreground"
        >
          Sign In
        </Link>
      </p>

      <ValidatedForm
        validator={validator}
        method="post"
        noValidate
        className="w-full max-w-md mt-10"
      >
        <Field name="global">
          <FieldMessage />
        </Field>
        <div className="form-control w-full mb-4">
          <Field name="password">
            <FieldLabel>New password</FieldLabel>
            <TextInputField
              type="password"
              autoFocus
              data-testid="new-password"
            />
            <FieldMessage />
          </Field>
          <Field name="password_confirmation">
            <FieldLabel>Confirm new password</FieldLabel>
            <TextInputField
              type="password"
              data-testid="new-password-confirmation"
              autoFocus
            />
            <FieldMessage />
          </Field>
          <HiddenField name="token" value={token} />
        </div>
        <SubmitButton isFluid>Reset password</SubmitButton>
      </ValidatedForm>
    </div>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Reset Password',
    },
  ];
});
