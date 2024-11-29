import type { PropsWithChildren } from 'react';
import React, { useCallback, useEffect, useReducer } from 'react';
import type { LoaderFunctionArgs, MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import type {
  OnBlockError,
  OnBlockOutput,
  OnBlockStatusChange,
  OnError,
} from '@buildel/buildel';
import { FileDown, FileText, FileUp, ImageDown, X } from 'lucide-react';
import invariant from 'tiny-invariant';

import { ChatHeader, ChatStatus } from '~/components/chat/Chat.components';
import { ChatHeading } from '~/components/chat/ChatHeading';
import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { SmallFileUpload } from '~/components/fileUpload/SmallFileUpload';
import { TextInput } from '~/components/form/inputs/text.input';
import { IconButton } from '~/components/iconButton';
import {
  FormContext,
  useForm,
  useFormField,
} from '~/components/pages/interfaces/form/formInterface.form';
import type {
  FileOutput,
  FormInterfaceAction,
  FormInterfaceState,
  Output,
  TextOutput,
} from '~/components/pages/interfaces/form/formInterface.reducer';
import {
  done,
  formInterfaceReducer,
  generate,
  setOutput,
  setStatus,
} from '~/components/pages/interfaces/form/formInterface.reducer';
import { publicInterfaceLoader } from '~/components/pages/pipelines/interface/interface.loader.server';
import {
  NodeCopyButton,
  NodeDownloadButton,
} from '~/components/pages/pipelines/Nodes/CustomNodes/NodeActionButtons';
import type {
  IInterfaceConfigFormOutputProperty,
  IInterfaceConfigFormProperty,
} from '~/components/pages/pipelines/pipeline.types';
import { usePipelineRun } from '~/components/pages/pipelines/usePipelineRun';
import { Button } from '~/components/ui/button';
import { InputMessage, Label } from '~/components/ui/label';
import { downloadFile } from '~/hooks/useDownloadFile';
import { loaderBuilder } from '~/utils.server';
import { metaWithDefaults } from '~/utils/metadata';

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

  useEffect(() => {
    if (!state.isWaitingForOutputs) return;

    const id = setTimeout(() => {
      dispatch(done());
    }, 7500);

    return () => {
      clearTimeout(id);
    };
  }, [state.isWaitingForOutputs]);

  const onBlockOutput: OnBlockOutput = (block, _output, payload, metadata) => {
    if (doesOutputExist(block)) {
      if (payload instanceof Uint8Array && 'file_type' in metadata) {
        dispatch(
          setOutput(
            block,
            new Blob([payload], { type: metadata.file_type as string }),
            metadata,
          ),
        );
      } else {
        dispatch(setOutput(block, (payload as any)?.message, metadata));
      }
    }
  };

  const onBlockStatusChange: OnBlockStatusChange = (block, status) => {
    if (doesOutputExist(block)) {
      dispatch(setStatus(block, !status));
    }
  };

  const onBlockError: OnBlockError = (block, error) => {
    console.error(block, error);
  };

  const onError: OnError = (error) => {
    console.error(error);
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
      startRun({ initial_inputs: [], metadata: { interface: 'form' } });
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
    requiredFields: pipeline.interface_config.form.inputs.reduce(
      (acc, curr) => {
        if (curr.required) {
          return [...acc, curr.name];
        }
        return acc;
      },
      [] as string[],
    ),
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
      <ChatHeader className="mb-4 w-full py-6 px-2 md:px-4 absolute top-0 left-0 right-0">
        <ChatHeading>{pipeline.name}</ChatHeading>

        <ChatStatus connectionStatus={status} />
      </ChatHeader>

      <div className="flex flex-col max-w-3xl w-full rounded-lg p-2 md:p-4">
        <FormContext value={formProps}>
          <form onSubmit={onSubmit} className="w-full border-b mb-6">
            <div className="flex flex-col items-start w-full gap-4">
              {pipeline.interface_config.form.inputs.map((input) => {
                return (
                  <div key={input.name} className="flex flex-col gap-2 w-full">
                    <FormInterfaceInput data={input} />
                  </div>
                );
              })}
            </div>

            <Button
              size="sm"
              className="mt-4 mb-6"
              disabled={
                formProps.state.isSubmitting || state.isWaitingForOutputs
              }
            >
              Submit
            </Button>
          </form>

          <div className="flex flex-col gap-4">
            {pipeline.interface_config.form.outputs.map((output) => (
              <FormInterfaceOutput
                key={output.name}
                data={output}
                result={
                  state.isWaitingForOutputs
                    ? { ...state.outputs[output.name], value: undefined }
                    : state.outputs[output.name]
                }
              />
            ))}
          </div>
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
      <>
        <Label>{data.label || data.name}</Label>
        <div>
          <FormInterfaceTextInput data={data} />
          <FormInterfaceFieldMessage data={data}>
            {data.description}
          </FormInterfaceFieldMessage>
        </div>
      </>
    );
  } else if (data.type === 'file_input') {
    return (
      <>
        <Label>{data.label || data.name}</Label>
        <div>
          <FormInterfaceFileInput data={data} />
          <FormInterfaceFieldMessage data={data}>
            {data.description}
          </FormInterfaceFieldMessage>
        </div>

        <div>
          <FormInterfaceFilePreview
            data={data}
            renderItem={(file, { clear }) => (
              <FormInterfaceFilePreviewItem
                key={file.name}
                file={file}
                action={
                  <IconButton
                    icon={<X />}
                    size="xxxs"
                    variant="ghost"
                    onlyIcon
                    aria-label="Delete file"
                    onClick={clear}
                  />
                }
              />
            )}
          />
        </div>
      </>
    );
  } else if (data.type === 'image_input') {
    return (
      <>
        <Label>{data.label || data.name}</Label>

        <div>
          <FormInterfaceFileInput data={data} accept="image/*" />
          <FormInterfaceFieldMessage data={data}>
            {data.description}
          </FormInterfaceFieldMessage>
        </div>

        <div>
          <FormInterfaceFilePreview
            data={data}
            renderItem={(file, { clear }) => (
              <FormInterfaceImagePreviewItem
                key={file.name}
                file={file}
                action={
                  <IconButton
                    icon={<X />}
                    size="xxxs"
                    variant="secondary"
                    aria-label="Delete file"
                    onClick={clear}
                  />
                }
              />
            )}
          />
        </div>
      </>
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
      placeholder="Fill input..."
      name={data.name}
      onChange={onChange}
      value={value ?? ''}
      className="w-full"
    />
  );
}

function FormInterfaceFieldMessage({
  data,
  children,
}: PropsWithChildren<FormInterfaceInputProps>) {
  const { errors } = useFormField(data.name);

  const isError = errors && errors.length > 0;

  const body = isError ? errors.join(', ') : children;

  if (!body) {
    return null;
  }

  return (
    <InputMessage size="sm" isError={isError}>
      {body}
    </InputMessage>
  );
}

function FormInterfaceFileInput({
  data,
  accept,
}: FormInterfaceInputProps & { accept?: string }) {
  const { setValue } = useFormField<File | null>(data.name);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    file: File | null,
  ) => {
    setValue(file);
    e.target.value = '';
  };

  return (
    <SmallFileUpload
      size="xxs"
      accept={accept}
      className="gap-2"
      name={data.name}
      onChange={onChange}
    >
      <FileUp className="w-3.5 h-3.5" />
      <span>Upload</span>
    </SmallFileUpload>
  );
}

export function FormInterfaceFilePreview({
  data,
  renderItem,
}: FormInterfaceInputProps & {
  renderItem: (file: File, args: { clear: () => void }) => React.ReactNode;
}) {
  const { value, clear } = useFormField<File | File[] | null>(data.name);

  if (!value) return null;

  if (Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-1">
        {value.map((file) => (
          <React.Fragment key={file.name}>
            {renderItem(file, { clear })}
          </React.Fragment>
        ))}
      </div>
    );
  }

  return renderItem(value, { clear });
}

export function FormInterfaceFilePreviewItem({
  file,
  action,
}: {
  file: File;
  action?: React.ReactNode;
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

      {action}
    </div>
  );
}

export function FormInterfaceImagePreviewItem({
  file,
  action,
}: {
  file: File;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative max-w-[150px] max-h-[150px] rounded-lg overflow-hidden group">
      <img
        src={URL.createObjectURL(file)}
        alt={file.name}
        className="group-hover:scale-105 transition object-cover object-center"
      />
      {action ? <div className="absolute top-0.5 right-1">{action}</div> : null}
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
  result: Output;
  data: IInterfaceConfigFormOutputProperty;
}

export function FormInterfaceOutput({
  data,
  result,
}: FormInterfaceOutputProps) {
  if (result.type === 'text_output') {
    return (
      <FormInterfaceTextOutput result={result as TextOutput} data={data} />
    );
  } else if (
    (result.type === 'file_output' || result.type === 'image_output') &&
    result.value &&
    result.metadata &&
    !result.metadata.file_type.includes('image')
  ) {
    return (
      <FormInterfaceFileOutput
        result={result as Required<FileOutput>}
        data={data}
      />
    );
  } else if (
    result.type === 'image_output' &&
    result.value &&
    result.metadata &&
    result.metadata.file_type.includes('image')
  ) {
    return (
      <FormInterfaceImageOutput
        result={result as Required<FileOutput>}
        data={data}
      />
    );
  }

  return null;
}

interface FormInterfaceTextOutputProps {
  result: TextOutput;
  data: IInterfaceConfigFormOutputProperty;
}

export function FormInterfaceTextOutput({
  data,
  result,
}: FormInterfaceTextOutputProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap2 flex-wrap mb-2">
        <Label>{data.label || data.name}</Label>
        <div className="mb-1 flex gap-1">
          <NodeCopyButton text={result.value ?? ''} />

          <NodeDownloadButton blockName={data.name} text={result.value ?? ''} />
        </div>
      </div>

      <div className="bg-white w-full prose min-w-[280px] max-w-full px-3 py-1 overflow-y-auto resize min-h-[100px] max-h-[500px] border border-input rounded-md">
        <ChatMarkdown>{result.value ?? ''}</ChatMarkdown>
      </div>

      {data.description ? (
        <InputMessage size="sm">{data.description}</InputMessage>
      ) : null}
    </div>
  );
}

interface FormInterfaceFileOutputProps {
  result: Required<FileOutput>;
  data: IInterfaceConfigFormOutputProperty;
}

export function FormInterfaceFileOutput({
  data,
  result,
}: FormInterfaceFileOutputProps) {
  const fileName = result.metadata?.file_name ?? 'file';

  const download = () => {
    downloadFile(result.value, fileName);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>{data.label || data.name}</Label>

      {result.value ? (
        <FormInterfaceFilePreviewItem
          file={new File([result.value], fileName)}
          action={
            <IconButton
              icon={<FileDown />}
              size="xxxs"
              variant="ghost"
              onlyIcon
              aria-label="Download file"
              onClick={download}
            />
          }
        />
      ) : null}

      {data.description ? (
        <InputMessage size="sm">{data.description}</InputMessage>
      ) : null}
    </div>
  );
}

export function FormInterfaceImageOutput({
  data,
  result,
}: FormInterfaceFileOutputProps) {
  const fileName = result.metadata?.file_name ?? 'image';

  const download = () => {
    downloadFile(result.value, fileName);
  };

  return (
    <div className="flex flex-col gap-2">
      <Label>{data.label || data.name}</Label>

      {result.value ? (
        <FormInterfaceImagePreviewItem
          file={new File([result.value], fileName)}
          action={
            <IconButton
              icon={<ImageDown />}
              size="xxxs"
              variant="secondary"
              aria-label="Download image"
              onClick={download}
            />
          }
        />
      ) : null}

      {data.description ? (
        <InputMessage size="sm">{data.description}</InputMessage>
      ) : null}
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
