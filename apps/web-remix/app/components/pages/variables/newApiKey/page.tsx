import React, { useMemo } from "react";
import { MetaFunction } from "@remix-run/node";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { Button } from "@elpassion/taco";
import { schema } from "./schema";
import { action } from "./action";
import { useActionData } from "@remix-run/react";

export function NewSecret() {
  const validator = useMemo(() => withZod(schema), []);
  const data = useActionData<typeof action>();

  return (
    <ValidatedForm
      method="post"
      validator={validator}
      className="grow flex flex-col h-[70%]"
    >
      <div className="p-1 w-full grow overflow-y-auto flex items-end">
        <Button size="sm" hierarchy="primary" type="submit" isFluid>
          Create Api Key
        </Button>
      </div>
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
