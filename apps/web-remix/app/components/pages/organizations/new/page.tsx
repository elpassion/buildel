import { V2_MetaFunction } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Field } from "~/components/form/fields/field.context";
import { FieldError } from "~/components/form/fields/field.error";
import { FieldLabel } from "~/components/form/fields/field.label";
import { TextInputField } from "~/components/form/fields/text.field";
import { schema } from "./schema";

export function NewOrganizationPage() {
  const validator = useMemo(() => withZod(schema), []);

  return (
    <div className="container flex h-screen">
      <div className="my-auto flex w-full justify-center">
        <ValidatedForm
          validator={validator}
          method="post"
          noValidate
          className="w-[80%]"
        >
          <div className="max-w-s form-control w-full">
            <Field name="organization.name">
              <FieldLabel>Name</FieldLabel>
              <TextInputField />
              <FieldError />
            </Field>
          </div>
          <button type="submit" className="btn btn-block mt-6">
            Create
          </button>
        </ValidatedForm>
      </div>
    </div>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "New Organization",
    },
  ];
};
