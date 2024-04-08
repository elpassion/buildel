import React, { useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Field } from "~/components/form/fields/field.context";
import { CreateCollectionSchema } from "~/api/knowledgeBase/knowledgeApi.contracts";
import { TextInputField } from "~/components/form/fields/text.field";
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
