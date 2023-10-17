import React, { useMemo } from "react";
import { MetaFunction } from "@remix-run/node";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Button } from "@elpassion/taco";
import { schema } from "./schema";

export function NewSecret() {
  const validator = useMemo(() => withZod(schema), []);

  return (
    <ValidatedForm method="post" validator={validator}>
      <Button size="sm" hierarchy="primary" type="submit">
        Create Api Key
      </Button>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "New API Key",
    },
  ];
};
