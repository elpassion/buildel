import type { RefObject } from 'react';
import { useCallback, useRef } from 'react';
import type { ReactFlowInstance } from '@xyflow/react';
import { useEventListener } from 'usehooks-ts';

import { BlockConfig } from '~/api/blockType/blockType.contracts';

import type { IBlockConfig, IEdge, INode } from './pipeline.types';

interface UseCopyPasteNodeArgs {
  onPaste: (config: IBlockConfig) => Promise<unknown>;
  nodes: INode[];
  wrapper: RefObject<HTMLElement>;
  allowCopyPaste?: (e: KeyboardEvent) => boolean;
}

export const useCopyPasteNode = ({
  onPaste,
  nodes,
  wrapper,
  allowCopyPaste = () => true,
}: UseCopyPasteNodeArgs) => {
  const mousePosition = useRef({ clientX: 0, clientY: 0 });
  const reactFlowInstance = useRef<ReactFlowInstance<INode, IEdge> | null>(
    null,
  );

  useEventListener('keydown', (e) => {
    if (
      //eslint-disable-next-line
      //@ts-ignore
      e.target.editor !== undefined ||
      e.target instanceof HTMLInputElement ||
      e.target instanceof HTMLTextAreaElement ||
      !allowCopyPaste(e)
    ) {
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'c') {
        const selectedNode = nodes.find((node) => node.selected);

        if (selectedNode) {
          navigator.clipboard.writeText(JSON.stringify(selectedNode));
        }
      }

      if (e.code === 'KeyV') {
        const reactFlowBounds = wrapper.current?.getBoundingClientRect();

        const position = reactFlowInstance.current?.screenToFlowPosition({
          x: mousePosition.current.clientX - reactFlowBounds!.left,
          y: mousePosition.current.clientY - reactFlowBounds!.top,
        });

        navigator.clipboard.readText().then((content) => {
          try {
            const node = JSON.parse(content);

            BlockConfig.parse(node?.data);

            onPaste({
              ...node.data,
              position: position ?? node.position,
            });
          } catch (err) {
            console.error(err);
          }
        });
      }
    }
  });

  const onInit = useCallback((inst: ReactFlowInstance<INode, IEdge>) => {
    reactFlowInstance.current = inst;
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      mousePosition.current = { clientX: e.clientX, clientY: e.clientY };
    },
    [],
  );

  return { onInit, onMouseMove };
};
