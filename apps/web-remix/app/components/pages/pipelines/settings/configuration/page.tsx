import React, { useCallback, useState } from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { ValidatedForm } from 'remix-validated-form';
import z from 'zod';

import { UpdatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { CopyCodeButton } from '~/components/actionButtons/CopyCodeButton';
import { EditorField } from '~/components/form/fields/editor.field';
import { Field as FormField } from '~/components/form/fields/field.context';
import type { JSONSchemaField } from '~/components/form/schema/SchemaParser';
import { generateZODSchema } from '~/components/form/schema/SchemaParser';
import { SubmitButton } from '~/components/form/submit';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
import { successToast } from '~/components/toasts/successToast';
import { routes } from '~/utils/routes.utils';

import type { loader } from './loader.server';

const schema = z.object({
  configuration: z.string(),
});

export function SettingsConfigurationPage() {
  const { pipeline, organizationId, pipelineId } =
    useLoaderData<typeof loader>();
  const updateFetcher = useFetcher<IPipeline>();
  const validator = React.useMemo(() => withZod(schema), []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleUpdatePipeline = useCallback(
    (pipeline: IPipeline) => {
      updateFetcher.submit(pipeline, {
        method: 'PUT',
        encType: 'application/json',
        action: routes.pipelineBuild(organizationId, pipelineId) + '?index',
      });
    },
    [updateFetcher],
  );

  const handleOnSubmit = async (
    data: { configuration: string },
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    setErrors({});
    try {
      const config = JSON.parse(data.configuration);
      const validator = withZod(UpdatePipelineSchema);

      const result = await validator.validate(config);

      if (result.error) return setErrors(result.error.fieldErrors);

      const validatedBlocks = (await Promise.all(
        result.data.config.blocks.map(async (block) => {
          const schema = generateZODSchema(
            block.block_type!.schema as JSONSchemaField,
            false,
            {
              organization_id: organizationId,
              pipeline_id: pipelineId,
              block_name: block.name,
            },
          );

          const validator = withZod(schema);
          const validatedBlock = await validator.validate(block);

          if (validatedBlock) {
            return validatedBlock.data;
          }
          return block;
        }),
      )) as any[];

      result.data.config.blocks = result.data.config.blocks.map((block, i) => {
        return {
          ...block,
          ...validatedBlocks[i],
        };
      });

      handleUpdatePipeline(result.data as IPipeline);
      successToast({ description: 'Configuration updated' });
    } catch (e) {
      console.log(e);
      setErrors({ configuration: 'Invalid JSON configuration' });
    }
  };

  return (
    <ValidatedForm
      validator={validator}
      className="flex flex-col h-[95%]"
      defaultValues={{ configuration: JSON.stringify(pipeline) }}
      onSubmit={handleOnSubmit}
      noValidate
    >
      <div className="grow">
        <FormField name="configuration">
          <EditorField
            height="450px"
            loading={
              <div className="w-full h-[450px] border border-neutral-200 rounded-lg" />
            }
            label={
              <div className="flex justify-between gap-2">
                <p>Configuration</p>
                <CopyCodeButton value={JSON.stringify(pipeline)} />
              </div>
            }
            supportingText="Paste the workflow configuration in JSON format."
            language="json"
            error={
              Object.keys(errors).length > 0 ? (
                <span className="flex gap-2 flex-wrap">
                  {Object.keys(errors).map((key) => (
                    <span key={key}>
                      {key}: {errors[key]}
                    </span>
                  ))}
                </span>
              ) : null
            }
          />
        </FormField>
      </div>

      <SubmitButton
        isFluid
        size="sm"
        className="mt-6"
        aria-label="Save configuration"
      >
        Save
      </SubmitButton>
    </ValidatedForm>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: 'Configuration',
    },
  ];
};
