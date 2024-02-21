import React, { useCallback, useEffect, useMemo, useRef } from "react";
import {
  EditorProps,
  OnChange,
  OnMount,
  useMonaco,
} from "@monaco-editor/react";
import {
  IEditor,
  MonacoEditorInput,
  SUGGESTION_REGEX,
} from "./MonacoEditorInput";

export interface MonacoEditorWithSuggestionsProps
  extends Omit<EditorProps, "onChange" | "onMount" | "path"> {
  suggestions?: { value: string; reset: boolean }[];
  onChange?: (value?: string) => void;
  path: string;
}

export const MonacoEditorWithSuggestions: React.FC<
  MonacoEditorWithSuggestionsProps
> = ({ suggestions, onChange, ...rest }) => {
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
          const index = suggestions?.findIndex(
            (sug) => `{{${sug.value}}}` === value
          );

          const isOk = typeof index === "number" && index >= 0;
          const isResettable =
            isOk && suggestions ? suggestions[index].reset : true;

          const optionStyle = () => {
            if (isOk) {
              if (isResettable)
                return "editor-inputs-suggestions-valid-resettable";
              return "editor-inputs-suggestions-valid-non-resettable";
            }

            return "editor-inputs-suggestions-invalid";
          };

          return {
            range: match.range,
            options: {
              isWholeLine: false,
              stickiness: 1,
              inlineClassName: optionStyle(),
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
      onChange?.(value);

      if (!editorRef.current) return;

      clearDecorations(editorRef.current);
      applyDecorations(editorRef.current);
    },
    [applyDecorations, clearDecorations, onChange]
  );

  const preparedSuggestions = useMemo(() => {
    if (!monaco || !suggestions) return [];

    return suggestions.map((sug) => ({
      label: sug.value,
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: `{{${sug.value}}}`,
    }));
  }, [monaco, suggestions]);

  useEffect(() => {
    if (!monaco) return;
    //register language
    monaco.languages.register({ id: rest.path });

    //register suggestions
    const completionProvider = monaco.languages.registerCompletionItemProvider(
      rest.path,
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

  return (
    <MonacoEditorInput
      {...rest}
      language={rest.path}
      onChange={handleOnChange}
      onMount={handleOnMount}
    />
  );
};
