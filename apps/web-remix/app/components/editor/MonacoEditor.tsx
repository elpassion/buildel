import React, { useCallback, useEffect, useMemo, useRef } from "react";
import type { EditorProps, OnMount, OnChange } from "@monaco-editor/react";
import { Editor, useMonaco } from "@monaco-editor/react";

export const BUILDEL_LANGUAGE = "buildel";
export const SUGGESTION_REGEX = "\\{\\{[^\\s]+\\}\\}";

export type IEditor = Parameters<OnMount>[0];
export interface MonacoEditorProps
  extends Partial<Omit<EditorProps, "onMount" | "onChange">> {
  suggestions?: string[];
  onChange?: (value?: string) => void;
}
export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  suggestions,
  onChange,
  ...props
}) => {
  const editorRef = useRef<IEditor | null>(null);
  const monaco = useMonaco();

  const clearDecorations = useCallback((editor: IEditor) => {
    const model = editor.getModel();

    if (!model) return;

    const oldDecorations = model.getAllDecorations();
    const oldDecorationIds = oldDecorations.map((decoration) => decoration.id);
    model.deltaDecorations(oldDecorationIds, []);
  }, []);

  const applyDecorations = useCallback(
    (editor: IEditor) => {
      const model = editor.getModel();

      if (!model) return;

      const matches = model.findMatches(
        SUGGESTION_REGEX,
        false,
        true,
        false,
        null,
        false
      );

      if (!matches) return;

      model.deltaDecorations(
        [],
        matches.map((match) => {
          const value = model.getValueInRange(match.range);
          const isOk = suggestions?.map((sug) => `{{${sug}}}`).includes(value);
          return {
            range: match.range,
            options: {
              isWholeLine: false,
              stickiness: 1,
              inlineClassName: isOk
                ? "editor-inputs-suggestions-valid"
                : "editor-inputs-suggestions-invalid",
            },
          };
        })
      );
    },
    [suggestions]
  );

  const handleOnMount: OnMount = useCallback(
    (editor) => {
      editorRef.current = editor;
      clearDecorations(editor);
      applyDecorations(editor);
    },
    [applyDecorations, clearDecorations]
  );

  const handleOnChange: OnChange = useCallback(
    (value?: string) => {
      if (!editorRef.current) return;

      clearDecorations(editorRef.current);
      applyDecorations(editorRef.current);

      onChange?.(value);
    },
    [applyDecorations, clearDecorations]
  );

  const preparedSuggestions = useMemo(() => {
    if (!monaco || !suggestions) return [];

    return suggestions.map((sug) => ({
      label: sug,
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: `{{${sug}}}`,
    }));
  }, [monaco, suggestions]);

  useEffect(() => {
    if (!monaco) return;
    //register language
    monaco.languages.register({ id: BUILDEL_LANGUAGE });

    //register suggestions
    const completionProvider = monaco.languages.registerCompletionItemProvider(
      BUILDEL_LANGUAGE,
      {
        provideCompletionItems: function (model, position) {
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn,
          };
          return {
            suggestions: preparedSuggestions.map((suggestion) => ({
              ...suggestion,
              range,
            })),
          };
        },
      }
    );

    return () => {
      completionProvider.dispose();
    };
  }, [monaco, preparedSuggestions]);

  //DOCS here - https://microsoft.github.io/monaco-editor/typedoc/interfaces/editor.IStandaloneEditorConstructionOptions.html#minimap
  return (
    <Editor
      className="overflow-hidden border border-neutral-200 rounded p-1"
      defaultLanguage={BUILDEL_LANGUAGE}
      onChange={handleOnChange}
      onMount={handleOnMount}
      options={{
        lineNumbers: "off",
        glyphMargin: false,
        folding: false,
        lineDecorationsWidth: 0,
        minimap: { enabled: false },
        scrollbar: {
          verticalScrollbarSize: 7,
        },
      }}
      {...props}
    />
  );
};
