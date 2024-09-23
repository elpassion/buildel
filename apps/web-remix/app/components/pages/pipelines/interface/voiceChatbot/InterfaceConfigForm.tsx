import React, { useMemo } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';

import { InterfaceConfig } from '~/api/pipeline/pipeline.contracts';
import { CheckboxInputField } from '~/components/form/fields/checkbox.field';
import { Field } from '~/components/form/fields/field.context';
import { SelectField } from '~/components/form/fields/select.field';
import { SubmitButton } from '~/components/form/submit';
import type {
  IBlockConfig,
  IInterfaceConfig,
  IPipeline,
} from '~/components/pages/pipelines/pipeline.types';
import { Label } from '~/components/ui/label';

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
    ['audio_input'].includes(block.type),
  );
  const outputs = pipeline.config.blocks.filter(
    (block) => block.type === 'audio_output',
  );

  const handleOnSubmit = (
    data: IInterfaceConfig,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const inputs = data.voice.inputs.map((input) => {
      const parsed = JSON.parse(input as unknown as string);
      return {
        name: parsed.name,
        type: parsed.type,
      };
    });
    const outputs = data.voice.outputs.map((output) => {
      const parsed = JSON.parse(output as unknown as string);
      return {
        name: parsed.name,
        type: parsed.type,
      };
    });

    const body = {
      ...pipeline.interface_config,
      voice: {
        inputs,
        outputs,
        public: data.voice.public,
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
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center max-w-screen-2xl">
        <Field name="voice.inputs">
          <SelectField
            options={inputs.map(toSelectOption)}
            mode="multiple"
            label="Input"
          />
        </Field>

        <Field name="voice.outputs">
          <SelectField
            options={outputs.map(toSelectOption)}
            mode="multiple"
            label="Output"
          />
        </Field>

        <Field name="voice.public">
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

function toSelectOption(item: IBlockConfig) {
  return {
    id: item.name.toString(),
    value: JSON.stringify({ name: item.name, type: item.type }),
    label: item.name,
  };
}

function toSelectDefaults(data: IInterfaceConfig) {
  return {
    voice: {
      inputs: data.voice.inputs.map((item) =>
        JSON.stringify({ name: item.name, type: item.type }),
      ),
      outputs: data.voice.outputs.map((item) =>
        JSON.stringify({ name: item.name, type: item.type }),
      ),
      public: data.voice.public,
    },
  };
}
