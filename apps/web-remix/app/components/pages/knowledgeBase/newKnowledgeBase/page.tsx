import React, { useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import {
  Field as FormField,
  Field,
} from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { schema } from "./schema";
import { SubmitButton } from "~/components/form/submit";
import { RadioField } from "~/components/form/fields/radio.field";
import { AsyncSelectField } from "~/components/form/fields/asyncSelect.field";
import { InputText } from "@elpassion/taco";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader.server";

export function NewKnowledgeBasePage() {
  const validator = useMemo(() => withZod(schema), []);
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

interface ApiTypesRadioGroupFieldProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
function ApiTypesRadioGroupField({ onChange }: ApiTypesRadioGroupFieldProps) {
  const { fieldErrors } = useFormContext();

  return (
    <Field name="embeddings.api_type">
      <p className="text-white mb-1 text-sm">Embeddings API Type</p>
      {["openai"].map((value) => (
        <RadioField
          onChange={onChange}
          name={value}
          id={value}
          key={value}
          value={value}
          label={value}
        />
      ))}
      <InputText error text={fieldErrors["embeddings.api_type"]} />
    </Field>
  );
}

function ModelSelectField() {
  const { organizationId } = useLoaderData<typeof loader>();
  const { fieldErrors, getValues } = useFormContext();
  // const values = getValues();

  return (
    <FormField name="embeddings.model">
      <AsyncSelectField
        url={`/api/organizations/${organizationId}/models/embeddings?api_type=openai`}
        label="Model"
        supportingText="The model to use for the embeddings."
        errorMessage={fieldErrors["embeddings.model"]}
      />
    </FormField>
  );
}

function SecretSelectField() {
  const { organizationId } = useLoaderData<typeof loader>();
  const { fieldErrors } = useFormContext();

  return (
    <FormField name="embeddings.secret_name">
      <AsyncSelectField
        url={`/api/organizations/${organizationId}/secrets`}
        label="Secret"
        supportingText="The secret to use for the embeddings."
        errorMessage={fieldErrors["embeddings.secret_name"]}
      />
    </FormField>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "New Knowledge Base",
    },
  ];
};
