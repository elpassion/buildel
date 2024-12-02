import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import { assert } from '~/utils/assert';
import { cn } from '~/utils/cn';

interface PageOverlayProps {
  className?: string;
  containerId?: string;
  onClick?: () => void;
  isShow: boolean;
}
export function PageOverlay({
  className,
  containerId = '_root',
  onClick,
  isShow,
}: PageOverlayProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!document) return;
    const container = document.querySelector(`#${containerId}`);
    assert(container, `${containerId} not present in DOM`);

    setRoot(container as HTMLDivElement);
  }, [containerId]);

  if (!root) return null;
  return (
    <>
      {createPortal(
        <div
          onClick={onClick}
          className={cn(
            'fixed top-0 left-0 right-0 bottom-0 bg-black/80 transition ease-[cubic-bezier(0.25, 1, 0.5, 1)]',
            {
              'opacity-0 pointer-events-none -z-[40]': !isShow,
              'opacity-1 pointer-events-auto z-[40]': isShow,
            },
            className,
          )}
        />,
        root,
      )}
    </>
  );
}
