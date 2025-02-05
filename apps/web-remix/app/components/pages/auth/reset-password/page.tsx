import * as React from 'react';
import { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import type { MetaFunction } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ClientOnly } from 'remix-utils/client-only';

import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { ValidatedForm, withZod } from '~/utils/form';
import { metaWithDefaults } from '~/utils/metadata';

import type { loader } from './loader.server';
import { schema, schemaWithCaptcha } from './schema';

export function ResetPasswordPage() {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const captchaRef = React.useRef<ReCAPTCHA>(null);

  const { googleCaptchaKey } = useLoaderData<typeof loader>();

  const isCaptchaEnabled = !!googleCaptchaKey;

  const validator = React.useMemo(
    () => withZod(isCaptchaEnabled ? schemaWithCaptcha : schema),
    [],
  );

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold">Reset password</h1>
      <p className="text-center text-muted-foreground">
        Go back to{' '}
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
          <Field name="email">
            <FieldLabel>Email address</FieldLabel>
            <TextInputField aria-label="email" type="email" autoFocus />
            <FieldMessage />
          </Field>
        </div>

        {isCaptchaEnabled ? (
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
        ) : null}

        <SubmitButton isFluid>Send instructions</SubmitButton>
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
