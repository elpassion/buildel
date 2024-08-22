import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ChevronDown } from 'lucide-react';

import { CheckboxInput } from '~/components/form/inputs/checkbox.input';
import { IconButton } from '~/components/iconButton';
import { cn } from '~/utils/cn';

export type TreeNodeType<T = {}> = T & {
  label: string;
  value: string;
  children?: TreeNodeType<T>[];
};

interface TreeSelectProps<T> {
  nodes: TreeNodeType<T>[];
  onCheckedChange?: (values: string[]) => void;
  defaultExpanded?: string[];
}

export const TreeSelect = <T = {},>({
  nodes,
  onCheckedChange,
  defaultExpanded,
}: TreeSelectProps<T>) => {
  const [_checkedNodes, setCheckedNodes] = useState<string[]>([]);
  const [_expandedNodes, setExpandedNodes] = useState<string[]>(
    defaultExpanded ?? [],
  );

  const checkedNodes = useDeferredValue(_checkedNodes);
  const expandedNodes = useDeferredValue(_expandedNodes);

  useEffect(() => {
    onCheckedChange?.(checkedNodes);
  }, [checkedNodes]);

  const toggleChecked = useCallback(
    (node: TreeNodeType<T>) => {
      const nodeValues = getNodeChildValues(node);

      requestAnimationFrame(() => {
        setCheckedNodes((prev) => {
          const anyChecked = nodeValues.some((value) => prev.includes(value));
          if (anyChecked) {
            return prev.filter((value) => !nodeValues.includes(value));
          }
          return [...prev, ...nodeValues];
        });
      });
    },
    [checkedNodes],
  );

  const isChecked = useCallback(
    (value: string) => {
      return checkedNodes.includes(value);
    },
    [checkedNodes],
  );

  const isSomeChildrenChecked = useCallback(
    (node: TreeNodeType<T>): boolean => {
      return (
        node.children?.some((child) => {
          if (isLeaf(child)) {
            return isChecked(child.value);
          }
          return isSomeChildrenChecked(child);
        }) ?? false
      );
    },
    [isChecked],
  );

  const isEveryChildrenChecked = useCallback(
    (node: TreeNodeType<T>): boolean => {
      return (
        node.children?.every((child) => {
          if (isLeaf(child)) {
            return isChecked(child.value);
          }
          return isEveryChildrenChecked(child);
        }) ?? false
      );
    },
    [isChecked],
  );

  const getCheckedState = useCallback(
    (node: TreeNodeType<T>) => {
      if (isLeaf(node)) {
        return isChecked(node.value) ? 1 : 0;
      }

      if (isEveryChildrenChecked(node)) {
        return 1;
      }

      if (isSomeChildrenChecked(node)) {
        return 2;
      }

      return 0;
    },
    [isChecked, isEveryChildrenChecked, isSomeChildrenChecked],
  );

  const toggleExpanded = useCallback(
    (node: TreeNodeType<T>) => {
      requestAnimationFrame(() => {
        setExpandedNodes((prev) => {
          if (prev.includes(node.value)) {
            return prev.filter((value) => value !== node.value);
          }
          return [...prev, node.value];
        });
      });
    },
    [expandedNodes],
  );

  const isExpanded = useCallback(
    (node: TreeNodeType<T>) => {
      return expandedNodes.includes(node.value);
    },
    [expandedNodes],
  );

  const expandedValue = useMemo(() => {
    return {
      checkExpanded: isExpanded,
      toggleExpanded,
    };
  }, [toggleExpanded]);

  const checkedValue = useMemo(() => {
    return {
      checkChecked: getCheckedState,
      toggleChecked,
    };
  }, [toggleChecked]);

  return (
    <ExpandedNodesContext.Provider value={expandedValue}>
      <CheckedNodesContext.Provider value={checkedValue}>
        <div className="flex flex-col gap-1">
          {nodes.map((node) => (
            <Node key={node.value} node={node} />
          ))}
        </div>
      </CheckedNodesContext.Provider>
    </ExpandedNodesContext.Provider>
  );
};

type NodeProps<T> = {
  node: TreeNodeType<T>;
};

function Node<T>({ node }: NodeProps<T>) {
  return (
    <>
      <div className="flex items-center">
        <NodeExpandButton node={node} />

        <NodeCheckbox node={node} />
      </div>

      <NodeChildren node={node} />
    </>
  );
}

function NodeChildren<T>({ node }: NodeProps<T>) {
  const { checkExpanded } = useExpandedNodes();

  const childrenExist = useMemo(() => {
    return hasChildren(node);
  }, [node.value]);

  const expanded = useMemo(() => {
    return checkExpanded(node);
  }, [checkExpanded]);

  if (!childrenExist || !expanded) return null;

  return (
    <NodeInnerWrapper>
      {node.children?.map((child) => <Node key={child.value} node={child} />)}
    </NodeInnerWrapper>
  );
}

function NodeExpandButton<T>({ node }: NodeProps<T>) {
  const { checkExpanded, toggleExpanded } = useExpandedNodes();

  const childrenExist = useMemo(() => {
    return hasChildren(node);
  }, [node.value]);

  const expanded = useMemo(() => {
    return checkExpanded(node);
  }, [checkExpanded]);

  return (
    <div className="w-5 h-5 flex justify-center items-center shrink-0">
      <IconButton
        size="xxs"
        variant="secondary"
        className={cn({ hidden: !childrenExist })}
        onlyIcon
        icon={<ChevronDown className={cn({ 'rotate-180': expanded })} />}
        onClick={() => toggleExpanded(node)}
      />
    </div>
  );
}

function NodeCheckbox<T>({ node }: NodeProps<T>) {
  const { checkChecked, toggleChecked } = useCheckedNodes();

  const checkedState = useMemo(() => {
    return checkChecked(node);
  }, [checkChecked]);

  const childrenExist = useMemo(() => {
    return hasChildren(node);
  }, [node.value]);

  const childrenCount = useMemo(() => {
    return childrenExist ? getAllChildrenCount(node) : 0;
  }, [node.value]);

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
        onCheckedChange={() => toggleChecked(node)}
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

function NodeInnerWrapper({ children }: { children: React.ReactNode }) {
  return <div className="pl-6">{children}</div>;
}

function hasChildren<T>(node: TreeNodeType<T>) {
  return !!node.children && node.children.length > 0;
}

function getAllChildrenCount<T>(node: TreeNodeType<T>): number {
  if (isLeaf(node)) return 1;

  return (node.children ?? []).reduce(
    (acc, child) => acc + getAllChildrenCount(child),
    0,
  );
}

function isLeaf<T>(node: TreeNodeType<T>) {
  return !hasChildren(node);
}

function getNodeChildValues<T>(node: TreeNodeType<T>): string[] {
  if (isLeaf(node)) return [node.value];

  return node.children?.flatMap(getNodeChildValues) ?? [];
}

type CheckedNodesContextType<T> = {
  toggleChecked: (node: TreeNodeType<T>) => void;
  checkChecked: (node: TreeNodeType<T>) => number;
};

const CheckedNodesContext = React.createContext<
  CheckedNodesContextType<any> | undefined
>(undefined);

function useCheckedNodes<T>() {
  const context = React.useContext(CheckedNodesContext) as
    | CheckedNodesContextType<T>
    | undefined;
  if (!context) {
    throw new Error(
      'useCheckedNodes must be used within a CheckedNodesContext',
    );
  }
  return context;
}

type ExpandedNodesContextType<T> = {
  toggleExpanded: (node: TreeNodeType<T>) => void;
  checkExpanded: (node: TreeNodeType<T>) => boolean;
};

const ExpandedNodesContext = React.createContext<
  ExpandedNodesContextType<any> | undefined
>(undefined);

function useExpandedNodes<T>() {
  const context = React.useContext(ExpandedNodesContext) as
    | ExpandedNodesContextType<T>
    | undefined;
  if (!context) {
    throw new Error(
      'useExpandedNodes must be used within a ExpandedNodesContext',
    );
  }
  return context;
}
