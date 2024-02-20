import React, { ReactNode } from "react";
import { CodePreviewClient, CodePreviewProps } from "./CodePreview.client";
import { ClientOnly } from "remix-utils/client-only";
interface CodePreviewWrapperProps extends CodePreviewProps {
  children?: (value: string) => ReactNode;
}

export const CodePreviewWrapper: React.FC<CodePreviewWrapperProps> = ({
  children,
  height,
  ...props
}) => {
  return (
    <div>
      <div className="flex gap-2 justify-end px-1">
        {children?.(props.value)}
      </div>

      <ClientOnly fallback={<div style={{ minHeight: `${height}px` }} />}>
        {() => <CodePreviewClient height={height} {...props} />}
      </ClientOnly>
    </div>
  );
};
