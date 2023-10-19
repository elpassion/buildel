import React, { useMemo } from "react";
import { useActionData, useNavigation } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import { Button } from "@elpassion/taco";
import { ValidatedForm } from "remix-validated-form";
import { schema } from "./schema";
import { action } from "./action";
import { isTypeOf } from "~/utils/guards";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import classNames from "classnames";
import { MetaFunction } from "@remix-run/node";

export function NewSecret() {
  const navigation = useNavigation();
  const validator = useMemo(() => withZod(schema), []);
  const data = useActionData<typeof action>();
  const { copy, isCopied } = useCopyToClipboard(
    isTypeOf("key", data) ? data.key.key : ""
  );

  const isSubmitting = navigation.state === "submitting";

  return (
    <ValidatedForm
      method="post"
      validator={validator}
      className="grow flex flex-col gap-1 h-[70%]"
    >
      <div className="p-1 w-full grow overflow-y-auto text-white text-sm">
        {isTypeOf("key", data) ? (
          <>
            <p className="mb-3">
              Make sure to copy your API Key.{" "}
              <span className="font-bold">
                You won’t be able to see it again!
              </span>
            </p>
            <div className="flex justify-between mb-1">
              <p className="text-neutral-100 text-xs">API Key</p>
              <button
                type="button"
                onClick={copy}
                className={classNames("text-xs", {
                  "text-green-600": isCopied,
                })}
              >
                {isCopied ? "Copied" : "Copy"}
              </button>
            </div>

            <div className="block w-full overflow-x-auto">{data.key.key}</div>
          </>
        ) : (
          <p className="text-neutral-200 italic">Generate new API Key...</p>
        )}
      </div>
      {isTypeOf("key", data) ? null : (
        <Button
          isFluid
          size="sm"
          type="submit"
          hierarchy="primary"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Generate API Key
        </Button>
      )}
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
