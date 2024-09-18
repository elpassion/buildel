import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import { useFetcher } from '@remix-run/react';
import { withZod } from '@remix-validated-form/with-zod';
import { CircleCheck, CircleX, EllipsisVertical, Trash } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import { CreatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { HiddenField } from '~/components/form/fields/field.context';
import { IconButton } from '~/components/iconButton';
import { confirm } from '~/components/modal/confirm';
import type { BadgeProps } from '~/components/ui/badge';
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
import { MonetaryValue } from '~/utils/MonetaryValue';
import { routes } from '~/utils/routes.utils';

import type { IInterfaceConfigForm, IPipeline } from '../pipeline.types';

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
    <CardHeader className="flex flex-row gap-4 items-start justify-between space-y-0">
      <div className="flex flex-col gap-2 mt-1.5 lg:items-center lg:flex-row">
        <CardTitle className="line-clamp-1 leading-[24px]">
          {pipeline.name}
        </CardTitle>

        <div className="flex gap-2 items-center">
          {isInterfaceInitialized(pipeline.interface_config.webchat) && (
            <PipelineItemInterfaceBadge>Webchat</PipelineItemInterfaceBadge>
          )}

          {isInterfaceInitialized(pipeline.interface_config.form) && (
            <PipelineItemInterfaceBadge>Form</PipelineItemInterfaceBadge>
          )}
        </div>
      </div>

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
    <CardContent className="border-t border-input">
      <div className="grid grid-cols-1 divide-y xl:divide-y-0 xl:grid-cols-[3fr_3fr_2fr_2fr_2fr_2fr] pt-3">
        <PipelinesItemColumnWrapper>
          <PipelinesItemColumnTitle>Logs</PipelinesItemColumnTitle>
          <PipelinesItemColumnBooleanValue value={pipeline.logs_enabled}>
            {pipeline.logs_enabled ? (
              <>
                <CircleCheck className="w-3.5 h-3.5" /> Enabled
              </>
            ) : (
              <>
                <CircleX className="w-3.5 h-3.5" /> Disabled
              </>
            )}
          </PipelinesItemColumnBooleanValue>
        </PipelinesItemColumnWrapper>

        <PipelinesItemColumnWrapper>
          <PipelinesItemColumnTitle>Budget limit</PipelinesItemColumnTitle>
          <PipelinesItemColumnBooleanValue value={!!pipeline.budget_limit}>
            {pipeline.budget_limit ? (
              MonetaryValue.format(pipeline.budget_limit)
            ) : (
              <span>None</span>
            )}
          </PipelinesItemColumnBooleanValue>
        </PipelinesItemColumnWrapper>

        <PipelinesItemColumnWrapper>
          <PipelinesItemColumnTitle>Runs</PipelinesItemColumnTitle>
          <PipelinesItemColumnValue>
            {pipeline.runs_count}
          </PipelinesItemColumnValue>
        </PipelinesItemColumnWrapper>

        <PipelinesItemColumnWrapper>
          <PipelinesItemColumnTitle>Blocks</PipelinesItemColumnTitle>
          <PipelinesItemColumnValue>
            {pipeline.config.blocks.length}
          </PipelinesItemColumnValue>
        </PipelinesItemColumnWrapper>
      </div>
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

function PipelinesItemColumnWrapper({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex gap-1 justify-between items-center py-2 xl:flex-col xl:items-start xl:py-0 xl:justify-start',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function PipelinesItemColumnTitle({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-neutral-300', className)} {...rest}>
      {children}
    </p>
  );
}

function PipelinesItemColumnValue({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-foreground', className)} {...rest}>
      {children}
    </p>
  );
}

function PipelinesItemColumnBooleanValue({
  children,
  className,
  value,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement> & { value: boolean }) {
  return (
    <PipelinesItemColumnValue
      className={cn(
        'flex gap-1 items-center',
        { 'text-neutral-400': !value },
        className,
      )}
      {...rest}
    >
      {children}
    </PipelinesItemColumnValue>
  );
}

function PipelineItemInterfaceBadge({
  children,
  className,
  ...rest
}: BadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn('text-[10px] py-0.5 px-1.5', className)}
      {...rest}
    >
      {children}
    </Badge>
  );
}

function isInterfaceInitialized(config: IInterfaceConfigForm) {
  return config.outputs.length > 0 && config.inputs.length > 0;
}
