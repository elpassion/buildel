import { V2_MetaFunction } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Field, HiddenField } from "~/components/form/fields/field.context";
import { FieldError } from "~/components/form/fields/field.error";
import { FieldLabel } from "~/components/form/fields/field.label";
import { TextInputField } from "~/components/form/fields/text.field";
import { Button } from "@elpassion/taco";
import { schema } from "./schema";

export function NewPipelinePage() {
  const validator = useMemo(() => withZod(schema), []);

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full max-w-2xl"
    >
      <div className="max-w-s form-control w-full">
        <Field name="pipeline.name">
          <FieldLabel>Name</FieldLabel>
          <TextInputField type="text" autoFocus />
          <FieldError />
        </Field>
        <HiddenField name="pipeline.config.version" value="1" />
        <HiddenField name="pipeline.config.blocks" value={"[]"} />
      </div>
      <Button hierarchy="secondary" type="submit">
        Create workflow
      </Button>
    </ValidatedForm>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "New Pipeline",
    },
  ];
};
