import React from 'react';
import * as ReactDom from 'react-dom/client';

import { ConfirmationModal } from './ConfirmationModal';
import type { ConfirmationModalProps } from './ConfirmationModal';

export type ConfirmProps = Omit<ConfirmationModalProps, 'isOpen' | 'onClose'>;

export function confirm(config: ConfirmProps) {
  let destroyFn: (() => void) | null = null;
  const container = document.createDocumentFragment();
  const currentConfig = {
    ...config,
    onClose: close,
    isOpen: true,
  };

  function render() {
    const root = domRender(<ConfirmationModal {...currentConfig} />, container);

    destroyFn = () => root.unmount();
  }

  function close() {
    if (typeof destroyFn === 'function') {
      destroyFn();
    }
  }

  render();
}

function domRender(
  element: React.ReactNode,
  container: DocumentFragment | Element,
) {
  const root = ReactDom.createRoot(container);

  root.render(element);

  return root;
}
