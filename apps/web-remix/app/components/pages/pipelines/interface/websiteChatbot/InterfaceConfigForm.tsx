import React, { useMemo } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { CheckboxInputField } from '~/components/form/fields/checkbox.field';
import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { SelectField } from '~/components/form/fields/select.field';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import type {
  IBlockConfig,
  IInterfaceConfig,
  IPipeline,
} from '~/components/pages/pipelines/pipeline.types';
import { Label } from '~/components/ui/label';

import { schema } from './schema';

interface InterfaceConfigFormProps {
  pipeline: IPipeline;
  onSubmit: (config: IInterfaceConfig) => void;
}

export const InterfaceConfigForm: React.FC<InterfaceConfigFormProps> = ({
  pipeline,
  onSubmit,
}) => {
  const validator = useMemo(() => withZod(schema), []);

  const inputs = pipeline.config.blocks.filter((block) =>
    ['text_input', 'file_input', 'image_input'].includes(block.type),
  );
  const outputs = pipeline.config.blocks.filter(
    (block) => block.type === 'text_output',
  );

  const handleOnSubmit = (
    data: IInterfaceConfig,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const inputs = data.webchat.inputs.map((input) => {
      const parsed = JSON.parse(input as unknown as string);
      return {
        name: parsed.name as string,
        type: parsed.type as string,
      };
    });
    const outputs = data.webchat.outputs.map((output) => {
      const parsed = JSON.parse(output as unknown as string);
      return {
        name: parsed.name as string,
        type: parsed.type as string,
      };
    });

    const body: IInterfaceConfig = {
      ...pipeline.interface_config,
      webchat: {
        inputs,
        outputs,
        description: data.webchat.description,
        public: data.webchat.public,
      },
    };
    onSubmit(body);
  };

  return (
    <ValidatedForm
      defaultValues={toSelectDefaults(pipeline.interface_config) as any}
      validator={validator}
      noValidate
      onSubmit={handleOnSubmit}
    >
      <div className="flex flex-col gap-3">
        <div className="w-full grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-center">
          <Field name="webchat.inputs">
            <SelectField
              options={inputs.map(toSelectOption)}
              mode="multiple"
              label="Input"
            />
          </Field>

          <Field name="webchat.outputs">
            <SelectField
              options={outputs.map(toSelectOption)}
              mode="multiple"
              label="Output"
              className="!min-w-full"
            />
          </Field>

          <Field name="webchat.public">
            <Label className="flex gap-1 items-center">
              <CheckboxInputField />

              <span>Public</span>
            </Label>
          </Field>
        </div>

        <div className="w-full max-w-[805px]">
          <Field name="webchat.description">
            <FieldLabel>Description</FieldLabel>
            <TextInputField />
          </Field>
        </div>
      </div>

      <SubmitButton size="sm" className="mt-6">
        Save changes
      </SubmitButton>
    </ValidatedForm>
  );
};

function toSelectOption(item: IBlockConfig) {
  return {
    id: item.name.toString(),
    value: JSON.stringify({ name: item.name, type: item.type }),
    label: item.name,
  };
}

function toSelectDefaults(data: IInterfaceConfig) {
  return {
    webchat: {
      inputs: data.webchat.inputs.map((item) =>
        JSON.stringify({ name: item.name, type: item.type }),
      ),
      outputs: data.webchat.outputs.map((item) =>
        JSON.stringify({ name: item.name, type: item.type }),
      ),
      description: data.webchat.description,
      public: data.webchat.public,
    },
  };
}
