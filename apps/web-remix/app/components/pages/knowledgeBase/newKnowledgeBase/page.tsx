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
      className="w-full grow flex flex-col gap-2 h-[70%]"
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1">
        <Field name="collection_name">
          <TextInputField
            type="text"
            autoFocus
            label="Name"
            placeholder="eg. My Collection"
            supportingText="It will help you identify the collection in BUILDEL"
          />
        </Field>
      </div>
      <Button hierarchy="primary" type="submit" size="sm">
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
