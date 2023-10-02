import React, { useMemo } from "react";
import { MetaFunction } from "@remix-run/node";
import { Button } from "@elpassion/taco";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import { FileUploadField } from "~/components/form/fields/fileUpload.field";
import { Field } from "~/components/form/fields/field.context";
import { schema } from "~/components/pages/pipelines/new/schema";

export function NewKnowledgeBasePage() {
  const validator = useMemo(() => withZod(schema), []);

  return (
    <ValidatedForm
      validator={validator}
      className="grow flex flex-col gap-2 h-[70%]"
    >
      <div className="grow overflow-y-auto">
        <Field name="knowledgeFiles">
          <FileUploadField
            multiple
            className="!gap-6"
            labelText="Browse files to upload"
            preview={FileUploadListPreview}
          />
        </Field>
      </div>
      <Button isFluid size="sm">
        Add knowledge items
      </Button>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "New knowledge base",
    },
  ];
};
