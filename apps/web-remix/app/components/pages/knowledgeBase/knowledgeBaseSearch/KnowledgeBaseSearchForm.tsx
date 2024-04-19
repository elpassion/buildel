import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { SearchSchema } from "./schema";

interface KnowledgeBaseSearchFormProps {
  defaultValue?: string;
}

export const KnowledgeBaseSearchForm: React.FC<
  KnowledgeBaseSearchFormProps
> = ({ defaultValue }) => {
  const validator = useMemo(() => withZod(SearchSchema), []);

  return (
    <ValidatedForm
      method="GET"
      validator={validator}
      defaultValues={{ query: defaultValue }}
      noValidate
    >
      <Field name="query">
        <TextInputField placeholder="Ask a question..." />
      </Field>
    </ValidatedForm>
  );
};
