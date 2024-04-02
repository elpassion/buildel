import React from "react";
import { vscodeDark } from "@uiw/codemirror-themes-all";
import {
  CodeMirrorProps,
  CodeMirror,
} from "~/components/editor/CodeMirror/CodeMirror";
export interface CodePreviewProps
  extends Omit<CodeMirrorProps, "height" | "value"> {
  value: string;
  height: number;
}

export const CodePreviewClient: React.FC<CodePreviewProps> = ({
  height,
  ...props
}) => {
  return (
    <CodeMirror
      editable={false}
      wrapLines={false}
      height={`${height}px`}
      theme={vscodeDark}
      className="rounded-xl overflow-hidden !text-[13px]"
      {...props}
    />
  );
};
