import React, { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';

import { IconButton } from '~/components/iconButton';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { cn } from '~/utils/cn';
import { hashString } from '~/utils/stringHash';

interface FloatingContentWrapperProps {
  onClose: () => void;
  className?: string;
  suffix?: string;
  defaultPosition?: { right: number; bottom: number };
}

export function FloatingDynamicWrapper({
  children,
  onClose,
  className,
  suffix = 'chat',
  defaultPosition = { right: 16, bottom: 16 },
}: PropsWithChildren<FloatingContentWrapperProps>) {
  const organizationId = useOrganizationId();
  const pipelineId = usePipelineId();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rel, setRel] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useLocalStorage(
    hashString(
      `buildel-${organizationId}-${pipelineId}-${suffix}-position`,
    ).toString(),
    defaultPosition,
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (e.button !== 0) return;

    e.stopPropagation();
    e.preventDefault();

    if (!wrapperRef.current) return;

    const elem = wrapperRef.current.getBoundingClientRect();

    setRel({
      x: e.clientX - elem.left,
      y: e.clientY - elem.top,
    });
    setDragging(true);
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    setDragging(false);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging) return;

    e.stopPropagation();
    e.preventDefault();

    if (e.target instanceof HTMLElement) {
      if (!wrapperRef.current) return;

      setPosition({
        right:
          window.innerWidth -
          e.clientX -
          (wrapperRef.current.offsetWidth - rel.x),
        bottom:
          window.innerHeight -
          e.clientY -
          (wrapperRef.current.offsetHeight - rel.y),
      });
    }
  };

  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  return (
    <div
      ref={wrapperRef}
      style={{ right: `${position.right}px`, bottom: `${position.bottom}px` }}
      className={cn(
        'fixed z-[2] pointer-events-auto w-fit h-fit min-w-[500px] min-h-[400px] bg-muted rounded-lg flex justify-center items-center border border-input overflow-hidden',
        className,
      )}
    >
      <div className={cn({ 'pointer-events-none': dragging })}>{children}</div>

      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 left-0 ring-0 w-full h-[50px] bg-transparent cursor-grab"
      />

      <IconButton
        icon={<X />}
        onClick={onClose}
        className="absolute top-1 right-1"
        variant="outline"
        size="xxxs"
      />
    </div>
  );
}
