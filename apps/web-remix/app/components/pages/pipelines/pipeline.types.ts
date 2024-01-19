import { z } from "zod";
import {
  BlockConfig,
  BlockType,
  BlockTypes,
  IOType,
  Pipeline,
  PipelineRun,
  PipelineCost,
  PipelineRuns,
  PipelineCosts,
  BlockConfigConnection,
} from "./contracts";

export type IBlockConfig = z.TypeOf<typeof BlockConfig>;
export interface IPipelineConfig {
  blocks: IBlockConfig[];
  version: string;
}

export interface INode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: IBlockConfig;
}

export interface IEdge {
  id: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
  type?: string;
}

export interface IField {
  type: "input" | "output";
  data: {
    name: string;
    public: boolean;
    type: "audio" | "text" | "file" | "worker" | "controller";
  };
}

export interface IHandle {
  type: "source" | "target";
  id: string;
  data: z.TypeOf<typeof IOType>;
}

export type IBlockTypes = z.TypeOf<typeof BlockTypes>;

export type IBlockType = z.TypeOf<typeof BlockType>;

export type IPipeline = z.infer<typeof Pipeline>;

export type IPipelineRun = z.infer<typeof PipelineRun>;

export type IPipelineCost = z.infer<typeof PipelineCost>;

export type IPipelineCosts = z.infer<typeof PipelineCosts>;

export type IPipelineRuns = z.infer<typeof PipelineRuns>;

export type IBlockConfigConnection = z.infer<typeof BlockConfigConnection>;
