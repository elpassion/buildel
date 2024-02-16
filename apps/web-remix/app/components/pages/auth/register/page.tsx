import { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useSearchParams } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import * as React from "react";
import { ValidatedForm } from "remix-validated-form";
import { Field } from "~/components/form/fields/field.context";
import { FieldError } from "~/components/form/fields/field.error";
import {
  PasswordInputField,
  TextInputField,
} from "~/components/form/fields/text.field";
import { schema } from "./schema";
import { SubmitButton } from "~/components/form/submit";
import { GoogleSignInForm } from "~/components/googleAuth/GoogleSignInForm";
import { loader } from "./loader";
import { GoogleButton } from "~/components/googleAuth/GoogleButton";

export function RegisterPage() {
  const { googleLoginEnabled } = useLoaderData<typeof loader>();
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();

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

      <span className="my-3 text-neutral-300 text-sm">Or</span>

      {googleLoginEnabled && (
        <GoogleSignInForm className="max-w-md">
          <GoogleButton content="Sign up with Google" />
        </GoogleSignInForm>
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
