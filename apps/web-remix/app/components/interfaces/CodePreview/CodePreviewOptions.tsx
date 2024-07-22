import React, { useMemo, useRef, useState } from 'react';

import { CopyCodeButton } from '~/components/actionButtons/CopyCodeButton';
import type { EditorLanguage } from '~/components/editor/CodeMirror/CodeMirror';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

import { CodePreviewWrapper } from './CodePreviewWrapper';

interface CodePreviewOptionsProps {
  options: {
    id: number;
    framework: string;
    value: string;
    height: number;
    language?: EditorLanguage;
  }[];
}

export const CodePreviewOptions: React.FC<CodePreviewOptionsProps> = ({
  options,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState(options[0].id.toString());

  const onChange = (value: string) => {
    setActiveKey(value);
  };

  const activeOption = useMemo(() => {
    return options.find((opt) => opt.id.toString() === activeKey);
  }, [activeKey, options]);

  return (
    <CodePreviewWrapper
      language={activeOption?.language ?? 'tsx'}
      value={activeOption?.value ?? ''}
      height={activeOption?.height ?? 60}
    >
      {() => (
        <>
          <div className="relative w-fit mb-1" ref={wrapperRef}>
            <Select value={activeKey} onValueChange={onChange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => {
                  return (
                    <SelectItem
                      value={option.id.toString()}
                      key={`${option.id}`}
                    >
                      {option.framework}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <CopyCodeButton value={activeOption?.value ?? ''} />
        </>
      )}
    </CodePreviewWrapper>
  );
};
