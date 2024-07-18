import * as React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Link } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';

import { schema } from './schema';

export function ResetPasswordPage() {
  const validator = React.useMemo(() => withZod(schema), []);

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold text-neutral-100">
        Reset password
      </h1>
      <p className="text-center text-neutral-100">
        Go back to{' '}
        <Link
          to={{
            pathname: '/login',
          }}
          className="text-primary-500"
        >
          Sign In
        </Link>
      </p>

      <ValidatedForm
        validator={validator}
        method="post"
        noValidate
        className="w-full max-w-md"
      >
        <Field name="global">
          <FieldMessage />
        </Field>
        <div className="form-control w-full mb-4">
          <Field name="email">
            <FieldLabel>Email address</FieldLabel>
            <TextInputField aria-label="email" type="email" autoFocus />
            <FieldMessage />
          </Field>
        </div>
        <SubmitButton isFluid>Send instructions</SubmitButton>
      </ValidatedForm>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Reset Password',
    },
  ];
};
