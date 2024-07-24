import { useEffect, useRef, useState } from 'react';
import type { OnConnectStartParams } from '@xyflow/react';
import { useBoolean, useOnClickOutside } from 'usehooks-ts';

export const useNodeDropdown = () => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { value: isOpen, setTrue: open, setFalse: close } = useBoolean(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [connectParams, setConnectParams] =
    useState<OnConnectStartParams | null>(null);

  const onClose = () => {
    close();
    setConnectParams(null);
  };

  const onConnectStart = (_: unknown, params: OnConnectStartParams) => {
    setConnectParams(params);
  };

  const onConnectEnd = (e: MouseEvent | TouchEvent) => {
    if (e.target instanceof HTMLElement) {
      const isPanTarget = e.target.classList.contains('react-flow__pane');

      if (!isPanTarget || !isMouseEvent(e)) return;

      setPosition({ x: e.clientX, y: e.clientY - 100 });

      open();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.pointerEvents = 'none';
      document.body.setAttribute('data-scroll-locked', '1');
    } else {
      document.body.style.removeProperty('pointer-events');
      document.body.removeAttribute('data-scroll-locked');
    }
  }, [isOpen]);

  useOnClickOutside(dropdownRef, onClose);

  return {
    onConnectEnd,
    onConnectStart,
    position,
    isOpen,
    onClose,
    ref: dropdownRef,
    connectParams,
  };
};

function isMouseEvent(e: MouseEvent | TouchEvent): e is MouseEvent {
  return e instanceof MouseEvent;
}
