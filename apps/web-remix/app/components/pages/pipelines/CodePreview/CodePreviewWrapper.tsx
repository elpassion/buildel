import React, { ReactNode } from "react";
import { CodePreviewClient, CodePreviewProps } from "./CodePreview.client";
import { ClientOnly } from "remix-utils/client-only";
interface CodePreviewWrapperProps extends Omit<CodePreviewProps, "children"> {
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

      <ClientOnly
        fallback={
          <div
            className="w-full bg-[#1E1E1E] rounded-xl animate-pulse"
            style={{ height: height }}
          />
        }
      >
        {() => <CodePreviewClient height={height} {...props} />}
      </ClientOnly>
    </div>
  );
};
