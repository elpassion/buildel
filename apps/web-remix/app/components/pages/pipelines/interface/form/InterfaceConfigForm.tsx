import React, { useMemo, useState } from 'react';
import { Trash } from 'lucide-react';

import {
  InterfaceConfig,
  InterfaceConfigFormProperty,
} from '~/api/pipeline/pipeline.contracts';
import { CheckboxInputField } from '~/components/form/fields/checkbox.field';
import { Field, HiddenField } from '~/components/form/fields/field.context';
import type { FormApi } from '~/components/form/fields/form.field';
import {
  useControlField,
  useFieldArray,
} from '~/components/form/fields/form.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { SelectInput } from '~/components/form/inputs/select/select.input';
import { SubmitButton } from '~/components/form/submit';
import { IconButton } from '~/components/iconButton';
import { toSelectOption } from '~/components/pages/pipelines/interface/interface.utils';
import type {
  IBlockConfig,
  IInterfaceConfig,
  IInterfaceConfigFormOutputProperty,
  IInterfaceConfigFormProperty,
  IInterfaceConfigProperty,
  IPipeline,
} from '~/components/pages/pipelines/pipeline.types';
import { errorToast } from '~/components/toasts/errorToast';
import { Button } from '~/components/ui/button';
import { Label } from '~/components/ui/label';
import { cn } from '~/utils/cn';
import { ValidatedForm, withZod } from '~/utils/form';

interface InterfaceConfigFormProps {
  pipeline: IPipeline;
  onSubmit: (config: IInterfaceConfig) => void;
}

export const InterfaceConfigForm: React.FC<InterfaceConfigFormProps> = ({
  pipeline,
  onSubmit,
}) => {
  const validator = useMemo(() => withZod(InterfaceConfig), []);

  const inputs = pipeline.config.blocks.filter((block) =>
    ['text_input', 'file_input', 'image_input'].includes(block.type),
  );
  const outputs = pipeline.config.blocks.filter((block) =>
    ['text_output', 'file_output', 'image_output'].includes(block.type),
  );

  const handleOnSubmit = (data: IInterfaceConfig) => {
    const inputs = data.form.inputs.map((input) => {
      return {
        ...input,
      } as IInterfaceConfigFormProperty;
    });
    const outputs = data.form.outputs.map((output) => {
      return {
        ...output,
      } as IInterfaceConfigFormOutputProperty;
    });

    const body = {
      ...pipeline.interface_config,
      form: {
        inputs,
        outputs,
        public: data.form.public,
      },
    };

    onSubmit(body);
  };

  return (
    <ValidatedForm
      noValidate
      defaultValues={toSelectDefaults(pipeline.interface_config)}
      validator={validator}
      handleSubmit={handleOnSubmit}
    >
      <div className="flex flex-col gap-4 max-w-screen-2xl">
        <div>
          <Label className="mb-2 block">Inputs</Label>

          <Inputs blocks={inputs} />
        </div>

        <div>
          <Label className="mb-2 block">Outputs</Label>

          <Outputs blocks={outputs} />
        </div>

        <Field name="form.public">
          <Label className="flex gap-1 items-center">
            <CheckboxInputField />

            <span>Public</span>
          </Label>
        </Field>
      </div>

      <SubmitButton size="sm" className="mt-6">
        Save changes
      </SubmitButton>
    </ValidatedForm>
  );
};

interface IOProps {
  blocks: IBlockConfig[];
}
function Inputs({ blocks }: IOProps) {
  const items = useFieldArray<IInterfaceConfigFormProperty[]>('form.inputs');

  const [availableBlocks, setAvailableBlocks] = useState(
    blocks.filter(
      (block) =>
        !items.map((_, item) => item.value().name).includes(block.name),
    ),
  );

  const onAdd = () => {
    if (availableBlocks.length === 0) return;

    try {
      items.push(
        InterfaceConfigFormProperty.parse({
          name: availableBlocks[0].name,
          type: availableBlocks[0].type,
        }),
      );

      setAvailableBlocks((prev) => prev.slice(1));
    } catch (err) {
      console.error(err);
      errorToast('Something went wrong');
    }
  };

  const onGlobalChange = (prevName: string, nextName: string) => {
    const prevBlock = blocks.find((block) => block.name === prevName);
    if (!prevBlock) return;

    setAvailableBlocks(
      [prevBlock, ...availableBlocks].filter(
        (block) => block.name !== nextName,
      ),
    );
  };

  const onRemove = (index: number) => {
    const names = items.map((_, item) => item.value().name);

    setAvailableBlocks((prev) => [
      ...prev,
      blocks.find((block) => block.name === names[index]) as IBlockConfig,
    ]);

    items.remove(index);
  };

  const hasInputs = availableBlocks.length !== blocks.length;

  return (
    <IOWrapper
      className={cn({
        'overflow-y-auto': hasInputs,
      })}
    >
      <IOInnerWrapper className={cn({ 'min-w-[780px]': hasInputs })}>
        {hasInputs ? (
          <IOBody>
            <IOHeader>
              <IOHeaderCell>Input</IOHeaderCell>
              <IOHeaderCell>Label</IOHeaderCell>
              <IOHeaderCell>Description</IOHeaderCell>
              <IOHeaderCell>Required</IOHeaderCell>
            </IOHeader>

            {items.map((key, input, index) => {
              return (
                <Input
                  key={key}
                  input={input}
                  index={index}
                  onRemove={onRemove}
                  onGlobalChange={onGlobalChange}
                  options={availableBlocks}
                />
              );
            })}
          </IOBody>
        ) : null}

        <Button
          onClick={onAdd}
          disabled={availableBlocks.length === 0}
          type="button"
          size="xxs"
          variant="ghost"
        >
          Add input
        </Button>
      </IOInnerWrapper>
    </IOWrapper>
  );
}

function Input({
  input,
  index,
  onRemove,
  onGlobalChange,
  options,
}: {
  index: number;
  input: FormApi<IInterfaceConfigFormProperty>;
  onRemove: (index: number) => void;
  onGlobalChange: (prev: string, next: string) => void;
  options: IBlockConfig[];
}) {
  const [name, setName] = useControlField<string>(`form.inputs[${index}].name`);
  const [type, setType] = useControlField<string>(`form.inputs[${index}].type`);

  const selected = { type, name };
  const onSelect = (value: string) => {
    try {
      const values = decodeNameAndType(value);

      onGlobalChange(selected.name, values.name);

      setName(values.name);
      setType(values.type);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <IOItemWrapper>
      <HiddenField name={`form.inputs[${index}].type`} value={type} />
      <HiddenField name={`form.inputs[${index}].name`} value={name} />

      <SelectInput
        options={[...options.map(toSelectOption), toSelectOption(selected)]}
        value={name}
        placeholder="Select..."
        onChange={onSelect}
      />

      <Field name={`form.inputs[${index}].label`}>
        <TextInputField defaultValue={input.defaultValue()?.label} />
      </Field>

      <Field name={`form.inputs[${index}].description`}>
        <TextInputField defaultValue={input.defaultValue()?.description} />
      </Field>

      <Field name={`form.inputs[${index}].required`}>
        <div className="md:h-10 flex items-center">
          <CheckboxInputField defaultChecked={input.defaultValue()?.required} />
        </div>
      </Field>

      <IOItemButtonWrapper>
        <IconButton
          type="button"
          size="xxs"
          onClick={() => onRemove(index)}
          variant="ghost"
          icon={<Trash />}
        />
      </IOItemButtonWrapper>
    </IOItemWrapper>
  );
}

function Outputs({ blocks }: IOProps) {
  const items = useFieldArray<IInterfaceConfigFormProperty[]>('form.outputs');

  const [availableBlocks, setAvailableBlocks] = useState(
    blocks.filter(
      (block) =>
        !items.map((_, item) => item.value().name).includes(block.name),
    ),
  );

  const onAdd = () => {
    if (availableBlocks.length === 0) return;

    try {
      items.push(
        InterfaceConfigFormProperty.parse({
          name: availableBlocks[0].name,
          type: availableBlocks[0].type,
        }),
      );

      setAvailableBlocks((prev) => prev.slice(1));
    } catch (err) {
      console.error(err);
      errorToast('Something went wrong');
    }
  };

  const onGlobalChange = (prevName: string, nextName: string) => {
    const prevBlock = blocks.find((block) => block.name === prevName);
    if (!prevBlock) return;

    setAvailableBlocks(
      [prevBlock, ...availableBlocks].filter(
        (block) => block.name !== nextName,
      ),
    );
  };

  const onRemove = (index: number) => {
    const names = items.map((_, item) => item.value().name);

    setAvailableBlocks((prev) => [
      ...prev,
      blocks.find((block) => block.name === names[index]) as IBlockConfig,
    ]);

    items.remove(index);
  };

  const hasOutputs = availableBlocks.length !== blocks.length;

  return (
    <IOWrapper
      className={cn({
        'overflow-y-auto': hasOutputs,
      })}
    >
      <IOInnerWrapper className={cn({ 'min-w-[780px]': hasOutputs })}>
        {hasOutputs ? (
          <IOBody>
            <IOHeader>
              <IOHeaderCell>Output</IOHeaderCell>
              <IOHeaderCell>Label</IOHeaderCell>
              <IOHeaderCell>Description</IOHeaderCell>
              <span />
            </IOHeader>

            {items.map((key, output, index) => (
              <Output
                key={key}
                //eslint-disable-next-line
                //@ts-ignore
                output={output}
                index={index}
                onRemove={onRemove}
                onGlobalChange={onGlobalChange}
                options={availableBlocks}
              />
            ))}
          </IOBody>
        ) : null}

        <Button
          onClick={onAdd}
          disabled={availableBlocks.length === 0}
          type="button"
          size="xxs"
          variant="ghost"
        >
          Add output
        </Button>
      </IOInnerWrapper>
    </IOWrapper>
  );
}

function Output({
  output,
  index,
  onRemove,
  onGlobalChange,
  options,
}: {
  index: number;
  output: FormApi<IInterfaceConfigFormOutputProperty>;
  onRemove: (index: number) => void;
  onGlobalChange: (prev: string, next: string) => void;
  options: IBlockConfig[];
}) {
  const [name, setName] = useControlField<string>(
    `form.outputs[${index}].name`,
  );
  const [type, setType] = useControlField<string>(
    `form.outputs[${index}].type`,
  );

  const selected = { type, name };
  const onSelect = (value: string) => {
    try {
      const values = decodeNameAndType(value);

      onGlobalChange(selected.name, values.name);

      setName(values.name);
      setType(values.type);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <IOItemWrapper>
      <HiddenField name={`form.outputs[${index}].type`} value={type} />
      <HiddenField name={`form.outputs[${index}].name`} value={name} />

      <SelectInput
        options={[...options.map(toSelectOption), toSelectOption(selected)]}
        value={name}
        placeholder="Select..."
        onChange={onSelect}
      />

      <Field name={`form.outputs[${index}].label`}>
        <TextInputField defaultValue={output.defaultValue()?.label} />
      </Field>

      <Field name={`form.outputs[${index}].description`}>
        <TextInputField defaultValue={output.defaultValue()?.description} />
      </Field>

      <span />

      <IOItemButtonWrapper>
        <IconButton
          type="button"
          size="xxs"
          onClick={() => onRemove(index)}
          variant="ghost"
          icon={<Trash />}
        />
      </IOItemButtonWrapper>
    </IOItemWrapper>
  );
}

function IOWrapper({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'w-full max-w-[835px] bg-muted rounded-lg px-3 py-4',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function IOInnerWrapper({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex flex-col items-start gap-2', className)} {...rest}>
      {children}
    </div>
  );
}

function IOBody({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('space-y-2', className)} {...rest}>
      {children}
    </div>
  );
}

function IOHeader({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <header
      className={cn(
        'grid grid-cols-[2fr_2fr_4fr_1fr_1fr] gap-3 border-b pb-2',
        className,
      )}
      {...rest}
    >
      {children}
    </header>
  );
}

function IOHeaderCell({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-muted-foreground', className)} {...rest}>
      {children}
    </p>
  );
}

function IOItemWrapper({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'grid grid-cols-[2fr_2fr_4fr_1fr_1fr] gap-3 items-center w-full justify-between',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function IOItemButtonWrapper({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex justify-end items-center', className)} {...rest}>
      {children}
    </div>
  );
}

function toSelectDefaults(data: IInterfaceConfig) {
  return {
    form: {
      inputs: data.form.inputs.map((item) => item),
      outputs: data.form.outputs.map((item) => item),
      public: data.form.public,
    },
  };
}

function decodeNameAndType(value: string) {
  return JSON.parse(value) as IInterfaceConfigProperty;
}
