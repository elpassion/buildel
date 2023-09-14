import { z } from "zod";
import { BlockConfig, BlockTypes, IOType, Pipeline } from "../contracts";

export type IBlockConfig = z.TypeOf<typeof BlockConfig>;
export interface IPipelineConfig {
  blocks: IBlockConfig[];
  version: string;
}

export interface INode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: IBlockConfig;
}

export interface IEdge {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
}

export interface IField {
  type: "input" | "output";
  data: {
    name: string;
    public: boolean;
    type: "audio" | "text" | "file";
  };
}

export interface IHandle {
  type: "source" | "target";
  id: string;
  data: z.TypeOf<typeof IOType>;
}

export type IBlockTypes = z.TypeOf<typeof BlockTypes>;

export type IPipeline = z.infer<typeof Pipeline>;
