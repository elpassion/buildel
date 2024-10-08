import React, { useMemo, useState } from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import invariant from 'tiny-invariant';
import { z } from 'zod';

import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { SmallFileInputField } from '~/components/form/fields/file.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { publicInterfaceLoader } from '~/components/pages/pipelines/interface/interface.loader.server';
import {
  NodeClearButton,
  NodeCopyButton,
  NodeDownloadButton,
} from '~/components/pages/pipelines/Nodes/CustomNodes/NodeActionButtons';
import { loaderBuilder } from '~/utils.server';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params, ...rest }, helpers) => {
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    return publicInterfaceLoader({ params, ...rest }, helpers);
  })(args);
}

export default function WebsiteForm() {
  const { pipelineId, organizationId, pipeline } =
    useLoaderData<typeof loader>();
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File>>({});

  const validator = useMemo(() => withZod(z.any()), []);

  const handleOnSubmit = async (data: any) => {
    setOutputs({});

    const inputs = Object.entries(data)
      .filter(([blockName, value]) => {
        if (!value) return false;
        if (typeof value !== 'string' && !files[blockName]) return false;
        return true;
      })
      .map(([key, value]) => ({
        name: key,
        input: 'input',
        value: value,
      }));

    const response = await fetch(
      `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs`,
      {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'content-type': 'application/json',
        },
      },
    );
    const {
      data: { id },
    } = await response.json();

    const formData = new FormData();

    inputs.forEach((input, index) => {
      formData.append(`initial_inputs[${index}][block_name]`, input.name);
      formData.append(`initial_inputs[${index}][input_name]`, input.input);
      formData.append(
        `initial_inputs[${index}][data]`,
        input.value as string | File,
      );
    });
    pipeline.interface_config.form.outputs.forEach((output, index) => {
      formData.append(`wait_for_outputs[${index}][block_name]`, output.name);
      formData.append(`wait_for_outputs[${index}][output_name]`, 'output');
    });

    const runResponse = await fetch(
      `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs/${id}/start`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const runResponseData = await runResponse.json();

    runResponseData.outputs.forEach((output: any) => {
      setOutputs((prev) => ({
        ...prev,
        [output.block_name]: prev[output.block_name]
          ? prev[output.block_name] + output.data
          : output.data,
      }));
    });

    await fetch(
      `/super-api/organizations/${organizationId}/pipelines/${pipelineId}/runs/${id}/stop`,
      {
        method: 'POST',
      },
    );
  };

  return (
    <div className="flex justify-center items-center h-screen w-full text-foreground">
      <div className="flex flex-col w-[820px] bg-muted p-2 rounded-lg">
        <ValidatedForm
          validator={validator}
          noValidate
          onSubmit={handleOnSubmit}
          className="w-full"
        >
          <div className="flex flex-col items-start w-full gap-5">
            {pipeline.interface_config.form.inputs.map((input) => {
              return (
                <Field name={input.name} key={input.name}>
                  {input.type === 'text_input' && (
                    <div className="w-full">
                      <FieldLabel>{input.name}</FieldLabel>
                      <TextInputField className="w-full" />
                      <FieldMessage />
                    </div>
                  )}
                  {input.type === 'file_input' && (
                    <div className="flex text-foreground justify-start items-center gap-2 rounded-lg w-full">
                      <SmallFileInputField
                        multiple={false}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          setFiles((prev) => ({
                            ...prev,
                            [input.name]: file,
                          }));
                        }}
                      />

                      <p>{files[input.name]?.name}</p>
                    </div>
                  )}
                </Field>
              );
            })}
          </div>

          <SubmitButton size="sm" className="mt-6 mb-6">
            Submit
          </SubmitButton>

          {pipeline.interface_config.form.outputs.map((output) => (
            <FormInterfaceOutput
              key={output.name}
              blockName={output.name}
              blockType={output.type}
              payload={outputs[output.name]}
            />
          ))}
        </ValidatedForm>
      </div>
      <div id="_root"></div>
    </div>
  );
}

export function FormInterfaceOutput({
  payload,
  blockName,
}: {
  payload: string;
  blockName: string;
  blockType: string;
}) {
  return (
    <div>
      <div className="mb-1 flex gap-1">
        <NodeCopyButton text={payload} />

        <NodeDownloadButton blockName={blockName} text={payload} />

        <NodeClearButton onClear={() => {}} />
      </div>
      <div className="bg-white w-full prose min-w-[280px] max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-input rounded-md py-2 px-[10px]">
        <ChatMarkdown>{payload ?? ''}</ChatMarkdown>
      </div>
    </div>
  );
}
