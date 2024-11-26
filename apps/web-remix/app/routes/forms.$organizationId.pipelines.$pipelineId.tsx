import React, { useCallback, useEffect, useReducer } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type {
  OnBlockError,
  OnBlockOutput,
  OnBlockStatusChange,
  OnError,
} from '@buildel/buildel';
import { FileText, FileUp, X } from 'lucide-react';
import invariant from 'tiny-invariant';

import { ChatHeader, ChatStatus } from '~/components/chat/Chat.components';
import { ChatHeading } from '~/components/chat/ChatHeading';
import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { SmallFileUpload } from '~/components/fileUpload/SmallFileUpload';
import { FieldLabel } from '~/components/form/fields/field.label';
import { TextInput } from '~/components/form/inputs/text.input';
import { IconButton } from '~/components/iconButton';
import {
  FormContext,
  useForm,
  useFormField,
} from '~/components/pages/interfaces/form/formInterface.form';
import type {
  FormInterfaceAction,
  FormInterfaceState,
} from '~/components/pages/interfaces/form/formInterface.reducer';
import {
  formInterfaceReducer,
  generate,
  setOutput,
  setStatus,
} from '~/components/pages/interfaces/form/formInterface.reducer';
import { publicInterfaceLoader } from '~/components/pages/pipelines/interface/interface.loader.server';
import {
  NodeClearButton,
  NodeCopyButton,
  NodeDownloadButton,
} from '~/components/pages/pipelines/Nodes/CustomNodes/NodeActionButtons';
import type { IInterfaceConfigFormProperty } from '~/components/pages/pipelines/pipeline.types';
import { usePipelineRun } from '~/components/pages/pipelines/usePipelineRun';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { loaderBuilder } from '~/utils.server';
import { metaWithDefaults } from '~/utils/metadata';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params, ...rest }, helpers) => {
    invariant(params.organizationId, 'organizationId not found');
    invariant(params.pipelineId, 'pipelineId not found');

    return publicInterfaceLoader({ params, ...rest }, helpers);
  })(args);
}

type BaseOutput = {
  isCompleted: boolean;
  type: string;
  name: string;
};

type TextOutput = BaseOutput & {
  value?: string | null;
};

type FileOutput = BaseOutput & {
  value?: File | null;
};

type Output = TextOutput | FileOutput;

export default function WebsiteForm() {
  const { pipelineId, organizationId, pipeline } =
    useLoaderData<typeof loader>();

  const defaultOutputs = useCallback(
    () =>
      pipeline.interface_config.form.outputs.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.name]: {
            name: curr.name,
            type: curr.type,
            isCompleted: false,
          },
        }),
        {} as Record<string, Output>,
      ),
    [pipeline.interface_config.form.outputs],
  );

  const [state, dispatch] = useReducer<
    FormInterfaceState,
    [FormInterfaceAction]
  >(formInterfaceReducer, {
    outputs: defaultOutputs(),
    isWaitingForOutputs: false,
  });

  const onBlockOutput: OnBlockOutput = (block, output, payload, metadata) => {
    if (doesOutputExist(block)) {
      dispatch(setOutput(block, (payload as any)?.message));
    }
  };

  const onBlockStatusChange: OnBlockStatusChange = (block, status) => {
    if (doesOutputExist(block)) {
      dispatch(setStatus(block, status));
    }
  };

  const onBlockError: OnBlockError = (block, error) => {
    console.log(block, error);
  };

  const onError: OnError = (error) => {
    console.log(error);
  };

  const doesOutputExist = (block: string) => {
    return Object.keys(state.outputs).includes(block);
  };

  const { status, startRun, push } = usePipelineRun({
    organizationId: organizationId as unknown as number,
    pipelineId: pipelineId as unknown as number,
    onBlockOutput,
    onBlockStatusChange,
    onBlockError,
    onError,
  });

  useEffect(() => {
    const id = setTimeout(() => {
      startRun({ initial_inputs: [], metadata: { interface: "form" } });
    }, 500);

    return () => {
      clearTimeout(id);
    };
  }, []);

  const handleOnSubmit = async (data: Record<string, unknown>) => {
    dispatch(generate());

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

    inputs.forEach((input) => {
      push(`${input.name}:${input.input}`, input.value);
    });
  };

  const { onSubmit, ...formProps } = useForm({
    onSubmit: handleOnSubmit,
    defaultValues: pipeline.interface_config.form.inputs.reduce(
      (acc, curr) => ({
        ...acc,
        [curr.name]: undefined,
      }),
      {},
    ),
  });

  return (
    <div className="flex flex-col justify-center items-center h-screen w-full text-foreground bg-secondary">
      <ChatHeader className="mb-4 max-w-3xl w-full p-2 md:p-4">
        <ChatHeading>{pipeline.name}</ChatHeading>

        <ChatStatus connectionStatus={status} />
      </ChatHeader>

      <div className="flex flex-col max-w-3xl w-full rounded-lg p-2 md:p-4">
        <FormContext value={formProps}>
          <form onSubmit={onSubmit} className="w-full border-b mb-6">
            <div className="flex flex-col items-start w-full gap-5">
              {pipeline.interface_config.form.inputs.map((input) => {
                return <FormInterfaceInput data={input} key={input.name} />;
              })}
            </div>

            <Button
              size="sm"
              className="my-6"
              disabled={
                formProps.state.isSubmitting || state.isWaitingForOutputs
              }
            >
              Submit
            </Button>
          </form>

          {Object.entries(state.outputs).map(([key, output]) => (
            <FormInterfaceOutput key={key} data={output} />
          ))}
        </FormContext>
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
      <div className="w-full">
        <Label>{data.name}</Label>
        <FormInterfaceTextInput data={data} />
        {/*<FieldMessage />*/}
      </div>
    );
  } else if (data.type === 'file_input') {
    return (
      <div className="w-full">
        <Label>{data.name}</Label>
        <FormInterfaceFileInput data={data} />
        <div className="mt-2">
          <FormInterfaceFilePreview data={data} />
        </div>
        {/*<FormInterfaceFilePreview />*/}

        {/*<p>{files[input.name]?.name}</p>*/}
      </div>
    );
  } else if (data.type === 'image_input') {
    return (
      <div className="w-full">
        <FieldLabel>{data.name}</FieldLabel>
        <FormInterfaceFileInput data={data} />
      </div>
    );
  }

  return null;
}

function FormInterfaceTextInput({ data }: FormInterfaceInputProps) {
  const { value, setValue } = useFormField(data.name);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  return (
    <TextInput
      required
      placeholder="Fill input..."
      name={data.name}
      onChange={onChange}
      value={value ?? ''}
      className="w-full"
    />
  );
}

function FormInterfaceFileInput({ data }: FormInterfaceInputProps) {
  const { setValue } = useFormField<File | null>(data.name);

  const onChange = (
    _: React.ChangeEvent<HTMLInputElement>,
    file: File | null,
  ) => {
    setValue(file);
  };

  return (
    <SmallFileUpload
      size="xxs"
      className="gap-2"
      name={data.name}
      onChange={onChange}
    >
      <FileUp className="w-3.5 h-3.5" />
      <span>Upload file</span>
    </SmallFileUpload>
  );
}

export function FormInterfaceFilePreview({ data }: FormInterfaceInputProps) {
  const { value, clear } = useFormField<File | File[] | null>(data.name);

  if (!value) return null;

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-1">
        {value.map((file) => (
          <FormInterfaceFilePreviewItem
            key={file.name}
            file={file}
            onRemove={clear}
          />
        ))}
      </div>
    );
  }

  return <FormInterfaceFilePreviewItem file={value} onRemove={clear} />;
}

export function FormInterfaceFilePreviewItem({
  file,
  onRemove,
}: {
  file: File;
  onRemove?: () => void;
}) {
  return (
    <div className="flex gap-1 items-start justify-between border px-2 py-1 bg-white rounded-lg w-fit min-w-[200px]">
      <div className="flex gap-1 items-start">
        <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5" />
        <div className="flex flex-col">
          <p className="text-xs font-semibold line-clamp-1" title={file.name}>
            {file.name}
          </p>
          <span className="text-[10px] text-muted-foreground">
            {renderSize(file.size)}
          </span>
        </div>
      </div>

      {onRemove ? (
        <IconButton
          icon={<X />}
          size="xxxs"
          variant="ghost"
          onlyIcon
          aria-label="Delete file"
          onClick={onRemove}
        />
      ) : null}
    </div>
  );
}

function renderSize(size: number) {
  if (size < 1000) return `${size.toFixed(0)} B`;
  else if (size < 1000 * 1000) {
    return `${(size / 1000).toFixed(0)} KB`;
  } else return `${(size / (1000 * 1000)).toFixed(0)} MB`;
}

interface FormInterfaceOutputProps {
  data: Output;
}

export function FormInterfaceOutput({ data }: FormInterfaceOutputProps) {
  if (data.type === 'text_output') {
    return <FormInterfaceTextOutput data={data as TextOutput} />;
  } else if (data.type === 'file_output') {
    return <FormInterfaceFileOutput data={data as FileOutput} />;
  }

  return null;
}

interface FormInterfaceTextOutputProps {
  data: TextOutput;
}

export function FormInterfaceTextOutput({
  data,
}: FormInterfaceTextOutputProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Label>{data.name}</Label>
        <div className="mb-1 flex gap-1">
          <NodeCopyButton text={data.value ?? ''} />

          <NodeDownloadButton blockName={data.name} text={data.value ?? ''} />

          <NodeClearButton onClear={() => {}} />
        </div>
      </div>
      <div className="bg-white w-full prose min-w-[280px] max-w-full px-3 py-1 overflow-y-auto resize min-h-[100px] max-h-[500px] border border-input rounded-md">
        <ChatMarkdown>{data.value ?? ''}</ChatMarkdown>
      </div>
    </div>
  );
}

interface FormInterfaceFileOutputProps {
  data: FileOutput;
}

export function FormInterfaceFileOutput({
  data,
}: FormInterfaceFileOutputProps) {
  return (
    <div>
      <p>FIle</p>
    </div>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Form',
    },
  ];
});
