import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { SearchSchema } from "./schema";
import { IconButton } from "~/components/iconButton";

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
        <div className="relative">
          <TextInputField
            placeholder="Ask a question..."
            inputClassName="!pr-8"
          />

          <IconButton
            onlyIcon
            iconName="search"
            aria-label="Search"
            className="absolute top-[21px] right-3 -translate-y-1/2"
          />
        </div>
      </Field>
    </ValidatedForm>
  );
};
