import type React from 'react';
import { useCallback, useRef, useState } from 'react';

function preventDefault(e: Event) {
  if (!isTouchEvent(e)) return;

  if (e.touches.length < 2 && e.preventDefault) {
    e.preventDefault();
  }
}

export function isTouchEvent(e: Event): e is TouchEvent {
  return e && 'touches' in e;
}

interface PressHandlers<T> {
  onLongPress: (e: React.MouseEvent<T> | React.TouchEvent<T>) => void;
  onClick?: (e: React.MouseEvent<T> | React.TouchEvent<T>) => void;
}

interface Options {
  delay?: number;
  shouldPreventDefault?: boolean;
}

export function useLongPress<T>(
  { onLongPress, onClick }: PressHandlers<T>,
  { delay = 300, shouldPreventDefault = true }: Options = {},
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef<NodeJS.Timeout>(null);
  const target = useRef<EventTarget>(null);
  const isMoving = useRef(false);

  const start = useCallback(
    (e: React.MouseEvent<T> | React.TouchEvent<T>) => {
      e.persist();

      isMoving.current = false;

      const clonedEvent = { ...e };

      if (shouldPreventDefault && e.target) {
        e.target.addEventListener('touchend', preventDefault, {
          passive: false,
        });
        target.current = e.target;
      }

      timeout.current = setTimeout(() => {
        if (isMoving.current) return;
        onLongPress(clonedEvent);
        setLongPressTriggered(true);
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault],
  );

  const clear = useCallback(
    (
      e: React.MouseEvent<T> | React.TouchEvent<T>,
      shouldTriggerClick = true,
    ) => {
      timeout.current && clearTimeout(timeout.current);
      shouldTriggerClick &&
        !longPressTriggered &&
        !isMoving.current &&
        onClick?.(e);

      setLongPressTriggered(false);

      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener('touchend', preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered],
  );

  const move = useCallback((_e: React.MouseEvent<T> | React.TouchEvent<T>) => {
    isMoving.current = true;
  }, []);

  return {
    onMouseDown: (e: React.MouseEvent<T>) => start(e),
    onTouchStart: (e: React.TouchEvent<T>) => start(e),
    onTouchMove: (e: React.TouchEvent<T>) => move(e),
    onMouseUp: (e: React.MouseEvent<T>) => clear(e),
    onMouseLeave: (e: React.MouseEvent<T>) => clear(e, false),
    onTouchEnd: (e: React.TouchEvent<T>) => clear(e),
  };
}
