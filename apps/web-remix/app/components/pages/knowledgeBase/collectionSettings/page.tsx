import React, { useMemo, useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Field, HiddenField } from "~/components/form/fields/field.context";
import { UpdateCollectionSchema } from "~/api/knowledgeBase/knowledgeApi.contracts";
import { TextInputField } from "~/components/form/fields/text.field";
import { NumberInputField } from "~/components/form/fields/number.field";
import { SubmitButton } from "~/components/form/submit";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { ActionSidebarHeader } from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import {
  ApiTypesRadioGroupField,
  ModelSelectField,
  SecretSelectField,
} from "~/components/pages/knowledgeBase/KnowledgeBaseFields";
import { loader } from "./loader.server";
import { SectionContent } from "../../settings/settingsLayout/PageLayout";

export function CollectionSettingsPage() {
  const { organizationId, collection } = useLoaderData<typeof loader>();
  const validator = useMemo(() => withZod(UpdateCollectionSchema), []);
  const [_, setWatchedValues] = useState<Record<string, any>>({});

  const onValueChange = (name: string, value: unknown) => {
    setWatchedValues((prev) => ({ ...prev, [name]: value }));
  };


  return (
    <>
      <SectionContent>
        <ValidatedForm
          noValidate
          method="put"
          validator={validator}
          className="w-full grow flex flex-col gap-2 h-[70%]"
          defaultValues={collection}
        >
          <HiddenField name="id" value={collection.id} />

          <div className="max-w-s w-full grow overflow-y-auto p-1 flex flex-col gap-2 space-y-1">
            <Field name="name">
              <TextInputField
                disabled
                type="text"
                autoFocus
                label="Name"
                placeholder="eg. My Collection"
                supportingText="It will help you identify the collection in BUILDEL"
              />
            </Field>

            <div>
              <ApiTypesRadioGroupField
                disabled
                onChange={(e) => onValueChange(e.target.name, e.target.value)}
              />
            </div>

            <div>
              <Field name="embeddings.endpoint">
                <TextInputField
                  disabled
                  type="text"
                  label={"Endpoint"}
                  name={"endpoint"}
                  supportingText="API endpoint used for retrieving embeddings"
                />
              </Field>
            </div>

            <div>
              <ModelSelectField disabled />
            </div>

            <div>
              <SecretSelectField />
            </div>
          </div>
          <SubmitButton hierarchy="primary" size="sm">
            Update collection
          </SubmitButton>
        </ValidatedForm>
      </SectionContent>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Collection settings",
    },
  ];
};
