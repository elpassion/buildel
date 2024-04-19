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

export function EditKnowledgeBasePage() {
  const { organizationId, collection } = useLoaderData<typeof loader>();
  const validator = useMemo(() => withZod(UpdateCollectionSchema), []);
  const [_, setWatchedValues] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  const onValueChange = (name: string, value: unknown) => {
    setWatchedValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseSidebar = () => {
    navigate(routes.knowledgeBase(organizationId));
  };

  return (
    <>
      <ActionSidebarHeader
        heading={`Update ${collection.name}`}
        subheading="Any collection can contain many files and be used in your workflows"
        onClose={handleCloseSidebar}
      />
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
            <ModelSelectField disabled />
          </div>

          <div>
            <SecretSelectField />
          </div>

          <Field name="chunk_size">
            <NumberInputField
              label="Chunk size"
              placeholder="eg. 1000"
              supportingText="Size of the generated chunks in the collection."
            />
          </Field>

          <Field name="chunk_overlap">
            <NumberInputField
              label="Chunk overlap"
              placeholder="eg. 50"
              supportingText="Overlap between the generated chunks in the collection."
            />
          </Field>
        </div>
        <SubmitButton hierarchy="primary" size="sm">
          Update collection
        </SubmitButton>
      </ValidatedForm>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Edit Collection",
    },
  ];
};
