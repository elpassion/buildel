import React, { useMemo } from "react";
import { MetaFunction } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { Button } from "@elpassion/taco";
import { ValidatedForm } from "remix-validated-form";
import { schema } from "./schema";
import { action } from "./action";
import { isTypeOf } from "~/utils/guards";

export function NewSecret() {
  const validator = useMemo(() => withZod(schema), []);
  const data = useActionData<typeof action>();

  return (
    <ValidatedForm
      method="post"
      validator={validator}
      className="grow flex flex-col gap-1 h-[70%]"
    >
      <div className="p-1 w-full grow overflow-y-auto">
        {isTypeOf("key", data) ? <p>Your new key: {data.key.key}</p> : null}
      </div>
      <Button size="sm" hierarchy="primary" type="submit" isFluid>
        Generate Api Key
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
