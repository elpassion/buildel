import * as React from 'react';
import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import type { MetaFunction } from '@remix-run/node';
import { Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';

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
import { ValidatedForm, withZod } from '~/utils/form';
import { metaWithDefaults } from '~/utils/metadata';

import type { loader } from './loader.server';
import { schema } from './schema';

export function RegisterPage() {
  const captchaRef = React.useRef<ReCAPTCHA>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { googleLoginEnabled, googleCaptchaKey } =
    useLoaderData<typeof loader>();
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get('redirectTo');

  return (
    <>
      <div className="my-auto flex flex-col w-full justify-center items-center">
        <h1 className="text-center text-3xl font-bold text-foreground">
          Register for an account
        </h1>
        <p className="text-center text-muted-foreground">
          Already registered?{' '}
          <Link
            to={{
              pathname: '/login',
              search: searchParams.toString(),
            }}
            className="text-foreground"
          >
            Sign in
          </Link>{' '}
          to your account now.
        </p>
        <ValidatedForm
          validator={validator}
          method="post"
          noValidate
          className="w-full max-w-md mt-10"
          onSubmitFailure={() => {
            captchaRef.current?.reset();
          }}
        >
          <HiddenField name="redirectTo" value={redirectTo ?? undefined} />

          <div className="form-control w-full mb-4">
            <Field name="user.email">
              <FieldLabel>Email address</FieldLabel>
              <TextInputField aria-label="email" type="email" autoFocus />
              <FieldMessage />
            </Field>
          </div>
          <div className="max-w-s form-control w-full mb-2">
            <Field name="user.password">
              <FieldLabel>Password</FieldLabel>
              <PasswordInputField aria-label="password" />
              <FieldMessage />
            </Field>
          </div>
          <div className="mb-4">
            <Field name="global">
              <FieldMessage />
            </Field>
          </div>

          <div className="mb-3 min-h-[78px]">
            <ClientOnly>
              {() => (
                <ReCAPTCHA
                  ref={captchaRef}
                  size="normal"
                  sitekey={googleCaptchaKey ?? ''}
                  onChange={setCaptchaToken}
                />
              )}
            </ClientOnly>

            <Field name="captchaToken">
              <HiddenField
                name="captchaToken"
                value={captchaToken ?? undefined}
              />
              <FieldMessage />
            </Field>
          </div>

          <SubmitButton isFluid>Register</SubmitButton>
        </ValidatedForm>

        {googleLoginEnabled && (
          <>
            <span className="my-3 text-muted-foreground text-sm">Or</span>
            <SocialSignInForm
              action={
                redirectTo
                  ? `/auth/google?redirectTo=${redirectTo}`
                  : '/auth/google'
              }
              className="max-w-md mb-4"
            >
              <GoogleButton content="Sign up with Google" />
            </SocialSignInForm>
            <SocialSignInForm action="/auth/github" className="max-w-md">
              <GithubButton content="Sign up with Github" />
            </SocialSignInForm>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-6">
        By signing up you agree to our{' '}
        <a
          href="https://buildel.ai/terms-and-conditions"
          target="_blank"
          className="font-semibold hover:underline"
          rel="noreferrer"
        >
          terms of service
        </a>{' '}
        and{' '}
        <a
          href="https://buildel.ai/privacy-policy"
          target="_blank"
          className="font-semibold hover:underline"
          rel="noreferrer"
        >
          privacy policy
        </a>
        .
      </p>
    </>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Register',
    },
  ];
});
