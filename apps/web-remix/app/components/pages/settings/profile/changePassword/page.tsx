import { Button } from "@elpassion/taco";
import { MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { loader } from "./loader";
import { changePasswordSchema } from "./schema";

export function ChangePasswordPage() {
  const { user } = useLoaderData<typeof loader>();
  const validator = useMemo(() => withZod(changePasswordSchema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2 h-[70%]"
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1">
        <Field name="previous_password">
          <TextInputField type="password" autoFocus label="Current password" />
        </Field>
        <Field name="password">
          <TextInputField type="password" label="New password" />
        </Field>
        <Field name="password_confirmation">
          <TextInputField type="password" label="Confirm password" />
        </Field>
      </div>
      <Button type="submit" size="sm" hierarchy="primary">
        Change password
      </Button>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Change password",
    },
  ];
};
