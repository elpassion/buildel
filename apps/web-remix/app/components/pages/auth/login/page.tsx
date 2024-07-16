import * as React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldError } from '~/components/form/fields/field.error';
import {
  PasswordInputField,
  TextInputField,
} from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { GithubButton } from '~/components/githubAuth/GithubButton';
import { GoogleButton } from '~/components/googleAuth/GoogleButton';
import { SocialSignInForm } from '~/components/socialAuth/SocialSignInForm';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';
import { schema } from './schema';

export function LoginPage() {
  const { googleLoginEnabled, signupEnabled } = useLoaderData<typeof loader>();
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold text-neutral-100">
        Sign in to account
      </h1>
      {signupEnabled && (
        <p className="text-center text-neutral-100">
          Don't have an account?{' '}
          <Link
            to={{
              pathname: '/register',
              search: searchParams.toString(),
            }}
            className="text-primary-500"
          >
            Sign up
          </Link>{' '}
          for an account now.
        </p>
      )}

      <ValidatedForm
        validator={validator}
        method="post"
        noValidate
        className="w-full max-w-md"
      >
        <Field name="global">
          <FieldError />
        </Field>
        <div className="form-control w-full mb-4">
          <Field name="user.email">
            <TextInputField
              aria-label="email"
              type="email"
              label="Email address"
              autoFocus
            />
          </Field>
        </div>
        <div className="max-w-s form-control w-full mb-6">
          <Field name="user.password">
            <PasswordInputField aria-label="password" label="Password" />
          </Field>
        </div>
        <HiddenField name="redirectTo" value={redirectTo ?? undefined} />
        <SubmitButton isFluid>Log in</SubmitButton>
      </ValidatedForm>
      <Link to={routes.resetPassowrd()} className="mt-2 text-neutral-100">
        Forgot your password? Reset it here.
      </Link>

      {googleLoginEnabled && (
        <>
          <span className="my-3 text-neutral-300 text-sm">Or</span>
          <SocialSignInForm action="/auth/google" className="max-w-md mb-4">
            <GoogleButton />
          </SocialSignInForm>
          <SocialSignInForm action="/auth/github" className="max-w-md">
            <GithubButton />
          </SocialSignInForm>
        </>
      )}
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Login',
    },
  ];
};
