import React from 'react';
import { ClientOnly } from 'remix-utils/client-only';
import { useEventListener, useLocalStorage } from 'usehooks-ts';

import { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { cn } from '~/utils/cn';
import { hashString } from '~/utils/stringHash';

import {
  BuilderSidebarContext,
  BuilderSidebarState,
  useBuilderSidebar,
} from './BuilderSidebar.context';
import { BuilderSidebarBlocks } from './BuilderSidebarBlocks';

interface BuilderSidebarProps {
  onBlockCreate: (created: IBlockConfig) => Promise<unknown>;
}

// Bypass for getting rid of the hydration error when using the LS
export const BuilderSidebar = (props: BuilderSidebarProps) => {
  return (
    <ClientOnly fallback={null}>
      {() => <BuilderSidebarClient {...props} />}
    </ClientOnly>
  );
};

const BuilderSidebarClient = ({ onBlockCreate }: BuilderSidebarProps) => {
  const organizationId = useOrganizationId();

  const [state, setState] = useLocalStorage<BuilderSidebarState>(
    buildLSKey(organizationId),
    'keepOpen',
  );

  const onMouseOver = () => {
    if (state === 'keepOpen') return;
    setState('open');
  };

  const onMouseLeave = () => {
    if (state === 'keepOpen') return;
    setState('closed');
  };

  const onPinClick = () => {
    if (state === 'keepOpen') {
      setState('open');
    } else {
      setState('keepOpen');
    }
  };

  const onClose = () => {
    setState('closed');
  };

  const isOpen = state === 'open' || state === 'keepOpen';

  useEventListener('keydown', (e) => {
    if (
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    if (
      e.target instanceof HTMLElement &&
      e.target.classList.contains('tiptap')
    ) {
      return;
    }

    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      onMouseOver();
    }

    if (e.key === 'Escape' || e.key === 'escape') {
      onMouseLeave();
    }
  });

  return (
    <BuilderSidebarContext.Provider
      value={{ isOpen, state, onPinClick, onClose }}
    >
      <div onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
        <HoverableLine />

        <div
          className={cn(
            'absolute top-0 left-0 z-[11] h-full w-[320px] border-r border-input py-4 px-2 bg-white transition-transform ease-in-out',
            {
              '-translate-x-full': !isOpen,
              'translate-x-0': isOpen,
            },
          )}
        >
          <BuilderSidebarBlocks onCreate={onBlockCreate} />
        </div>
      </div>
    </BuilderSidebarContext.Provider>
  );
};

function HoverableLine() {
  const { isOpen } = useBuilderSidebar();

  return (
    <div className="w-3 h-full absolute top-0 left-0 z-[11] flex justify-center items-center">
      <div
        className={cn(
          'h-6 w-1 bg-primary rounded-full transition-opacity delay-300',
          {
            'opacity-0': isOpen,
            'opacity-100': !isOpen,
          },
        )}
      />
    </div>
  );
}

function buildLSKey(organizationId: string) {
  return hashString('builder-sidebar-' + organizationId).toString();
}
