import type { ReactNode } from 'react';
import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';

import { CodePreviewClient } from './CodePreview.client';
import type { CodePreviewProps } from './CodePreview.client';

interface CodePreviewWrapperProps extends Omit<CodePreviewProps, 'children'> {
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

      <div style={{ minHeight: height }}>
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
    </div>
  );
};
