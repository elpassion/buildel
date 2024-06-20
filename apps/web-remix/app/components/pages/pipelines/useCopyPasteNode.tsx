import { RefObject, useCallback, useRef } from "react";
import { useEventListener } from "usehooks-ts";
import { IBlockConfig, INode } from "./pipeline.types";
import { ReactFlowInstance } from "reactflow";
import { BlockConfig } from "~/api/blockType/blockType.contracts";

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
  const mousePosition = useRef({ clientX: 0, clientY: 0 });
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  useEventListener(
    "keydown",
    (e) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === "c") {
          const selectedNode = nodes.find((node) => node.selected);

          if (selectedNode) {
            navigator.clipboard.writeText(JSON.stringify(selectedNode));
          }
        }

        if (e.code === "KeyV") {
          const reactFlowBounds = wrapper.current?.getBoundingClientRect();

          const position = reactFlowInstance.current?.project({
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
    },
  );

  const onInit = useCallback((inst: ReactFlowInstance) => {
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
