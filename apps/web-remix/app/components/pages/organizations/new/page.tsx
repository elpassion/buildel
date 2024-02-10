import { MetaFunction } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { Button } from "@elpassion/taco";
import { CreateOrganizationSchema } from "~/api/organization/organization.contracts";
import { SubmitButton } from "~/components/form/submit";

export function NewOrganizationPage() {
  const validator = useMemo(() => withZod(CreateOrganizationSchema), []);

  return (
    <div className="min-h-screen w-full flex justify-center items-center p-2">
      <div className="bg-neutral-850 w-full max-w-lg rounded-lg p-6 sm:p-10 md:p-14">
        <div className="flex flex-col gap-2 text-white mb-8">
          <h1 className="text-xl font-medium">Name your organisation</h1>
          <p className="text-sm">
            You will be able to work in multiple organisations.
          </p>
        </div>
        <ValidatedForm
          validator={validator}
          method="post"
          noValidate
          className="w-full"
        >
          <div className="max-w-s form-control w-full">
            <Field name="organization.name">
              <TextInputField
                placeholder="Name"
                supportingText="This will be visible only to you"
              />
            </Field>
          </div>
          <SubmitButton size="lg" className="mt-8 mx-auto">
            Create organisation
          </SubmitButton>
        </ValidatedForm>
      </div>
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "New Organization",
    },
  ];
};
