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

export function LoginPage() {
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/stories";
  const actionData = useActionData();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="container flex h-screen">
      <div className="my-auto flex w-full justify-center">
        <ValidatedForm
          validator={validator}
          method="post"
          noValidate
          className="w-[80%]"
        >
          <div className="form-control w-full">
            <Field name="email">
              <FieldLabel>Email address</FieldLabel>
              <TextInputField ref={emailRef} type="email" autoFocus />
              <FieldError />
            </Field>
          </div>
          <div className="max-w-s form-control w-full">
            <Field name="password">
              <FieldLabel>Password</FieldLabel>
              <PasswordInputField ref={passwordRef} />
              <FieldError />
            </Field>
          </div>
          <input type="hidden" name="redirectTo" value={redirectTo} />
          <button type="submit" className="btn btn-block mt-6">
            Log in
          </button>
          <div className="mt-4">
            Don't have an account?{" "}
            <Link
              className="link link-primary"
              to={{
                pathname: "/signup",
                search: searchParams.toString(),
              }}
            >
              Sign up
            </Link>
          </div>
        </ValidatedForm>
      </div>
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
