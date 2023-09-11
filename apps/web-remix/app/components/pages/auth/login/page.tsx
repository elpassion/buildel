import { V2_MetaFunction } from "@remix-run/node";
import { useActionData, useSearchParams, Link } from "@remix-run/react";
import * as React from "react";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { schema } from "./schema";
import { Field } from "~/components/form/fields/field.context";
import { FieldLabel } from "~/components/form/fields/field.label";
import {
  PasswordInputField,
  TextInputField,
} from "~/components/form/fields/text.field";
import { FieldError } from "~/components/form/fields/field.error";
import { action } from "./action";
import { Button } from "@elpassion/taco";

export function LoginPage() {
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/stories";
  const actionData = useActionData<typeof action>();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // if (actionData?) {
    // emailRef.current?.focus();
    // } else if (actionData?.errors.password) {
    // passwordRef.current?.focus();
    // }
  }, [actionData]);

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold">Sign in to account</h1>
      <p className="text-center">
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
        <div className="form-control w-full">
          <Field name="user.email">
            <FieldLabel>Email address</FieldLabel>
            <TextInputField ref={emailRef} type="email" autoFocus />
            <FieldError />
          </Field>
        </div>
        <div className="max-w-s form-control w-full">
          <Field name="user.password">
            <FieldLabel>Password</FieldLabel>
            <PasswordInputField ref={passwordRef} />
            <FieldError />
          </Field>
        </div>
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Button type="submit" isFluid>
          Log in
        </Button>
      </ValidatedForm>
    </div>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Login",
    },
  ];
};
