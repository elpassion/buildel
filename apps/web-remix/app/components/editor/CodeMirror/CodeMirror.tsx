import React, { useCallback, useRef } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { copilot } from "@uiw/codemirror-themes-all";
import { langs, LanguageName } from "@uiw/codemirror-extensions-langs";
import ReactCodeMirror, {
  ReactCodeMirrorRef,
  EditorView,
  ReactCodeMirrorProps,
} from "@uiw/react-codemirror";
import { suggestionHighlighter } from "./extensions/suggestionHighlighter";
import { completions } from "./extensions/completions";
import { Suggestion } from "./codeMirror.types";
import "./codeMirror.styles.css";

export interface CodeMirrorProps extends ReactCodeMirrorProps {
  suggestions?: Suggestion[];
  language?: "tsx" | "json";
  onChange: (value?: string) => void;
}

const CodeMirror: React.FC<CodeMirrorProps> = ({
  value,
  onChange,
  suggestions = [],
  language = "tsx",
  ...rest
}) => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const suggestionCompletions = useCallback((context: CompletionContext) => {
    return completions(context, suggestions);
  }, []);

  const currentLanguage = (lng: LanguageName) => {
    switch (lng) {
      case "json":
        return langs.json();
      default:
        return langs.tsx();
    }
  };

  return (
    <ReactCodeMirror
      ref={editorRef}
      value={value}
      onChange={onChange}
      theme={copilot}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        indentOnInput: true,
      }}
      extensions={[
        EditorView.lineWrapping,
        currentLanguage(language),
        autocompletion({ override: [suggestionCompletions] }),
        suggestionHighlighter(
          suggestions.map((suggestion) => suggestion.label)
        ),
      ]}
      {...rest}
    />
  );
};

const ClientCodeMirror: React.FC<CodeMirrorProps> = ({
  height = "150px",
  ...rest
}) => {
  return (
    <div style={{ minHeight: height }} className="w-full">
      <ClientOnly
        fallback={
          <div
            style={{ minHeight: height }}
            className="w-full border border-neutral-200"
          />
        }
      >
        {() => <CodeMirror height={height} {...rest} />}
      </ClientOnly>
    </div>
  );
};

export { ClientCodeMirror as Editor };
