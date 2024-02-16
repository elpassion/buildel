import * as React from "react";
import { MetaFunction } from "@remix-run/node";
import { useSearchParams, Link, useLoaderData } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { schema } from "./schema";
import { Field, HiddenField } from "~/components/form/fields/field.context";
import { FieldError } from "~/components/form/fields/field.error";
import { SubmitButton } from "~/components/form/submit";
import { GoogleSignInForm } from "~/components/googleAuth/GoogleSignInForm";
import {
  PasswordInputField,
  TextInputField,
} from "~/components/form/fields/text.field";
import { loader } from "./loader";
import { GoogleButton } from "~/components/googleAuth/GoogleButton";

export function LoginPage() {
  const { googleLoginEnabled } = useLoaderData<typeof loader>();
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold text-neutral-100">
        Sign in to account
      </h1>
      <p className="text-center text-neutral-100">
        Don't have an account?{" "}
        <Link
          to={{
            pathname: "/register",
            search: searchParams.toString(),
          }}
          className="text-primary-500"
        >
          Sign up
        </Link>{" "}
        for an account now.
      </p>

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

      <span className="my-3 text-neutral-300 text-sm">Or</span>

      {googleLoginEnabled && (
        <GoogleSignInForm className="max-w-md">
          <GoogleButton />
        </GoogleSignInForm>
      )}
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Login",
    },
  ];
};
