import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import classNames from "classnames";
import { assert } from "~/utils/assert";

interface PageOverlayProps {
  className?: string;
  containerId?: string;
}
export function PageOverlay({
  className,
  containerId = "_root",
}: PageOverlayProps) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!document) return;
    const container = document.querySelector(`#${containerId}`);
    assert(container, `${containerId} not present in DOM`);

    setRoot(container as HTMLDivElement);
  }, [containerId]);

  if (!root) return null;
  return createPortal(
    <div
      className={classNames(
        "fixed top-0 left-0 right-0 bottom-0 bg-black/80",
        className
      )}
    />,
    root
  );
}
