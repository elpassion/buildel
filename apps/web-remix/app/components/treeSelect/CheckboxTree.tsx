import type { PropsWithChildren } from 'react';
import React, { useCallback, useReducer } from 'react';
import { ChevronDown } from 'lucide-react';

import { CheckboxInput } from '~/components/form/inputs/checkbox.input';
import { IconButton } from '~/components/iconButton';
import { treeReducer } from '~/components/treeSelect/Tree.reducer';
import type {
  TreeModelNode,
  TreeNodeType,
} from '~/components/treeSelect/Tree.types';
import type { TreeModelProps } from '~/components/treeSelect/TreeModel';
import { TreeModel } from '~/components/treeSelect/TreeModel';
import { cn } from '~/utils/cn';

interface CheckboxTreeProps<T> extends TreeModelProps {
  nodes: TreeNodeType<T>[];
  onCheckedChange?: (values: string[]) => void;
}

export const CheckboxTree = <T = {},>({
  nodes,
  onCheckedChange,
  defaultExpanded,
  ignoreParents = true,
}: CheckboxTreeProps<T>) => {
  const [state, dispatch] = useReducer(treeReducer<T>, {
    model: (() => {
      const model = new TreeModel<T>({ defaultExpanded, ignoreParents });
      model.flattenNodes(nodes);
      return model;
    })(),
  });

  const onCheck = useCallback(
    (node: TreeModelNode<T>, checked: boolean) => {
      const cloned = state.model.clone();
      cloned.setChecked(node, checked);

      onCheckedChange?.(cloned.checkedNodes);

      dispatch({ type: 'SET_MODEL', payload: cloned });
    },
    [onCheckedChange, state.model],
  );

  const onExpand = useCallback(
    (node: TreeModelNode<T>, expanded: boolean) => {
      const cloned = state.model.clone();
      cloned.setExpanded(node, expanded);

      dispatch({ type: 'SET_MODEL', payload: cloned });
    },
    [state.model],
  );

  const renderNodes = useCallback(
    (nodes: TreeNodeType<T>[]) => {
      return nodes.map((node) => {
        const flatNode = state.model.getNode(node.value);

        if (!flatNode) return null;

        const children = renderNodes(flatNode.children ?? []);

        return (
          <Node
            key={node.value}
            node={flatNode}
            onCheck={onCheck}
            onExpand={onExpand}
          >
            <NodeInnerWrapper node={flatNode}>{children}</NodeInnerWrapper>
          </Node>
        );
      });
    },
    [state.model, onCheck, onExpand],
  );

  return <div className="flex flex-col gap-1">{renderNodes(nodes)}</div>;
};

type NodeProps<T> = {
  node: TreeModelNode<T>;
  onCheck: (node: TreeModelNode<T>, checked: boolean) => void;
  onExpand: (node: TreeModelNode<T>, expanded: boolean) => void;
};

function Node<T>({
  node,
  children,
  onCheck,
  onExpand,
}: PropsWithChildren<NodeProps<T>>) {
  return (
    <>
      <div className="flex items-center">
        <NodeExpandButton node={node} onExpand={onExpand} />

        <NodeCheckbox node={node} onCheck={onCheck} />
      </div>

      {children}
    </>
  );
}

type NodeExpandButtonProps<T> = Omit<NodeProps<T>, 'onCheck'>;

function NodeExpandButton<T>({ node, onExpand }: NodeExpandButtonProps<T>) {
  const expanded = node.expanded;

  const expand = () => {
    onExpand(node, !expanded);
  };

  return (
    <div className="w-5 h-5 flex justify-center items-center shrink-0">
      <IconButton
        size="xxs"
        variant="secondary"
        className={cn({ hidden: node.isLeaf })}
        onlyIcon
        icon={<ChevronDown className={cn({ 'rotate-180': expanded })} />}
        onClick={expand}
      />
    </div>
  );
}

type NodeCheckboxProps<T> = Omit<NodeProps<T>, 'onExpand'>;

function NodeCheckbox<T>({ node, onCheck }: NodeCheckboxProps<T>) {
  const checkedState = node.checked;
  const childrenCount = node.childCount;

  const toggleCheck = () => {
    onCheck(node, checkedState === 2 ? false : checkedState !== 1);
  };

  return (
    <label
      className={cn(
        'flex gap-[6px] items-center hover:bg-muted px-1 rounded cursor-pointer hover:text-foreground',
        { 'text-[#999]': checkedState === 0 },
      )}
    >
      <CheckboxInput
        size="sm"
        className={cn({ 'border-[#999]': checkedState === 0 })}
        onCheckedChange={toggleCheck}
        checked={checkedState === 2 ? 'indeterminate' : checkedState === 1}
      />
      <span className="text-sm line-clamp-1" title={node.label}>
        {node.label}
      </span>

      {childrenCount ? (
        <span className="text-xs flex items-center gap-1 text-blue-500">
          <div className="w-1 h-1 rounded-full bg-blue-500" />
          {childrenCount} items
        </span>
      ) : null}
    </label>
  );
}

type NodeInnerWrapperProps<T> = React.HTMLAttributes<HTMLDivElement> & {
  node: TreeModelNode<T>;
};

function NodeInnerWrapper<T>({
  children,
  node,
  className,
  ...rest
}: NodeInnerWrapperProps<T>) {
  if (!node.expanded) return null;

  return (
    <div className={cn('pl-6', className)} {...rest}>
      {children}
    </div>
  );
}
