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
import { Icon } from "@elpassion/taco";
import { SmallFileInputField } from "~/components/form/fields/file.field";

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
    onFinish: () => {
      console.log("finish")
      // stopRun();
    },
    onBlockOutput: (blockId, outputName, payload) => {
      setOutputs((prev) => ({
        ...prev,
        [blockId]: prev[blockId] ? prev[blockId] + (payload as any)?.message : (payload as any)?.message,
      }));
    }
  });

  useEffect(() => {
    return () => {
      stopRun();
    };
  }, []);


  const validator = useMemo(() => withZod(z.any()), []);

  const handleOnSubmit = async (data: any) => {
    setOutputs({});
    await startRun({
      alias, initial_inputs: [], metadata: {
        interface: "form",
      }
    });

    const inputs = await Promise.all(Object.entries(data)
      .filter(([_, value]) => value)
      .map(async ([key, value]) => {
        const inputType = pipeline.interface_config.form.inputs.find(input => input.name === key)?.type
        if (inputType === "file_input") {
          const blob = await (value as File).arrayBuffer().then((arrayBuffer: any) => {
            return new Blob([new Uint8Array(arrayBuffer)], {
              type: (value as File).type,
            });
          });

          return {
            name: `${key}:input`,
            value: await blob.arrayBuffer() as unknown as string
          }
        }

        return {
          name: `${key}:input`,
          value: value as string
        }
      }))

    for (const input of inputs) {
      push(input.name, input.value)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen w-full">
      <ValidatedForm
        validator={validator}
        noValidate
        onSubmit={handleOnSubmit}
      >
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center max-w-screen-2xl">
          {pipeline.interface_config.form.inputs.map(input => {

            return (
              <Field name={input.name} key={input.name}>
                {input.type === "text_input" && (
                  <TextInputField
                    label={input.name}
                  />
                )}
                {input.type === "file_input" && (
                  <SmallFileInputField
                    multiple={false}
                    buttonText={input.name}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      console.log(file)
                    }}
                  />
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
            <React.Fragment key={output.name}>
              <div className="mb-1 flex gap-1">
                <NodeCopyButton text={outputs[output.name]} />

                <NodeDownloadButton blockName={output.name} text={outputs[output.name]} />

                <NodeClearButton onClear={() => { }} />
              </div>
              <div className="w-full prose min-w-[280px] max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-neutral-200 rounded-md py-2 px-[10px]">
                <ChatMarkdown>{outputs[output.name] ?? ""}</ChatMarkdown>
              </div>
            </React.Fragment>
          ))
        }

      </ValidatedForm>
      <div id="_root"></div>
    </div>
  );
}
