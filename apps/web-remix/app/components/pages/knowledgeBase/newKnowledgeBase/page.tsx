import React, { useMemo } from "react";
import { MetaFunction } from "@remix-run/node";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Button, Label } from "@elpassion/taco";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { schema } from "./schema";
import { SubmitButton } from "~/components/form/submit";
import { CheckboxInputField } from "~/components/form/fields/checkbox.field";
import { RadioField } from "~/components/form/fields/radio.field";

export function NewKnowledgeBasePage() {
  const validator = useMemo(() => withZod(schema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2 h-[70%]"
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1 flex flex-col gap-2">
        <Field name="collection_name">
          <TextInputField
            type="text"
            autoFocus
            label="Name"
            placeholder="eg. My Collection"
            supportingText="It will help you identify the collection in BUILDEL"
          />
        </Field>

        <Field name="embeddings.api_type">
          <p className="text-white">Embeddings API Type</p>
          {["openai"].map((value) => (
            <RadioField
              name={value}
              id={value}
              key={value}
              value={value}
              label={value}
            />
          ))}
        </Field>
        <Field name="embeddings.model">
          <p className="text-white">Embeddings Model</p>
          {["text-embedding-ada-002"].map((value) => (
            <RadioField
              defaultChecked
              name={value}
              id={value}
              key={value}
              value={value}
              label={value}
            />
          ))}
        </Field>
        <Field name="embeddings.secret_name">
          <p className="text-white">Embeddings API Secret</p>
          <TextInputField
            defaultChecked
            type="text"
            label="Secret name"
            placeholder="eg. my"
          />
        </Field>
      </div>
      <SubmitButton hierarchy="primary" size="sm">
        Create collection
      </SubmitButton>
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
