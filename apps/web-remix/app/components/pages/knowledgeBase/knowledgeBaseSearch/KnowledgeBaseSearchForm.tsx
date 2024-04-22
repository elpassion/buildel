import React, { useMemo } from "react";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { SearchSchema } from "./schema";
import { IconButton } from "~/components/iconButton";
import classNames from "classnames";

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

          <div className="absolute top-[21px] right-3 -translate-y-1/2">
            <SearchButton />
          </div>
        </div>
      </Field>
    </ValidatedForm>
  );
};

function SearchButton() {
  const { isSubmitting } = useFormContext();

  return (
    <IconButton
      onlyIcon
      iconName={isSubmitting ? "loader" : "search"}
      aria-label="Search"
      className={classNames({ "animate-spin": isSubmitting })}
    />
  );
}
