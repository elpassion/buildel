import type { ReactNode } from 'react';
import React, { useMemo, useRef } from 'react';
import { autocompletion } from '@codemirror/autocomplete';
import { langs } from '@uiw/codemirror-extensions-langs';
import { basicLight } from '@uiw/codemirror-themes-all';
import ReactCodeMirror, { EditorView } from '@uiw/react-codemirror';
import type {
  ReactCodeMirrorProps,
  ReactCodeMirrorRef,
} from '@uiw/react-codemirror';
import { ClientOnly } from 'remix-utils/client-only';

import type { Suggestion } from './codeMirror.types';
import { completions } from './extensions/completions';
import { suggestionHighlighter } from './extensions/suggestionHighlighter';

import './codeMirror.styles.css';

import { AlignLeft } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { cn } from '~/utils/cn';

export type EditorLanguage = 'tsx' | 'json' | 'shell' | 'html' | 'custom';

export interface CodeMirrorProps extends ReactCodeMirrorProps {
  suggestions?: Suggestion[];
  language?: EditorLanguage;
  onChange?: (value?: string) => void;
  loading?: ReactNode;
  wrapLines?: boolean;
}

export const CodeMirror: React.FC<CodeMirrorProps> = ({
  value,
  onChange,
  suggestions = [],
  language = 'tsx',
  wrapLines = true,
  ...rest
}) => {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  const currentLanguage = (lng: EditorLanguage) => {
    switch (lng) {
      case 'tsx':
        return langs.tsx();
      case 'shell':
        return langs.shell();
      case 'html':
        return langs.html();
      case 'json':
      default:
        return langs.json();
    }
  };

  const extensions = useMemo(() => {
    const ext = [
      currentLanguage(language),
      suggestionHighlighter(suggestions),
      autocompletion({
        override: [(context) => completions(context, suggestions)],
      }),
    ];

    if (wrapLines) {
      ext.push(EditorView.lineWrapping);
    }

    return ext;
  }, [suggestions.length, language, wrapLines]);

  const formatCode = () => {
    if (!value) return;
    try {
      const obj = JSON.parse(value);
      const newValue = JSON.stringify(obj, null, 2);
      onChange?.(newValue);
    } catch (error) {}
  };

  return (
    <div className="relative">
      <ReactCodeMirror
        ref={editorRef}
        value={value}
        onChange={onChange}
        theme={basicLight}
        extensions={extensions}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          indentOnInput: true,
        }}
        {...rest}
      />
      {language === 'json' && (
        <IconButton
          size="xxs"
          onlyIcon
          type="button"
          onClick={formatCode}
          icon={<AlignLeft />}
          className={cn('h-fit absolute bottom-1 right-1 text-black', {})}
        />
      )}
    </div>
  );
};

const ClientCodeMirror: React.FC<CodeMirrorProps> = ({
  height = '150px',
  loading,
  ...rest
}) => {
  return (
    <div style={{ minHeight: height }} className="w-full">
      <ClientOnly
        fallback={
          loading ?? (
            <div
              style={{ minHeight: height }}
              className="w-full border border-input"
            />
          )
        }
      >
        {() => <CodeMirror height={height} {...rest} />}
      </ClientOnly>
    </div>
  );
};

export { ClientCodeMirror as Editor };
