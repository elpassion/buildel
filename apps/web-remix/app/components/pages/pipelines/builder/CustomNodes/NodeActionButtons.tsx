import React, { HTMLProps, useCallback, useEffect, useState } from "react";
import classNames from "classnames";
import { useCopyToClipboard } from "usehooks-ts";
import { Icon } from "@elpassion/taco";

export function NodeCopyButton({ text }: { text: string }) {
  const [_value, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const handleCopy = useCallback(async () => {
    await copy(text);
    setIsCopied(true);
    setTimeoutId(setTimeout(() => setIsCopied(false), 2000));
  }, [text, copy]);

  useEffect(() => {
    if (!timeoutId) return;
    return () => {
      clearTimeout(timeoutId);
    };
  }, [timeoutId]);

  return (
    <NodeActionButton className="w-[52px]" onClick={handleCopy}>
      {isCopied ? null : <Icon iconName="copy" />}
      <span className={classNames({ "text-green-600": isCopied })}>
        {isCopied ? "Copied!" : "Copy"}
      </span>
    </NodeActionButton>
  );
}

export function NodeDownloadButton({
  text,
  blockName,
}: {
  text: string;
  blockName: string;
}) {
  const handleDownload = useCallback(() => {
    const filename = `${blockName}.txt`;
    const textBlob = new Blob([text], { type: "text/plain" });

    const downloadLink = document.createElement("a");
    downloadLink.href = window.URL.createObjectURL(textBlob);
    downloadLink.download = filename;

    downloadLink.click();

    window.URL.revokeObjectURL(downloadLink.href);
  }, [blockName, text]);

  return (
    <NodeActionButton onClick={handleDownload}>
      <Icon iconName="download" />
      <span>Download</span>
    </NodeActionButton>
  );
}

export function NodeActionButton({
  children,
  className,
  type,
  ...rest
}: HTMLProps<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        "text-xs text-neutral-100 rounded px-1 py-[2px] flex items-center gap-1 hover:text-primary-500",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
