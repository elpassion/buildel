import * as React from "react";
import { useLoaderData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { Field, HiddenField } from "~/components/form/fields/field.context";
import { FieldError } from "~/components/form/fields/field.error";
import { PasswordInputField } from "~/components/form/fields/text.field";
import { SubmitButton } from "~/components/form/submit";
import { schema } from "./schema";
import type { loader } from "./loader.server";
import type { MetaFunction } from "@remix-run/node";

export function SetupPage() {
  const { token } = useLoaderData<typeof loader>();
  const validator = React.useMemo(() => withZod(schema), []);

  return (
    <div className="my-auto flex flex-col w-full justify-center items-center">
      <h1 className="text-center text-3xl font-bold text-neutral-100">
        Setup account
      </h1>
      <p className="text-center text-neutral-100">
        You have been invited to organization. Setup your account to proceed.
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

        <div className="max-w-s form-control w-full mb-6">
          <Field name="password">
            <PasswordInputField aria-label="password" label="Password" />
          </Field>
        </div>

        <div className="max-w-s form-control w-full mb-6">
          <Field name="confirmPassword">
            <PasswordInputField
              aria-label="confirm password"
              label="Repeat password"
            />
          </Field>
        </div>

        <HiddenField name="token" value={token} />

        <SubmitButton isFluid>Create account</SubmitButton>
      </ValidatedForm>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Setup",
    },
  ];
};
