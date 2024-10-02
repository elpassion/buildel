import type { z } from 'zod';

import type {
  BlockType,
  BlockTypes,
  ConfigConnection,
  ExtendedBlockConfig,
  IOType,
} from '~/api/blockType/blockType.contracts';
import type {
  Alias,
  ExtendedPipeline,
  InterfaceConfig,
  InterfaceConfigForm,
  InterfaceConfigFormProperty,
  Pipeline,
  PipelineCost,
  PipelineCosts,
  PipelineRun,
  PipelineRuns,
} from '~/api/pipeline/pipeline.contracts';

export type IBlockConfig = z.TypeOf<typeof ExtendedBlockConfig>;

export type IExtendedBlockConfig = z.TypeOf<typeof ExtendedBlockConfig>;

export interface IPipelineConfig {
  blocks: IBlockConfig[];
  connections: IConfigConnection[];
  version: string;
}

export interface INode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  selected: boolean;
  measured?: { width?: number; height?: number };
  data: IBlockConfig;
}

export interface IEdge {
  id: string;
  source: string;
  sourceHandle?: string | null;
  target: string;
  targetHandle?: string | null;
  type?: string;
  data?: IConfigConnection;
}

export interface IField {
  type: 'input' | 'output';
  data: {
    name: string;
    public: boolean;
    visible: boolean;
    type:
      | 'audio'
      | 'text'
      | 'file'
      | 'file_temporary'
      | 'worker'
      | 'controller'
      | 'image';
  };
}

export interface IHandle {
  type: 'source' | 'target';
  id: string;
  data: z.TypeOf<typeof IOType>;
}

export type IIOType = z.TypeOf<typeof IOType>;

export type IBlockTypes = z.TypeOf<typeof BlockTypes>;

export type IBlockType = z.TypeOf<typeof BlockType>;

export type IInterfaceConfig = z.infer<typeof InterfaceConfig>;
export type IInterfaceConfigForm = z.infer<typeof InterfaceConfigForm>;
export type IInterfaceConfigFormProperty = z.infer<
  typeof InterfaceConfigFormProperty
>;

export type IPipeline = z.infer<typeof Pipeline>;

export type IExtendedPipeline = z.infer<typeof ExtendedPipeline>;

export type IPipelineAlias = z.infer<typeof Alias>;

export type IPipelineRun = z.infer<typeof PipelineRun>;

export type IPipelineCost = z.infer<typeof PipelineCost>;

export type IPipelineCosts = z.infer<typeof PipelineCosts>;

export type IPipelineRuns = z.infer<typeof PipelineRuns>;

export type IConfigConnection = z.infer<typeof ConfigConnection>;
