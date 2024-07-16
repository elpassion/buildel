import React from "react";
import { useLoaderData } from "@remix-run/react";
import { useFormContext } from "remix-validated-form";
import { InputText } from "@elpassion/taco";
import { AsyncSelectField } from "~/components/form/fields/asyncSelect.field";
import {
  Field,
  Field as FormField,
} from "~/components/form/fields/field.context";
import { RadioField } from "~/components/form/fields/radio.field";
import type { loader } from "~/components/pages/knowledgeBase/newKnowledgeBase/loader.server";

interface ApiTypesRadioGroupFieldProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}
export function ApiTypesRadioGroupField({
  onChange,
  disabled,
}: ApiTypesRadioGroupFieldProps) {
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
          disabled={disabled}
        />
      ))}
      <InputText error text={fieldErrors["embeddings.api_type"]} />
    </Field>
  );
}

interface ModelSelectFieldProps {
  disabled?: boolean;
}

export function ModelSelectField({ disabled }: ModelSelectFieldProps) {
  const { organizationId } = useLoaderData<typeof loader>();
  const { fieldErrors } = useFormContext();

  return (
    <FormField name="embeddings.model">
      <AsyncSelectField
        id="model"
        url={`/api/organizations/${organizationId}/models/embeddings?api_type=openai`}
        label="Model"
        supportingText="The model to use for the embeddings."
        errorMessage={fieldErrors["embeddings.model"]}
        disabled={disabled}
      />
    </FormField>
  );
}

export function SecretSelectField() {
  const { organizationId } = useLoaderData<typeof loader>();
  const { fieldErrors } = useFormContext();

  return (
    <FormField name="embeddings.secret_name">
      <AsyncSelectField
        url={`/api/organizations/${organizationId}/secrets`}
        label="Secret"
        id="secret"
        supportingText="The secret to use for the embeddings."
        errorMessage={fieldErrors["embeddings.secret_name"]}
      />
    </FormField>
  );
}
