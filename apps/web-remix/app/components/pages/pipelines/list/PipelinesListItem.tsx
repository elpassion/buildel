import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import { useFetcher } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import classNames from 'classnames';
import { Trash } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import { CreatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { HiddenField } from '~/components/form/fields/field.context';
import { IconButton } from '~/components/iconButton';
import { confirm } from '~/components/modal/confirm';
import { Duplicate } from '~/icons/Duplicate';
import { routes } from '~/utils/routes.utils';

import type { IPipeline } from '../pipeline.types';

interface PipelinesListItemProps extends PropsWithChildren {
  className?: string;
}
export const PipelinesListItem = ({
  children,
  className,
}: PipelinesListItemProps) => {
  return (
    <article
      className={classNames(
        'h-full group bg-white border border-neutral-100 px-6 py-4 rounded-lg text-foreground transition cursor-pointer hover:border-blue-200 flex flex-col gap-5 justify-between',
        className,
      )}
    >
      {children}
    </article>
  );
};

interface PipelineListItemHeaderProps {
  pipeline: IPipeline;
}
export const PipelineListItemHeader = ({
  pipeline,
}: PipelineListItemHeaderProps) => {
  const fetcher = useFetcher();

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    confirm({
      onConfirm: async () =>
        fetcher.submit({ pipelineId: pipeline.id }, { method: 'delete' }),
      confirmText: 'Delete workflow',
      children: (
        <p className="text-sm">
          You are about to delete the "{pipeline.name}” workflow from your
          organisation. This action is irreversible.
        </p>
      ),
    });
  };

  return (
    <header className="flex items-center justify-between">
      <h2 className="text-lg font-bold text-foreground group-hover:text-blue-500 transition line-clamp-2">
        {pipeline.name}
      </h2>

      <div className="flex items-center justify-between">
        <div
          className="flex gap-1"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <DuplicateForm pipeline={pipeline} />

          <IconButton
            size="xxs"
            variant="ghost"
            aria-label={`Remove workflow: ${pipeline.name}`}
            className="opacity-0 group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-red-500"
            title={`Remove workflow: ${pipeline.name}`}
            icon={<Trash />}
            onClick={handleDelete}
          />
        </div>
      </div>
    </header>
  );
};

interface PipelineListItemContentProps {
  pipeline: IPipeline;
}
export const PipelineListItemContent = ({
  pipeline,
}: PipelineListItemContentProps) => {
  return (
    <main>
      <p className="text-sm">{pipeline.runs_count} runs</p>
    </main>
  );
};

interface DuplicateFormProps {
  pipeline: IPipeline;
}

function DuplicateForm({ pipeline }: DuplicateFormProps) {
  const validator = useMemo(() => withZod(CreatePipelineSchema), []);

  return (
    <ValidatedForm
      method="POST"
      validator={validator}
      action={routes.pipelinesNew(pipeline.organization_id)}
    >
      <HiddenField name="pipeline.name" value={pipeline.name + ' copy'} />

      <HiddenField name="pipeline.config.version" value="1" />

      <HiddenField
        name="pipeline.config.blocks"
        value={JSON.stringify(pipeline.config.blocks)}
      />

      <IconButton
        size="xxs"
        variant="ghost"
        aria-label={`Duplicate workflow: ${pipeline.name}`}
        className="opacity-0 group-hover:opacity-100 !bg-neutral-700 !text-white !text-sm hover:!text-primary-500"
        title={`Duplicate workflow: ${pipeline.name}`}
        icon={<Duplicate />}
      />
    </ValidatedForm>
  );
}
