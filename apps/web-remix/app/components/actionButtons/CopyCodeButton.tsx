import React from "react";
import classNames from "classnames";
import { Icon } from "@elpassion/taco";
import { useCopyToClipboard } from "~/hooks/useCopyToClipboard";

export function CopyCodeButton({ value }: { value: string }) {
  const { copy, isCopied } = useCopyToClipboard(value ?? "");
  return (
    <button
      type="button"
      onClick={copy}
      className={classNames({
        "text-neutral-300": !isCopied,
        "text-green-500": isCopied,
      })}
    >
      <Icon iconName={isCopied ? "check" : "copy"} />
    </button>
  );
}
