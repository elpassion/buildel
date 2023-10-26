import React, { useState } from "react";
import { useFetcher, useLoaderData } from "@remix-run/react";
import { loader } from "./loader";
import { Button } from "@elpassion/taco";
import classNames from "classnames";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";
import { TextInput } from "~/components/form/inputs/text.input";
interface ApiKeyProps {}

export const ApiKey: React.FC<ApiKeyProps> = () => {
  const [isFocused, setIsFocused] = useState(false);
  const { apiKey } = useLoaderData<typeof loader>();
  const { copy, isCopied } = useCopyToClipboard(apiKey.key ?? "");
  const fetcher = useFetcher();

  const onFocus = () => {
    setIsFocused(true);
  };
  const onBlur = () => {
    setIsFocused(false);
  };

  return (
    <section className="text-white">
      <h2 className="text-lg">API Key</h2>
      <p className="text-xs">
        This is your workspace API key. It's required in order to use the Sync
        API endpoints and authorize webhooks.
      </p>

      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex gap-2 items-center">
          <TextInput
            placeholder="Generate API Key..."
            value={apiKey.key ?? ""}
            className="w-[300px]"
            onFocus={onFocus}
            onBlur={onBlur}
            type={isFocused ? "text" : "password"}
          />
          <CopyButton
            onClick={copy}
            isCopied={isCopied}
            disabled={!apiKey.key}
          />
        </div>

        <Button
          size="xs"
          variant="outlined"
          className="!h-[42px]"
          isLoading={fetcher.state !== "idle"}
          onClick={() => fetcher.submit({}, { method: "post" })}
        >
          {apiKey.key ? "Regenerate" : "Generate"}
        </Button>
      </div>
    </section>
  );
};

interface CopyButtonProps {
  onClick: () => void;
  isCopied: boolean;
  disabled?: boolean;
}
function CopyButton({ onClick, isCopied, disabled }: CopyButtonProps) {
  return (
    <Button
      type="button"
      variant="outlined"
      hierarchy="secondary"
      size="xs"
      disabled={disabled}
      onClick={onClick}
      className={classNames("!h-[42px]", {
        "!text-green-600": isCopied,
      })}
    >
      {isCopied ? "Copied" : "Copy"}
    </Button>
  );
}
