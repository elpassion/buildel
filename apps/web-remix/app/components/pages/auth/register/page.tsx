import * as React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import {
  PasswordInputField,
  TextInputField,
} from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { GithubButton } from '~/components/githubAuth/GithubButton';
import { GoogleButton } from '~/components/googleAuth/GoogleButton';
import { SocialSignInForm } from '~/components/socialAuth/SocialSignInForm';

import type { loader } from './loader.server';
import { schema } from './schema';

export function RegisterPage() {
  const { googleLoginEnabled } = useLoaderData<typeof loader>();
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold text-neutral-100">
        Register for an account
      </h1>
      <p className="text-center text-neutral-100">
        Already registered?{' '}
        <Link
          to={{
            pathname: '/login',
            search: searchParams.toString(),
          }}
          className="text-primary-500"
        >
          Sign in
        </Link>{' '}
        to your account now.
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

        <HiddenField name="redirectTo" value={redirectTo ?? undefined} />

        <div className="form-control w-full mb-4">
          <Field name="user.email">
            <FieldLabel>Email address</FieldLabel>
            <TextInputField aria-label="email" type="email" autoFocus />
            <FieldMessage />
          </Field>
        </div>
        <div className="max-w-s form-control w-full mb-6">
          <Field name="user.password">
            <FieldLabel>Password</FieldLabel>
            <PasswordInputField aria-label="password" />
            <FieldMessage />
          </Field>
        </div>
        <SubmitButton isFluid>Register</SubmitButton>
      </ValidatedForm>

      {googleLoginEnabled && (
        <>
          <span className="my-3 text-neutral-300 text-sm">Or</span>
          <SocialSignInForm action="/auth/google" className="max-w-md mb-4">
            <GoogleButton content="Sign up with Google" />
          </SocialSignInForm>
          <SocialSignInForm action="/auth/github" className="max-w-md">
            <GithubButton content="Sign up with Github" />
          </SocialSignInForm>
        </>
      )}
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Register',
    },
  ];
};
