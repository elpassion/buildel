import React, { useEffect, useState } from 'react';
import { useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import { v4 as uuidv4 } from 'uuid';
import z from 'zod';

import { EditorField } from '~/components/form/fields/editor.field';
import { Field as FormField } from '~/components/form/fields/field.context';
import { generateZODSchema } from '~/components/form/schema/SchemaParser';
import { SubmitButton } from '~/components/form/submit';
import type { loader } from '~/components/pages/pipelines/build/loader.server';
import type { IBlockConfig } from '~/components/pages/pipelines/pipeline.types';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import {
  ActionSidebar,
  ActionSidebarHeader,
} from '~/components/sidebar/ActionSidebar';

import { usePasteConfig } from './PasteBlockConfigProvider';

export function PasteBlockConfiguration({
  onSubmit,
}: {
  onSubmit: (block: IBlockConfig) => void;
}) {
  const [formKey, setFormKey] = useState(uuidv4());
  const { isShown, hide } = usePasteConfig();
  const { status: runStatus } = useRunPipeline();

  const handleOnSubmit = (block: IBlockConfig) => {
    onSubmit(block);
    hide();
  };

  useEffect(() => {
    // hack for resetting editor value when closing sidebar
    if (!isShown) {
      setFormKey(uuidv4());
    }
  }, [isShown]);

  return (
    <ActionSidebar isOpen={isShown} onClose={hide} className="md:w-[460px]">
      <ActionSidebarHeader
        heading="Create block"
        subheading="Copy the block configuration and paste it here for easy block creation."
        onClose={hide}
      />

      <PasteBlockConfigurationForm
        key={formKey}
        onSubmit={handleOnSubmit}
        disabled={runStatus !== 'idle'}
      />
    </ActionSidebar>
  );
}

const schema = z.object({
  configuration: z.string(),
});

interface PasteBlockConfigurationFormProps {
  onSubmit: (block: IBlockConfig) => void;
  disabled?: boolean;
}

export function PasteBlockConfigurationForm({
  onSubmit,
  disabled,
}: PasteBlockConfigurationFormProps) {
  const validator = React.useMemo(() => withZod(schema), []);
  const { blockTypes } = useLoaderData<typeof loader>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOnSubmit = async (
    data: { configuration: string },
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setErrors({});
    try {
      const config = JSON.parse(data.configuration);

      if (!config.type) {
        return setErrors({ configuration: "Missing block 'type'" });
      }
      if (!config.opts) {
        return setErrors({ configuration: "Missing block 'opts'" });
      }

      const index = blockTypes.findIndex((b) => b.type === config.type);

      if (index < 0) {
        return setErrors({ configuration: "Incorrect block 'type'" });
      }

      const block = blockTypes[index];

      config.block_type = block;

      const blockSchema = generateZODSchema(block.schema.properties.opts);
      const validator = withZod(blockSchema);

      const result = await validator.validate(config.opts);

      if (result.error) {
        return setErrors({
          configuration: 'There is an error in block configuration',
        });
      }

      onSubmit({ inputs: [], connections: [], ...config });
      e.currentTarget?.reset();
    } catch (e) {
      console.log(e);
      setErrors({ configuration: 'Invalid configuration' });
    }
  };

  return (
    <ValidatedForm
      validator={validator}
      onSubmit={handleOnSubmit}
      className="h-[95%] flex flex-col"
      noValidate
    >
      <div className="grow">
        <FormField name="configuration">
          <EditorField
            height="350px"
            label="Block configuration"
            supportingText="Paste the block configuration in JSON format."
            language="json"
            error={errors.configuration}
          />
        </FormField>
      </div>

      <SubmitButton
        isFluid
        size="sm"
        variant="filled"
        className="mt-6"
        disabled={disabled}
      >
        Add block
      </SubmitButton>
    </ValidatedForm>
  );
}
