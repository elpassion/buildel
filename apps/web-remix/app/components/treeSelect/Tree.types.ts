export type TreeNodeType<T = {}> = T & {
  label: string;
  value: string;
  children?: TreeNodeType<T>[];
};

export type TreeModelNode<T> = TreeNodeType<T> & {
  id: string;
  parent?: TreeModelNode<T>;
  isParent: boolean;
  isLeaf: boolean;
  checked: 0 | 1 | 2;
  expanded: boolean;
  childCount: number;
};
