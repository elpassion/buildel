import React, {
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { usePipelineRun } from "./usePipelineRun";
import { IBlockConfig, IPipeline } from "../pipeline.types";
import { generateZODSchema } from "~/components/form/schema/SchemaParser";
import { SafeParseReturnType, ZodError } from "zod";

export interface IEvent {
  block: string;
  output: string;
  payload: {
    //Fix it - other response types
    message: any;
  };
}
interface IRunPipelineContext {
  events: IEvent[];
  blockStatuses: Record<string, boolean>;
  blockValidations: Record<
    string,
    { success: true } | { success: false; error: ZodError }
  >;
  startRun: () => void;
  stopRun: () => void;
  push: (topic: string, payload: any) => void;
  clearEvents: (blockName: string) => void;
  status: "idle" | "starting" | "running";
  isValid: boolean;
  organizationId: number;
  pipelineId: number;
}

const RunPipelineContext = React.createContext<IRunPipelineContext | undefined>(
  undefined
);
interface RunPipelineProviderProps extends PropsWithChildren {
  pipeline: IPipeline;
}

export const RunPipelineProvider: React.FC<RunPipelineProviderProps> = ({
  children,
  pipeline,
}) => {
  const [events, setEvents] = useState<any[]>([]);
  const [blockStatuses, setBlockStatuses] = useState<Record<string, boolean>>(
    {}
  );

  const onMessage = useCallback(
    (block: string, output: string, payload: any) =>
      setEvents((events) => [...events, { block, output, payload }]),
    []
  );

  const onStatusChange = useCallback((block: string, status: boolean) => {
    setBlockStatuses((prev) => ({ ...prev, [block]: status }));
  }, []);

  const { status, startRun, stopRun, push } = usePipelineRun(
    pipeline.organization_id,
    pipeline.id,
    onMessage,
    onStatusChange
  );

  const clearEvents = useCallback((blockName: string) => {
    setEvents((prev) => prev.filter((ev) => ev.block === blockName));
  }, []);

  const blockValidations = useMemo(() => {
    if (!pipeline) return {};

    return pipeline.config.blocks.reduce((acc, block) => {
      return {
        ...acc,
        [block.name]: generateZODSchema(
          block.block_type.schema as any
        ).safeParse({
          name: block.name,
          opts: block.opts,
          inputs: block.inputs,
        }),
      };
    }, {} as Record<string, SafeParseReturnType<unknown, unknown>>);
  }, [pipeline]);

  const isValid = useMemo(() => {
    //@ts-ignore
    return Object.values(blockValidations).every((v) => v.success);
  }, [blockValidations]);

  // // @ts-ignore
  // window.push = push;

  const value = useMemo(
    () => ({
      events,
      status,
      startRun,
      stopRun,
      push,
      clearEvents,
      blockStatuses,
      blockValidations,
      isValid,
      organizationId: pipeline.organization_id,
      pipelineId: pipeline.id,
    }),
    [
      events,
      push,
      startRun,
      status,
      stopRun,
      clearEvents,
      blockStatuses,
      blockValidations,
      isValid,
    ]
  );
  return (
    <RunPipelineContext.Provider value={value}>
      {children}
    </RunPipelineContext.Provider>
  );
};

export const useRunPipeline = () => {
  const ctx = useContext(RunPipelineContext);

  if (!ctx) {
    throw new Error("useRunPipeline must be used within RunPipelineProvider");
  }

  return ctx;
};

export const useRunPipelineNode = (block: IBlockConfig) => {
  const blockName = block.name;
  const ctx = useContext(RunPipelineContext);

  if (!ctx) {
    throw new Error(
      "useRunPipelineNode must be used within RunPipelineProvider"
    );
  }

  const filteredEvents = useMemo(
    () => ctx.events.filter((ev) => ev.block === blockName),
    [blockName, ctx.events]
  );

  const status = useMemo(
    () => ctx.blockStatuses[blockName] ?? false,
    [blockName, ctx.blockStatuses]
  );

  const isValid = useMemo(() => {
    return ctx.blockValidations[blockName].success ?? false;
  }, [blockName, ctx.blockValidations]);

  const errors = useMemo(() => {
    const validation = ctx.blockValidations[blockName];
    if (validation.success) {
      return [];
    } else {
      return validation.error.errors.map((err) => err.message);
    }
  }, [blockName, ctx.blockValidations]);

  return useMemo(
    () => ({
      status,
      isValid,
      events: filteredEvents,
      push: ctx.push,
      clearEvents: ctx.clearEvents,
      errors,
    }),
    [
      status,
      isValid,
      filteredEvents,
      ctx.push,
      ctx.clearEvents,
      ctx.blockValidations,
      blockName,
    ]
  );
};
