import * as React from "react";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { Field, HiddenField } from "~/components/form/fields/field.context";
import { FieldError } from "~/components/form/fields/field.error";
import {
  PasswordInputField,
  TextInputField,
} from "~/components/form/fields/text.field";
import { SubmitButton } from "~/components/form/submit";
import { GithubButton } from "~/components/githubAuth/GithubButton";
import { GoogleButton } from "~/components/googleAuth/GoogleButton";
import { SocialSignInForm } from "~/components/socialAuth/SocialSignInForm";
import { schema } from "./schema";
import type { loader } from "./loader.server";
import type { MetaFunction } from "@remix-run/node";

export function RegisterPage() {
  const { googleLoginEnabled } = useLoaderData<typeof loader>();
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold text-neutral-100">
        Register for an account
      </h1>
      <p className="text-center text-neutral-100">
        Already registered?{" "}
        <Link
          to={{
            pathname: "/login",
            search: searchParams.toString(),
          }}
          className="text-primary-500"
        >
          Sign in
        </Link>{" "}
        to your account now.
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

        <HiddenField name="redirectTo" value={redirectTo ?? undefined} />

        <div className="form-control w-full mb-4">
          <Field name="user.email">
            <TextInputField
              aria-label="email"
              type="email"
              autoFocus
              label="Email address"
            />
          </Field>
        </div>
        <div className="max-w-s form-control w-full mb-6">
          <Field name="user.password">
            <PasswordInputField aria-label="password" label="Password" />
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
      title: "Register",
    },
  ];
};
