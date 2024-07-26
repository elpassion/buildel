import { useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import type { Connection, OnConnectStartParams } from '@xyflow/react';
import { useReactFlow } from '@xyflow/react';
import { useBoolean, useOnClickOutside } from 'usehooks-ts';

import type { loader } from '~/components/pages/pipelines/build/loader.server';
import type {
  IBlockConfig,
  IBlockType,
  IBlockTypes,
  IEdge,
  IIOType,
  INode,
} from '~/components/pages/pipelines/pipeline.types';
import { errorToast } from '~/components/toasts/errorToast';

import { leaveOneGroup } from './createNodeDropdownt.utils';

export interface Position {
  x: number;
  y: number;
  target?:
    | 'pane'
    | 'handle-top'
    | 'handle-bottom'
    | 'handle-left'
    | 'handle-right';
}

interface UseNodeDropdownArgs {
  onConnect: (connection: Connection) => void;
  onCreate: (created: IBlockConfig) => Promise<INode>;
  disabled?: boolean;
}

export const useNodeDropdown = ({
  onCreate,
  onConnect,
  disabled,
}: UseNodeDropdownArgs) => {
  const connectParamsRef = useRef<OnConnectStartParams | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { value: isOpen, setTrue: open, setFalse: close } = useBoolean(false);

  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [node, setNode] = useState<INode | null>(null);

  const flowInstance = useReactFlow<INode, IEdge>();

  const { blockTypes } = useLoaderData<typeof loader>();

  const onClose = () => {
    close();
    setNode(null);
    connectParamsRef.current = null;
  };

  useOnClickOutside(dropdownRef, onClose);

  const onConnectStart = (_: unknown, params: OnConnectStartParams) => {
    if (disabled) return;

    connectParamsRef.current = params;

    if (params.nodeId) {
      setNode(flowInstance.getNode(params.nodeId) ?? null);
    }
  };

  const onConnectEnd = (e: MouseEvent | TouchEvent) => {
    if (disabled) return;

    if (e.target instanceof HTMLElement && isMouseEvent(e)) {
      const isPanTarget = e.target.classList.contains('react-flow__pane');
      const isHandleTarget = e.target.classList.contains('react-flow__handle');
      if (isPanTarget) {
        setPosition({ x: e.clientX, y: e.clientY - 100, target: 'pane' });
      } else if (isHandleTarget) {
        if (e.target.dataset['nodeid'] !== connectParamsRef.current?.nodeId) {
          return;
        }

        const isLeftHandle = e.target.classList.contains(
          'react-flow__handle-left',
        );
        const isRightHandle = e.target.classList.contains(
          'react-flow__handle-right',
        );
        const isTopHandle = e.target.classList.contains(
          'react-flow__handle-top',
        );

        if (isLeftHandle) {
          setPosition({
            x: e.clientX - 200,
            y: e.clientY,
            target: 'handle-left',
          });
        } else if (isRightHandle) {
          setPosition({ x: e.clientX, y: e.clientY, target: 'handle-right' });
        } else if (isTopHandle) {
          setPosition({ x: e.clientX, y: e.clientY, target: 'handle-top' });
        } else {
          setPosition({ x: e.clientX, y: e.clientY, target: 'handle-bottom' });
        }
      } else {
        return;
      }

      open();
    }
  };

  const onContextMenu = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (disabled) return;

    e.preventDefault();

    if (e.target instanceof HTMLElement) {
      const isPanTarget = e.target.classList.contains('react-flow__pane');

      if (!isPanTarget) return;
    }

    setPosition({
      x: e.clientX,
      y: e.clientY,
    });

    open();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.pointerEvents = 'none';
      document.body.setAttribute('data-scroll-locked', '1');
      document
        .querySelectorAll('.react-flow__node, .react-flow__handle')
        .forEach(
          (node) => ((node as HTMLElement).style.pointerEvents = 'none'),
        );
    } else {
      document.body.style.removeProperty('pointer-events');
      document.body.removeAttribute('data-scroll-locked');
      document
        .querySelectorAll('.react-flow__node, .react-flow__handle')
        .forEach((node) => ((node as HTMLElement).style.pointerEvents = 'all'));
    }
  }, [isOpen]);

  const nodeHandle = useMemo(() => {
    if (!node || !connectParamsRef.current) return;

    if (
      connectParamsRef.current.handleId === 'tool' ||
      connectParamsRef.current.handleId === 'chat'
    ) {
      return node.data.block_type?.ios.find(
        (handle) =>
          handle.name === connectParamsRef.current!.handleId && !handle.public,
      );
    } else if (connectParamsRef.current.handleType === 'target') {
      return node.data.block_type?.inputs.find(
        (handle) =>
          handle.name === connectParamsRef.current!.handleId && !handle.public,
      );
    } else {
      return node.data.block_type?.outputs.find(
        (handle) =>
          handle.name === connectParamsRef.current!.handleId && !handle.public,
      );
    }
  }, [node]);

  const create = async (block: IBlockType) => {
    try {
      const createdNode = await onCreate({
        name: '',
        opts: {},
        inputs: [],
        type: block.type,
        block_type: block,
        position: flowInstance.screenToFlowPosition(getNodePosition(position)),
        connections: [],
      });

      if (!node || !connectParamsRef.current || !nodeHandle) return onClose();

      let connection: Connection | null = null;

      if (nodeHandle.type === 'controller') {
        const handle = getHandle(block.ios, { type: 'worker' });

        if (!handle) throw new Error('Cannot create connection');

        connection = {
          target: connectParamsRef.current.nodeId ?? node.id,
          targetHandle: connectParamsRef.current.handleId,
          source: createdNode.id,
          sourceHandle: handle.name,
        };
      } else if (nodeHandle.type === 'worker') {
        const handle = getHandle(block.ios, { type: 'controller' });
        if (!handle) throw new Error('Cannot create connection');

        connection = {
          source: connectParamsRef.current.nodeId ?? node.id,
          sourceHandle: connectParamsRef.current.handleId,
          target: createdNode.id,
          targetHandle: handle.name,
        };
      } else if (connectParamsRef.current.handleType === 'source') {
        const handle = getHandle(block.inputs, nodeHandle);

        if (!handle) throw new Error('Cannot create connection');

        connection = {
          source: connectParamsRef.current.nodeId ?? node.id,
          sourceHandle: connectParamsRef.current.handleId,
          target: createdNode.id,
          targetHandle: handle.name,
        };
      } else {
        const handle = getHandle(block.outputs, nodeHandle);

        if (!handle) throw new Error('Cannot create connection');

        connection = {
          target: connectParamsRef.current.nodeId ?? node.id,
          targetHandle: connectParamsRef.current.handleId,
          source: createdNode.id,
          sourceHandle: handle.name,
        };
      }

      onConnect(connection);

      onClose();
    } catch (e) {
      if (e instanceof Error) {
        errorToast({ description: e.message });
      } else {
        errorToast({ description: 'Cannot create block' });
      }
      onClose();
    }
  };

  const filteredBlockTypes = useMemo(() => {
    if (!nodeHandle || !connectParamsRef.current) return blockTypes;

    if (nodeHandle.type === 'controller') {
      return blockTypes.filter((block) =>
        block.ios.some((output) => output.type === 'worker' && !output.public),
      );
    } else if (nodeHandle.type === 'worker') {
      return blockTypes.filter((block) =>
        block.ios.some(
          (output) => output.type === 'controller' && !output.public,
        ),
      );
    } else if (connectParamsRef.current.handleType === 'target') {
      return blockTypes.filter((block) =>
        block.outputs.some(
          (output) => output.type === nodeHandle.type && !output.public,
        ),
      );
    } else {
      return blockTypes.filter((block) =>
        block.inputs.some(
          (input) => input.type === nodeHandle.type && !input.public,
        ),
      );
    }
  }, [nodeHandle, blockTypes]);

  const blockGroups = useMemo(
    () =>
      leaveOneGroup(filteredBlockTypes).reduce(
        (groups, blockType) => {
          blockType.groups.forEach((group) => {
            if (!groups[group]) {
              groups[group] = [] as IBlockTypes;
            }
            groups[group].push(blockType as IBlockType);
          });

          return groups;
        },
        {} as Record<string, IBlockTypes>,
      ),
    [filteredBlockTypes],
  );

  return {
    onConnectEnd,
    onConnectStart,
    onContextMenu,
    ref: dropdownRef,
    blockGroups,
    position,
    isOpen,
    create,
  };
};

function isMouseEvent(e?: MouseEvent | TouchEvent): e is MouseEvent {
  return e instanceof MouseEvent;
}

function getHandle(ios: IIOType[], handle: { type: string }) {
  return ios.find((io) => io.type === handle.type && !io.public);
}

function getNodePosition(position: Position) {
  if (!position.target || position.target === 'pane') {
    return { ...position, x: position.x - 100 };
  } else if (position.target === 'handle-left') {
    return { ...position, x: position.x - 200 };
  } else if (position.target === 'handle-right') {
    return { ...position, x: position.x + 100 };
  } else if (position.target === 'handle-top') {
    return { ...position, y: position.y - 200 };
  } else {
    return { ...position, y: position.y + 100 };
  }
}
