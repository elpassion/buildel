import React from "react";
import type { EditorProps, OnMount } from "@monaco-editor/react";
import { Editor } from "@monaco-editor/react";

export const SUGGESTION_REGEX = "\\{\\{[^\\s]+\\}\\}";

export type IEditor = Parameters<OnMount>[0];

export const MonacoEditorInput: React.FC<EditorProps> = ({
  options,
  ...props
}) => {
  //DOCS here - https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneEditorConstructionOptions.html#minimap
  return (
    <Editor
      className="monaco-editor-input"
      options={{
        padding: {
          top: 8,
          bottom: 8,
        },
        lineNumbers: "off",
        glyphMargin: false,
        folding: false,
        lineDecorationsWidth: 0,
        minimap: { enabled: false },
        wordWrap: "on",
        renderLineHighlight: "none",
        scrollbar: {
          verticalScrollbarSize: 7,
          useShadows: false,
        },
        ...options,
      }}
      {...props}
    />
  );
};
