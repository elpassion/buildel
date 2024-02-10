import { MetaFunction } from "@remix-run/node";
import { useNavigation } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Field } from "~/components/form/fields/field.context";
import {
  PasswordInputField,
  TextInputField,
} from "~/components/form/fields/text.field";
import { SubmitButton } from "~/components/form/submit";
import { schema } from "./schema";

export function NewSecret() {
  const validator = useMemo(() => withZod(schema), []);

  return (
    <ValidatedForm
      noValidate
      validator={validator}
      method="post"
      className="grow flex flex-col gap-2 h-[70%]"
    >
      <div className="p-1 w-full space-y-6 grow overflow-y-auto">
        <Field name="name">
          <TextInputField
            autoFocus
            placeholder="e.g. my open ai key"
            type="text"
            label="Name your Secret"
            supportingText="It will help you identify the key in BUILDEL"
          />
        </Field>

        <Field name="value">
          <PasswordInputField
            label="Enter the Secret key"
            placeholder="Type or paste in your token key"
            supportingText="The actual token key that will authorise you in the external system, such as Open AI."
          />
        </Field>
      </div>
      <SubmitButton
        size="sm"
        hierarchy="primary"
      >
        Save the Secret
      </SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "New Secret",
    },
  ];
};
