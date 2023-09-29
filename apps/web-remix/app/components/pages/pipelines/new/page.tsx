import { MetaFunction } from "@remix-run/node";
import { withZod } from "@remix-validated-form/with-zod";
import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Field, HiddenField } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { Button } from "@elpassion/taco";
import { schema } from "./schema";
import { useSearchParams } from "@remix-run/react";

export function NewPipelinePage() {
  const validator = useMemo(() => withZod(schema), []);
  const [searchParams] = useSearchParams();

  return (
    <ValidatedForm
      validator={validator}
      method="post"
      noValidate
      className="w-full max-w-2xl"
    >
      <div className="max-w-s form-control w-full">
        <Field name="pipeline.name">
          <TextInputField type="text" autoFocus label="Name" />
        </Field>
        <HiddenField name="pipeline.config.version" value="1" />

        <HiddenField
          name="pipeline.config.blocks"
          value={searchParams.get("blocks") ?? "[]"}
        />
      </div>
      <Button hierarchy="primary" type="submit" className="mt-4">
        Create workflow
      </Button>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "New Pipeline",
    },
  ];
};
