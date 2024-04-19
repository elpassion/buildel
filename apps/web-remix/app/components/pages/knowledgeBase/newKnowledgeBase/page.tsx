import React, { useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Field } from "~/components/form/fields/field.context";
import { CreateCollectionSchema } from "~/api/knowledgeBase/knowledgeApi.contracts";
import { TextInputField } from "~/components/form/fields/text.field";
import { NumberInputField } from "~/components/form/fields/number.field";
import { SubmitButton } from "~/components/form/submit";
import {
  ApiTypesRadioGroupField,
  ModelSelectField,
  SecretSelectField,
} from "~/components/pages/knowledgeBase/KnowledgeBaseFields";

export function NewKnowledgeBasePage() {
  const validator = useMemo(() => withZod(CreateCollectionSchema), []);
  const [_, setWatchedValues] = useState<Record<string, any>>({});

  const onValueChange = (name: string, value: unknown) => {
    setWatchedValues((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full grow flex flex-col gap-2 h-[70%]"
      defaultValues={{
        embeddings: {
          api_type: "openai",
        },
        chunk_size: 1000,
        chunk_overlap: 0,
      }}
    >
      <div className="max-w-s w-full grow overflow-y-auto p-1 flex flex-col gap-2 space-y-1">
        <Field name="collection_name">
          <TextInputField
            type="text"
            autoFocus
            label="Name"
            placeholder="eg. My Collection"
            supportingText="It will help you identify the collection in BUILDEL"
          />
        </Field>

        <div>
          <ApiTypesRadioGroupField
            onChange={(e) => onValueChange(e.target.name, e.target.value)}
          />
        </div>

        <div>
          <ModelSelectField />
        </div>

        <div>
          <SecretSelectField />
        </div>

        <Field name="chunk_size">
          <NumberInputField
            label="Chunk size"
            placeholder="eg. 1000"
            supportingText="Size of the generated chunks in the collection."
          />
        </Field>

        <Field name="chunk_overlap">
          <NumberInputField
            label="Chunk overlap"
            placeholder="eg. 50"
            supportingText="Overlap between the generated chunks in the collection."
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
