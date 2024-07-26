import React from 'react';
import type { Position } from '@xyflow/react';
import { NodeToolbar } from '@xyflow/react';
import { Code, ListOrdered } from 'lucide-react';

import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { useWysiwygContext } from '~/components/wysiwyg/wysiwygContext';
import { cn } from '~/utils/cn';

interface CommentNodeToolbarProps {
  visible: boolean;
  onChange: ({ color, content }: { color?: string; content?: string }) => void;
  color: string;
}

export const CommentNodeToolbar = ({
  visible,
  onChange,
  color,
}: CommentNodeToolbarProps) => {
  const editor = useWysiwygContext();

  const change = (color: string) => {
    onChange({ color, content: editor?.getHTML() });
  };

  if (!editor) {
    return null;
  }

  return (
    <NodeToolbar
      isVisible={visible}
      position={'top' as Position}
      className="bg-white rounded-lg border border-input flex divide-x overflow-hidden"
    >
      <FontSelect />

      <ColorSelect onChange={change} value={color} />

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        active={editor.isActive('bold')}
        className="font-bold"
      >
        B
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        active={editor.isActive('italic')}
        className="italic"
      >
        I
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        active={editor.isActive('strike')}
        className="line-through"
      >
        S
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        disabled={!editor.can().chain().focus().toggleCodeBlock().run()}
        active={editor.isActive('code')}
      >
        <Code className="w-4 h-4" />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        disabled={!editor.can().chain().focus().toggleOrderedList().run()}
        active={editor.isActive('orderedList')}
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>
    </NodeToolbar>
  );
};

function ToolbarButton({
  children,
  active,
  className,
  ...rest
}: ButtonProps & { active?: boolean }) {
  return (
    <Button
      variant="ghost"
      className={cn('rounded-none', { 'bg-black/10': active }, className)}
      {...rest}
    >
      {children}
    </Button>
  );
}

const FONT_OPTIONS = [
  { value: 'normal', label: 'Normal' },
  { value: '4', label: 'Medium' },
  { value: '3', label: 'Large' },
  { value: '2', label: 'XL' },
  { value: '1', label: '2XL' },
];

function FontSelect() {
  const editor = useWysiwygContext();
  if (!editor) {
    return null;
  }

  const onValueChange = (value: string) => {
    if (value === 'normal') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level: mapToHeadingLevel(value) })
        .run();
    }
  };

  const getCurrentValue = () => {
    if (editor.isActive('paragraph')) {
      return 'normal';
    }
    return editor.getAttributes('heading').level?.toString();
  };

  return (
    <Select onValueChange={onValueChange} value={getCurrentValue()}>
      <ToolbarButton
        asChild
        variant="ghost"
        className="border-0 justify-between "
      >
        <SelectTrigger className="w-[140px] focus:!ring-0 focus:!shadow-none focus:!border-0">
          <SelectValue placeholder="Size" />
        </SelectTrigger>
      </ToolbarButton>
      <SelectContent>
        {FONT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
type Level = 1 | 2 | 3 | 4 | 5 | 6;

function mapToHeadingLevel(value: string) {
  return (Number(value) || 5) as Level;
}

export const DEFAULT_COLOR = '#fecdd3';

const COLORS_OPTIONS = [
  { value: 'transparent', label: 'Transparent' },
  { value: DEFAULT_COLOR, label: 'red' },
  { value: '#bfdbfe', label: 'blue' },
  { value: '#bbf7d0', label: 'green' },
  { value: '#fef9c3', label: 'yellow' },
];

interface ColorSelectProps {
  value?: string;
  onChange: (color: string) => void;
}

function ColorSelect({ value = 'transparent', onChange }: ColorSelectProps) {
  const editor = useWysiwygContext();
  if (!editor) {
    return null;
  }

  return (
    <Select onValueChange={onChange} value={value}>
      <ToolbarButton
        asChild
        variant="ghost"
        className="border-0 justify-between "
      >
        <SelectTrigger className="w-[70px] focus:!ring-0 focus:!shadow-none focus:!border-0">
          <ColorItem value={value} />
        </SelectTrigger>
      </ToolbarButton>
      <SelectContent>
        {COLORS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            <div className="flex gap-1 items-center">
              <ColorItem value={option.value} className={cn('w-3 h-3')} />
              <span>{option.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function ColorItem({
  className,
  style,
  value,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { value: string }) {
  return (
    <div
      style={{
        backgroundColor: value === 'transparent' ? 'auto' : value,
        ...style,
      }}
      className={cn(
        'w-4 h-4 rounded-full',
        {
          'bg-muted': value === 'transparent',
        },
        className,
      )}
      {...rest}
    />
  );
}
