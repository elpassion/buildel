import { useEffect, useState } from "react";
import { errorToast } from "~/components/toasts/errorToast";
import { usePipelineRun } from "~/components/pages/pipelines/usePipelineRun";
import { IInterfaceConfigFormProperty } from "../pages/pipelines/pipeline.types";

interface UseFormInterfaceProps {
    inputs: IInterfaceConfigFormProperty[];
    outputs: IInterfaceConfigFormProperty[];
    organizationId: number;
    pipelineId: number;
    onBlockOutput?: (
        blockId: string,
        outputName: string,
        payload: unknown,
    ) => void;
    onFinish?: () => void;
    useAuth?: boolean;
}

export const useFormInterface = ({
    inputs,
    outputs,
    organizationId,
    pipelineId,
    onBlockOutput: onBlockOutputProps,
    onFinish,
    useAuth,
}: UseFormInterfaceProps) => {
    const [finishedOutputs, setFinishedOutputs] = useState<string[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const useAuthWithDefault = useAuth ?? true;

    useEffect(() => {
        if (finishedOutputs.length === outputs.length) {
            setIsGenerating(false);
            onFinish?.();
        }
    }, [finishedOutputs.length]);

    const onBlockOutput = (
        blockId: string,
        _outputName: string,
        payload: unknown,
    ) => {
        onBlockOutputProps?.(blockId, _outputName, payload);
    };

    const onStatusChange = (blockId: string, isWorking: boolean) => {
        if (isWorking) {
            setIsGenerating(true);
        }

        if (outputs.some((output) => blockId.includes(output.name)) && !isWorking) {
            setFinishedOutputs((prev) => [...prev, blockId]);
        }
    };

    const onBlockError = () => {
        errorToast({ description: "Ups! Something went wrong" });
        setIsGenerating(false);
    };

    const onError = (error: string) => {
        errorToast({ description: error });
        setIsGenerating(false);
    };

    const { startRun, stopRun, push, status, id } = usePipelineRun(
        organizationId,
        pipelineId,
        onBlockOutput,
        onStatusChange,
        onBlockError,
        onError,
        useAuthWithDefault,
    );

    return {
        stopRun,
        startRun,
        isGenerating,
        connectionStatus: status,
        runId: id,
        push
    };
};
