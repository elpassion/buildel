import React, { useRef } from 'react';

export const useResizeElement = <T extends HTMLElement>() => {
  const ref = useRef<T | null>(null);

  const onMousedown = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const element = ref.current;
    const startY = e.clientY;
    const startHeight = element.getBoundingClientRect().height;

    const onMouseMove = (e: MouseEvent) => {
      element.style.height = `${startHeight - e.clientY + startY}px`;
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return { ref, onMousedown };
};
