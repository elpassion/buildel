import React, { useMemo } from "react";
import { MetaFunction } from "@remix-run/node";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Button } from "@elpassion/taco";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { schema } from "./schema";

export function NewKnowledgeBasePage() {
  const validator = useMemo(() => withZod(schema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full max-w-2xl"
    >
      <div className="max-w-s form-control w-full">
        <Field name="collection_name">
          <TextInputField type="text" autoFocus label="Name" />
        </Field>
      </div>
      <Button hierarchy="primary" type="submit" className="mt-4">
        Create collection
      </Button>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "New Knowledge Base",
    },
  ];
};
