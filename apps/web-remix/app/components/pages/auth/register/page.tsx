import { V2_MetaFunction } from "@remix-run/node";
import { Link, useSearchParams } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import * as React from "react";
import { ValidatedForm } from "remix-validated-form";
import { Field } from "~/components/form/fields/field.context";
import { FieldError } from "~/components/form/fields/field.error";
import { FieldLabel } from "~/components/form/fields/field.label";
import {
  PasswordInputField,
  TextInputField,
} from "~/components/form/fields/text.field";
import { schema } from "./schema";

export function RegisterPage() {
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();

  return (
    <div className="container flex h-screen">
      <div className="my-auto flex w-full justify-center">
        <ValidatedForm
          validator={validator}
          method="post"
          noValidate
          className="w-[80%]"
        >
          <Field name="global">
            <FieldError />
          </Field>

          <div className="form-control w-full">
            <Field name="user.email">
              <FieldLabel>Email address</FieldLabel>
              <TextInputField type="email" autoFocus />
              <FieldError />
            </Field>
          </div>
          <div className="max-w-s form-control w-full">
            <Field name="user.password">
              <FieldLabel>Password</FieldLabel>
              <PasswordInputField />
              <FieldError />
            </Field>
          </div>
          <button type="submit" className="btn btn-block mt-6">
            Register
          </button>
          <div className="mt-4">
            Already have an account?{" "}
            <Link
              className="link link-primary"
              to={{
                pathname: "/login",
                search: searchParams.toString(),
              }}
            >
              Log in
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
      title: "Register",
    },
  ];
};
