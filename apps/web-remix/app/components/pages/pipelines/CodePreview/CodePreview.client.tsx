import React from "react";
import { Editor, EditorProps } from "@monaco-editor/react";

export interface CodePreviewProps
  extends Omit<EditorProps, "height" | "value"> {
  value: string;
  height: number;
}

export const CodePreviewClient: React.FC<CodePreviewProps> = ({
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
        wordWrap: "off",
        readOnly: true,
        domReadOnly: true,
        scrollBeyondLastLine: false,
        lineDecorationsWidth: 0,
        contextmenu: false,
        scrollbar: {
          vertical: "hidden",
          horizontal: "auto",
          horizontalSliderSize: 5,
          verticalScrollbarSize: 7,
          useShadows: true,
        },
        ...options,
      }}
      {...props}
    />
  );
};
