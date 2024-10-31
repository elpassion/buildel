import React, { useEffect, useImperativeHandle, useState } from 'react';
import { FloatingPortal, useFloating } from '@floating-ui/react';
import {
  autoUpdate,
  flip,
  offset as floatingOffset,
} from '@floating-ui/react-dom';
import type {
  SuggestionKeyDownProps,
  SuggestionProps,
} from '@tiptap/suggestion';

import { cn } from '~/utils/cn';

interface ChatMentionListProps extends SuggestionProps<string> {}
interface ChatMentionListActions {
  onKeyDown: (props: SuggestionKeyDownProps) => void;
}

export const ChatMentionList = ({
  ref,
  clientRect,
  command,
  items,
}: ChatMentionListProps & {
  ref?: React.RefObject<ChatMentionListActions>;
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = items[index];
    if (item) {
      command({ id: item, label: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + items.length - 1) % items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: SuggestionKeyDownProps) => {
      const { key } = event;

      if (key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  const floatingContext = useFloating({
    middleware: [flip(), floatingOffset(5)],
    whileElementsMounted: autoUpdate,
    placement: 'top-start',
  });

  useEffect(() => {
    if (clientRect) {
      const rect = clientRect();

      if (rect) {
        floatingContext.refs.setReference({
          getBoundingClientRect: () => rect,
        });
      }
    }
  }, [clientRect, floatingContext.refs]);

  return (
    <FloatingPortal>
      <div
        ref={floatingContext.refs.setFloating}
        style={floatingContext.floatingStyles}
        className="bg-white border border-input rounded-lg text-sm overflow-hidden"
      >
        {items.length > 0 ? (
          items.map((item, index) => (
            <p
              key={item}
              className={cn('cursor-pointer py-2 px-3 max-w-[250px] truncate', {
                'bg-secondary': index === selectedIndex,
              })}
              title={item}
              onMouseEnter={() => setSelectedIndex(index)}
              onClick={() => selectItem(index)}
            >
              {item}
            </p>
          ))
        ) : (
          <p className="py-1 px-2">No results found</p>
        )}
      </div>
    </FloatingPortal>
  );
};
