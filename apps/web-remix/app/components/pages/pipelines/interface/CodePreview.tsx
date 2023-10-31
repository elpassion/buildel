import React from "react";
import { Editor, EditorProps } from "@monaco-editor/react";
interface CodePreviewProps extends Omit<EditorProps, "height" | "value"> {
  value: string;
  height: number;
}

export const CodePreview: React.FC<CodePreviewProps> = ({
  options,
  ...props
}) => {
  return (
    <Editor
      loading={
        <div
          className="w-full bg-[#1E1E1E] rounded-xl animate-pulse"
          style={{ height: props.height }}
        />
      }
      className="rounded-xl overflow-hidden"
      language="javascript"
      theme="vs-dark"
      options={{
        padding: {
          top: 8,
          bottom: 8,
        },
        lineNumbers: "on",
        glyphMargin: true,
        folding: true,
        minimap: { enabled: false },
        wordWrap: "on",
        readOnly: true,
        domReadOnly: true,
        scrollBeyondLastLine: false,
        lineDecorationsWidth: 0,
        scrollbar: {
          vertical: "hidden",
          verticalScrollbarSize: 7,
          useShadows: true,
        },
        ...options,
      }}
      {...props}
    />
  );
};
