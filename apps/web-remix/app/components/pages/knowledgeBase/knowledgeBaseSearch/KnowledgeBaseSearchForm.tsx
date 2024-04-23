import React, { useMemo } from "react";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { SearchSchema } from "./schema";
import { IconButton } from "~/components/iconButton";
import classNames from "classnames";
import { SearchParams } from "./SearchParams";
import { NumberInputField } from "~/components/form/fields/number.field";
import { ToggleInputField } from "~/components/form/fields/toggle.field";
import { ExtendChunksField } from "./ExtendChunksToggleField";

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
      className="flex gap-2 w-full "
    >
      <SearchParams>
        <Field name="limit">
          <NumberInputField
            label="Results limit"
            placeholder="eg. 10"
            supportingText="Limit the number of results returned by the search. Default is 10."
          />
        </Field>

        <Field name="token_limit">
          <NumberInputField
            label="Tokens limit"
            placeholder="eg. 500"
            supportingText="Limit the number of tokens returned by the search. Disabled by default."
          />
        </Field>

        <Field name="extend_neighbors">
          <ExtendChunksField
            label="Extend neighbors"
            supportingText="Extend the search to include neighbor chunks"
          />
        </Field>
      </SearchParams>

      <Field name="query">
        <div className="relative w-full">
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
