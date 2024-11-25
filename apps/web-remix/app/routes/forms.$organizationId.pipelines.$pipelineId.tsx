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
import { IInterfaceConfigFormProperty } from '~/components/pages/pipelines/pipeline.types';
import { Label } from '~/components/ui/label';
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

  const validator = useMemo(() => withZod(z.any()), []);

  const handleOnSubmit = async (data: any) => {
    setOutputs({});
    console.log(data);
    const inputs = Object.entries(data)
      .filter(([_, value]) => {
        if (!value) return false;
        if (value instanceof File && value.size === 0) return false;
        return true;
      })
      .map(([key, value]) => ({
        name: key,
        input: 'input',
        value: value,
      }));
    console.log(inputs);
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
    console.log('DUPA', runResponseData);
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
    <div className="flex justify-center items-center h-screen w-full text-foreground bg-secondary">
      <div className="flex flex-col w-[820px] bg-white rounded-lg">
        <ValidatedForm
          validator={validator}
          noValidate
          onSubmit={handleOnSubmit}
          className="w-full border-b mb-6 p-2 md:p-4"
        >
          <div className="flex flex-col items-start w-full gap-5">
            {pipeline.interface_config.form.inputs.map((input) => {
              return <FormInterfaceInput data={input} key={input.name} />;
            })}
          </div>

          <SubmitButton size="sm" className="my-6">
            Submit
          </SubmitButton>
        </ValidatedForm>

        <div className="p-2 md:p-4">
          {pipeline.interface_config.form.outputs.map((output) => (
            <FormInterfaceOutput
              key={output.name}
              data={{
                name: output.name,
                type: output.type,
                payload: outputs[output.name],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface FormInterfaceInputProps {
  data: IInterfaceConfigFormProperty;
}

export function FormInterfaceInput({ data }: FormInterfaceInputProps) {
  if (data.type === 'text_input') {
    return (
      <Field name={data.name}>
        <div className="w-full">
          <FieldLabel>{data.name}</FieldLabel>
          <TextInputField placeholder="Fill input..." className="w-full" />
          <FieldMessage />
        </div>
      </Field>
    );
  } else if (data.type === 'file_input') {
    return (
      <Field name={data.name}>
        <div className="w-full">
          <FieldLabel>{data.name}</FieldLabel>
          <SmallFileInputField multiple={false} className="w-fit" />

          {/*<p>{files[input.name]?.name}</p>*/}
        </div>
      </Field>
    );
  } else if (data.type === 'image_input') {
    return (
      <Field name={data.name}>
        <div className="w-full">
          <FieldLabel>{data.name}</FieldLabel>
          <SmallFileInputField multiple={false} className="w-fit" />

          {/*<p>{files[input.name]?.name}</p>*/}
        </div>
      </Field>
    );
  }

  return null;
}

interface FormInterfaceOutputProps {
  data: {
    payload: string;
    name: string;
    type: string;
  };
}

export function FormInterfaceOutput({ data }: FormInterfaceOutputProps) {
  if (data.type === 'text_output') {
    return <FormInterfaceTextOutput data={data} />;
  } else if (data.type === 'file_output') {
    return <FormInterfaceFileOutput data={data} />;
  }

  return null;
}

export function FormInterfaceTextOutput({ data }: FormInterfaceOutputProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label>{data.name}</Label>
        <div className="mb-1 flex gap-1">
          <NodeCopyButton text={data.payload} />

          <NodeDownloadButton blockName={data.name} text={data.payload} />

          <NodeClearButton onClear={() => {}} />
        </div>
      </div>
      <div className="bg-white w-full prose min-w-[280px] max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-input rounded-md py-2 px-[10px]">
        <ChatMarkdown>{data.payload ?? ''}</ChatMarkdown>
      </div>
    </div>
  );
}

export function FormInterfaceFileOutput({ data }: FormInterfaceOutputProps) {
  console.log(data);
  return (
    <div>
      <p>FIle</p>
    </div>
  );
}
