import type { TreeModelNode, TreeNodeType } from './Tree.types';

export type TreeModelProps = {
  defaultExpanded?: string[];
  ignoreParents?: boolean;
};

export class TreeModel<T> {
  constructor(
    private readonly props: TreeModelProps = {},
    private readonly nodes: Record<string, TreeModelNode<T>> = {},
  ) {}

  clone() {
    const clonedNodes = structuredClone(this.flattenedNodes);

    return new TreeModel<T>(this.props, clonedNodes);
  }

  flattenNodes(nodes: TreeNodeType<T>[], parent?: TreeModelNode<T>) {
    if (!nodes || nodes.length === 0) return;

    nodes.forEach((node, index) => {
      if (this.nodes[node.value] !== undefined) {
        throw new Error(`Duplicate node value: ${node.value}`);
      }

      const isLeaf = !this.hasChildren(node);

      const id = !parent ? `${index}` : `${parent.id}-${index}`;

      const isDefaultExpanded = this.props.defaultExpanded?.includes(
        node.value,
      );

      const flatNode: TreeModelNode<T> = {
        ...node,
        checked: 0,
        expanded: isDefaultExpanded ?? false,
        isParent: !isLeaf,
        id: `${id}-${index}`,
        childCount: 0,
        isLeaf,
        parent,
      };

      this.nodes[node.value] = flatNode;

      if (!isLeaf) {
        this.flattenNodes(node.children!, flatNode);
        this.getChildCount(flatNode);
      }
    });
  }

  setExpanded(node: TreeNodeType<T>, expanded: boolean) {
    const treeNode = this.nodes[node.value];

    this.toggleExpanded(treeNode.value, expanded);
  }

  setChecked(node: TreeNodeType<T>, checked: boolean) {
    const treeNode = this.nodes[node.value];

    this.toggleChecked(treeNode.value, checked ? 1 : 0);

    if (!treeNode.isLeaf) {
      treeNode.children?.forEach((child) => {
        this.setChecked(child, checked);
      });
    }

    if (treeNode.parent) {
      this.setParentChecked(treeNode.parent);
    }
  }

  setParentChecked(node: TreeNodeType<T>) {
    const treeNode = this.nodes[node.value];

    if (this.isEveryChildChecked(treeNode)) {
      this.toggleChecked(treeNode.value, 1);
    } else if (this.isSomeChildChecked(treeNode)) {
      this.toggleChecked(treeNode.value, 2);
    } else {
      this.toggleChecked(treeNode.value, 0);
    }
    if (treeNode.parent) {
      this.setParentChecked(treeNode.parent);
    }
  }

  getNode(value: string) {
    return this.nodes[value];
  }

  getChildCount(node: TreeModelNode<T>) {
    this.flattenedNodes[node.value].childCount = Object.values(
      this.flattenedNodes,
    ).filter((value) => {
      if (!value.isLeaf) return false;

      return value.id.startsWith(node.id);
    }).length;
  }

  get flattenedNodes() {
    return this.nodes;
  }

  get checkedNodes() {
    return Object.values(this.nodes)
      .filter((node) => {
        if (this.props.ignoreParents && node.isParent) return false;
        return node.checked === 1;
      })
      .map((node) => node.value);
  }

  private toggleChecked(value: string, toggleValue: 0 | 1 | 2) {
    this.flattenedNodes[value]['checked'] = toggleValue;

    return this;
  }

  private toggleExpanded(value: string, toggleValue: boolean) {
    this.flattenedNodes[value]['expanded'] = toggleValue;

    return this;
  }

  private hasChildren(node: TreeNodeType<T>) {
    return !!node.children && node.children.length > 0;
  }

  private isEveryChildChecked(node: TreeNodeType<T>) {
    return (node.children ?? []).every((child) => {
      const childNode = this.getNode(child.value);

      return childNode.checked === 1 || childNode.checked === 2;
    });
  }

  private isSomeChildChecked(node: TreeNodeType<T>) {
    return (node.children ?? []).some((child) => {
      const childNode = this.getNode(child.value);

      return childNode.checked === 1 || childNode.checked === 2;
    });
  }
}
