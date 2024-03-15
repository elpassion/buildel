import { RefObject, useCallback, useRef } from "react";
import { useEventListener } from "usehooks-ts";
import { IBlockConfig, INode } from "./pipeline.types";
import { ReactFlowInstance } from "reactflow";

interface UseCopyPasteNodeArgs {
  onPaste: (config: IBlockConfig) => Promise<void>;
  nodes: INode[];
  wrapper: RefObject<HTMLElement>;
}

export const useCopyPasteNode = ({
  onPaste,
  nodes,
  wrapper,
}: UseCopyPasteNodeArgs) => {
  const copiedNode = useRef<INode | null>(null);
  const mousePosition = useRef({ clientX: 0, clientY: 0 });
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  useEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === "c") {
        const selectedNode = nodes.find((node) => node.selected);

        if (selectedNode) {
          copiedNode.current = selectedNode;
        }
      }

      if (e.key === "v" && copiedNode.current) {
        const reactFlowBounds = wrapper.current?.getBoundingClientRect();

        const position = reactFlowInstance.current?.project({
          x: mousePosition.current.clientX - reactFlowBounds!.left,
          y: mousePosition.current.clientY - reactFlowBounds!.top,
        });

        onPaste({
          ...copiedNode.current.data,
          position: position ?? copiedNode.current?.position,
        });
      }
    }
  });

  const onInit = useCallback((inst: ReactFlowInstance) => {
    reactFlowInstance.current = inst;
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      mousePosition.current = { clientX: e.clientX, clientY: e.clientY };
    },
    []
  );

  return { onInit, onMouseMove };
};
