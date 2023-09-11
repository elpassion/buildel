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
import { Button } from "@elpassion/taco";

export function RegisterPage() {
  const validator = React.useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold">
        Register for an account
      </h1>
      <p className="text-center">
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
        <Button type="submit" isFluid>
          Register
        </Button>
      </ValidatedForm>
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
