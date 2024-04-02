import React, { useMemo, useRef } from "react";
import { ClientOnly } from "remix-utils/client-only";
import { autocompletion } from "@codemirror/autocomplete";
import { xcodeDark } from "@uiw/codemirror-themes-all";
import { langs } from "@uiw/codemirror-extensions-langs";
import ReactCodeMirror, {
  ReactCodeMirrorRef,
  EditorView,
  ReactCodeMirrorProps,
} from "@uiw/react-codemirror";
import { suggestionHighlighter } from "./extensions/suggestionHighlighter";
import { completions } from "./extensions/completions";
import { Suggestion } from "./codeMirror.types";
import "./codeMirror.styles.css";

type EditorLanguage = "tsx" | "json" | "shell" | "custom";

export interface CodeMirrorProps extends ReactCodeMirrorProps {
  suggestions?: Suggestion[];
  language?: EditorLanguage;
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

  const currentLanguage = (lng: EditorLanguage) => {
    switch (lng) {
      case "tsx":
        return langs.tsx();
      case "shell":
        return langs.shell();
      case "json":
      default:
        return langs.json();
    }
  };

  const extensions = useMemo(() => {
    return [
      EditorView.lineWrapping,
      currentLanguage(language),
      suggestionHighlighter(suggestions),
      autocompletion({
        override: [(context) => completions(context, suggestions)],
      }),
    ];
  }, [suggestions.length, language]);

  return (
    <ReactCodeMirror
      ref={editorRef}
      value={value}
      onChange={onChange}
      theme={xcodeDark}
      extensions={extensions}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        indentOnInput: true,
      }}
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
