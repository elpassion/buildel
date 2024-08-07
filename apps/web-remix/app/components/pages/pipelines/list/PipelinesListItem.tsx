import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import { useFetcher } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { EllipsisVertical, PlayCircle, Trash } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import { CreatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { HiddenField } from '~/components/form/fields/field.context';
import { IconButton } from '~/components/iconButton';
import { confirm } from '~/components/modal/confirm';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Duplicate } from '~/icons/Duplicate';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

import type { IPipeline } from '../pipeline.types';

interface PipelinesListItemProps extends PropsWithChildren {
  className?: string;
}
export const PipelinesListItem = ({
  children,
  className,
}: PipelinesListItemProps) => {
  return <Card className={cn('h-full', className)}>{children}</Card>;
};

interface PipelineListItemHeaderProps {
  pipeline: IPipeline;
}
export const PipelineListItemHeader = ({
  pipeline,
}: PipelineListItemHeaderProps) => {
  const fetcher = useFetcher();

  const handleDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
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
    <CardHeader className="flex flex-row gap-4 items-center justify-between space-y-0">
      <CardTitle className="line-clamp-2">{pipeline.name}</CardTitle>

      <div className="w-fit h-fit" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="text-muted-foreground">
            <IconButton
              variant="ghost"
              size="xs"
              icon={<EllipsisVertical className="w-4 h-4" />}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DuplicateForm pipeline={pipeline} />
            <DropdownMenuItem
              className="w-full flex gap-1 items-center text-red-500"
              onClick={handleDelete}
              aria-label={`Remove workflow: ${pipeline.name}`}
              title={`Remove workflow: ${pipeline.name}`}
            >
              <Trash className="w-4 h-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
  );
};

interface PipelineListItemContentProps {
  pipeline: IPipeline;
}
export const PipelineListItemContent = ({
  pipeline,
}: PipelineListItemContentProps) => {
  return (
    <CardContent>
      <Badge
        variant="secondary"
        className="flex gap-1 items-center w-fit text-muted-foreground"
      >
        <PlayCircle className="w-4 h-4  " />
        <span>{pipeline.runs_count} runs</span>
      </Badge>
    </CardContent>
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

      <Button
        size="xs"
        variant="ghost"
        className="w-full flex gap-1 justify-start items-center "
        aria-label={`Duplicate workflow: ${pipeline.name}`}
        title={`Duplicate workflow: ${pipeline.name}`}
      >
        <Duplicate className="w-4 h-4" />
        <span>Duplicate</span>
      </Button>
    </ValidatedForm>
  );
}
