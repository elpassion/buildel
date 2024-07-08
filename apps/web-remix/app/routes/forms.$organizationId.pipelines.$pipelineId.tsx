import React, { useCallback, useEffect, useMemo, useState } from "react";
import { json, LoaderFunctionArgs } from "@remix-run/node";
import { loaderBuilder } from "~/utils.server";
import invariant from "tiny-invariant";
import { useLoaderData } from "@remix-run/react";
import { PipelineApi } from "~/api/pipeline/PipelineApi";
import { UnauthorizedError } from "~/utils/errors";
import { IPipelinePublicResponse } from "~/api/pipeline/pipeline.contracts";
import { ParsedResponse } from "~/utils/fetch.server";
import { useFormInterface } from "~/components/formInterface/useFormInterface";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { SubmitButton } from "~/components/form/submit";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { NodeClearButton, NodeCopyButton, NodeDownloadButton } from "~/components/pages/pipelines/CustomNodes/NodeActionButtons";
import { ChatMarkdown } from "~/components/chat/ChatMarkdown";
import { SmallFileInputField } from "~/components/form/fields/file.field";
import { ChatStatus } from "~/components/chat/Chat.components";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    invariant(params.organizationId, "organizationId not found");
    invariant(params.pipelineId, "pipelineId not found");

    const pipelineApi = new PipelineApi(fetch);

    let pipeline: ParsedResponse<IPipelinePublicResponse> | void =
      await pipelineApi
        .getPipeline(params.organizationId, params.pipelineId)
        .catch((e) => {
          if (e instanceof UnauthorizedError) return;
          throw e;
        });
    if (!pipeline) {
      pipeline = await pipelineApi.getPublicPipeline(
        params.organizationId,
        params.pipelineId,
      );
    }

    const alias = pipelineApi.getAliasFromUrl(request.url);

    return json({
      pipeline: pipeline.data,
      organizationId: params.organizationId as string,
      pipelineId: params.pipelineId as string,
      alias,
    });
  })(args);
}

export default function WebsiteForm() {
  const { pipelineId, organizationId, pipeline, alias } =
    useLoaderData<typeof loader>();
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [blockStatus, setBlockStatus] = useState<Record<string, boolean>>({});
  const [files, setFiles] = useState<Record<string, File>>({});

  const {
    isGenerating,
    connectionStatus,
    stopRun,
    startRun,
    runId,
    push
  } = useFormInterface({
    inputs: pipeline.interface_config.form.inputs,
    outputs: pipeline.interface_config.form.outputs,
    organizationId: organizationId as unknown as number,
    pipelineId: pipelineId as unknown as number,
    useAuth: !(pipeline.interface_config.form.public ?? false),
    onBlockOutput: (blockId, outputName, payload) => {
      const message = (payload as { message: string })?.message;

      setOutputs((prev) => ({
        ...prev,
        [blockId]: prev[blockId] ? prev[blockId] + message : message,
      }));
    },
    onBlockStatusChange: (blockName, isWorking) => {
      setBlockStatus((prev) => ({
        ...prev,
        [blockName]: isWorking,
      }));
    }
  });

  useEffect(() => {
    setTimeout(() => {
      startRun({
        alias, initial_inputs: [], metadata: {
          interface: "form",
        }
      });
    }, 500);

    return () => {
      stopRun();
    };
  }, []);


  const validator = useMemo(() => withZod(z.any()), []);

  const handleOnSubmit = (data: any) => {
    setOutputs({});

    const inputs = Object.entries(data)
      .filter(([_, value]) => value)
      .map(([key, value]) => {
        const inputType = pipeline.interface_config.form.inputs.find(input => input.name === key)?.type
        if (inputType === "file_input") {
          return null
        }

        return {
          name: `${key}:input`,
          value: value
        }
      })
      .filter(Boolean) as unknown as { name: string, value: string }[]

    for (const input of inputs) {
      push(input.name, input.value)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen h-screen w-full">
      <div className="flex flex-col w-[820px] bg-neutral-900 p-2 rounded-lg">
        <ChatStatus connectionStatus={connectionStatus} className="mb-2" />
        <ValidatedForm
          validator={validator}
          noValidate
          onSubmit={handleOnSubmit}
          className="w-full"
        >
          <div className="flex flex-col items-start w-full gap-5">
            {pipeline.interface_config.form.inputs.map(input => {

              return (
                <Field name={input.name} key={input.name}>
                  {input.type === "text_input" && (
                    <TextInputField
                      className="w-full"
                      label={input.name}
                    />
                  )}
                  {input.type === "file_input" && (
                    <div className="flex text-white justify-start items-center gap-2 bg-neutral-800 rounded-lg w-full">
                      <SmallFileInputField
                        multiple={false}
                        buttonText={input.name}
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          if (!file) return

                          const buffer = await file.arrayBuffer()

                          push(`${input.name}:input`, buffer)

                          setFiles(prev => ({
                            ...prev,
                            [input.name]: file
                          }))
                        }}
                        disabled={blockStatus[input.name]}
                      />
                      <p>{files[input.name]?.name}</p>
                    </div>
                  )}
                </Field>
              )
            })}

          </div>

          <SubmitButton size="sm" variant="filled" className="mt-6 mb-6">
            Submit
          </SubmitButton>

          {
            pipeline.interface_config.form.outputs.map(output => (
              <FormInterfaceOutput
                key={output.name}
                blockName={output.name}
                blockType={output.type}
                payload={outputs[output.name]}
              />
            ))
          }

        </ValidatedForm>
      </div>
      <div id="_root"></div>
    </div>
  );
}

export function FormInterfaceOutput({ payload, blockName, blockType }: { payload: string, blockName: string, blockType: string }) {
  return (
    <div>
      <div className="mb-1 flex gap-1">
        <NodeCopyButton text={payload} />

        <NodeDownloadButton blockName={blockName} text={payload} />

        <NodeClearButton onClear={() => { }} />
      </div>
      <div className="w-full prose min-w-[280px] max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-neutral-200 rounded-md py-2 px-[10px]">
        <ChatMarkdown>{payload ?? ""}</ChatMarkdown>
      </div>
    </div>
  )
}
