import type { PropsWithChildren } from 'react';
import React, { useMemo } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import {
  CircleCheck,
  CircleX,
  EllipsisVertical,
  LockOpen,
  Trash,
} from 'lucide-react';
import { ClientOnly } from 'remix-utils/client-only';
import { ValidatedForm } from 'remix-validated-form';

import { CreatePipelineSchema } from '~/api/pipeline/pipeline.contracts';
import { HiddenField } from '~/components/form/fields/field.context';
import { IconButton } from '~/components/iconButton';
import { resolveBlockTypeIconPath } from '~/components/pages/pipelines/blockTypes.utils';
import type { BadgeProps } from '~/components/ui/badge';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardContentBooleanValue,
  CardContentColumnTitle,
  CardContentColumnValue,
  CardContentColumnWrapper,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { Duplicate } from '~/icons/Duplicate';
import { cn } from '~/utils/cn';
import { MonetaryValue } from '~/utils/MonetaryValue';
import { routes } from '~/utils/routes.utils';

import type {
  IBlockConfig,
  IInterfaceConfigForm,
  IPipeline,
} from '../pipeline.types';

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
  onDelete?: (pipeline: IPipeline, e: React.MouseEvent<HTMLDivElement>) => void;
}
export const PipelineListItemHeader = ({
  pipeline,
  onDelete,
}: PipelineListItemHeaderProps) => {
  const handleDelete = async (e: React.MouseEvent<HTMLDivElement>) => {
    onDelete?.(pipeline, e);
  };

  return (
    <CardHeader className="flex flex-row gap-4 items-start justify-between space-y-0">
      <div className="flex flex-col gap-2 mt-1.5 lg:items-center lg:flex-row">
        <CardTitle className="line-clamp-1 leading-[24px]">
          {pipeline.name}
        </CardTitle>

        <div className="flex gap-2 items-center">
          {isInterfaceInitialized(pipeline.interface_config.webchat) && (
            <PipelineItemInterfaceBadge
              interfaceConfig={pipeline.interface_config.webchat}
            >
              Webchat
            </PipelineItemInterfaceBadge>
          )}

          {isInterfaceInitialized(pipeline.interface_config.form) && (
            <PipelineItemInterfaceBadge
              interfaceConfig={pipeline.interface_config.form}
            >
              Form
            </PipelineItemInterfaceBadge>
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
      <div className="grid grid-cols-1 divide-y xl:divide-y-0 xl:grid-cols-[3fr_3fr_2fr_5fr_2fr] pt-3">
        <CardContentColumnWrapper>
          <CardContentColumnTitle>Logs</CardContentColumnTitle>
          <CardContentBooleanValue value={pipeline.logs_enabled}>
            {pipeline.logs_enabled ? (
              <>
                <CircleCheck className="w-3.5 h-3.5" /> Enabled
              </>
            ) : (
              <>
                <CircleX className="w-3.5 h-3.5" /> Disabled
              </>
            )}
          </CardContentBooleanValue>
        </CardContentColumnWrapper>

        <CardContentColumnWrapper>
          <CardContentColumnTitle>Budget limit</CardContentColumnTitle>
          <CardContentBooleanValue value={!!pipeline.budget_limit}>
            {pipeline.budget_limit ? (
              MonetaryValue.format(pipeline.budget_limit)
            ) : (
              <span>None</span>
            )}
          </CardContentBooleanValue>
        </CardContentColumnWrapper>

        <CardContentColumnWrapper>
          <CardContentColumnTitle>Runs</CardContentColumnTitle>
          <CardContentColumnValue>{pipeline.runs_count}</CardContentColumnValue>
        </CardContentColumnWrapper>

        <CardContentColumnWrapper className="overflow-hidden relative">
          <CardContentColumnTitle>Blocks</CardContentColumnTitle>

          {pipeline.config.blocks.length > 0 ? (
            <PipelineItemBlockList pipeline={pipeline} />
          ) : (
            <CardContentBooleanValue value={false}>
              None
            </CardContentBooleanValue>
          )}

          <div className="absolute h-6 w-8 right-0 bottom-2 bg-gradient-to-r from-transparent to-white pointer-events-none xl:bottom-0" />
        </CardContentColumnWrapper>
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

function PipelineItemInterfaceBadge({
  children,
  className,
  interfaceConfig,
  ...rest
}: BadgeProps & { interfaceConfig: IInterfaceConfigForm }) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <TooltipTrigger>
          <Badge
            variant="secondary"
            className={cn('text-[10px] py-0.5 px-1.5', className)}
            {...rest}
          >
            {interfaceConfig.public ? (
              <LockOpen className="w-2.5 h-2.5 mr-1" />
            ) : null}
            {children}
          </Badge>
        </TooltipTrigger>

        <TooltipContent side="top" className="text-xs max-w-[300px]">
          <p className="text-xs">
            <span className="text-muted-foreground mr-2 w-[50px] inline-block">
              Inputs:
            </span>
            {interfaceConfig.inputs.map((input) => input.name).join(', ')}
          </p>

          <p className="text-xs">
            <span className="text-muted-foreground mr-2 w-[50px] inline-block">
              Outputs:
            </span>
            {interfaceConfig.outputs.map((input) => input.name).join(', ')}
          </p>

          <p className="text-xs">
            <span className="text-muted-foreground mr-2 w-[50px] inline-block">
              Access:
            </span>
            {interfaceConfig.public ? 'public' : 'private'}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface PipelineItemBlockListProps {
  pipeline: IPipeline;
}

function PipelineItemBlockList({ pipeline }: PipelineItemBlockListProps) {
  return (
    <ul className="flex -space-x-2">
      {pipeline.config.blocks.map((block) => (
        <PipelineItemBlockListBlock block={block} key={block.name} />
      ))}
    </ul>
  );
}
interface PipelineItemBlockListBlockProps {
  block: IBlockConfig;
}
function PipelineItemBlockListBlock({
  block,
}: PipelineItemBlockListBlockProps) {
  const imageRef = React.useRef<HTMLImageElement>(null);

  const onImageError = () => {
    if (!imageRef.current) return;

    imageRef.current.src = resolveBlockTypeIconPath('default');
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <TooltipTrigger asChild>
          <li className="w-6 h-6 rounded-full bg-white border border-input flex justify-center items-center">
            <ClientOnly
              fallback={
                <div className="w-3.5 h-3.5 bg-secondary rounded-full" />
              }
            >
              {() => (
                <img
                  src={resolveBlockTypeIconPath(`type/${block.type}`)}
                  alt={block.type}
                  onError={onImageError}
                  className="w-3.5 h-3.5"
                  ref={imageRef}
                />
              )}
            </ClientOnly>
          </li>
        </TooltipTrigger>

        <TooltipContent side="top" className="text-xs">
          {block.type}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function isInterfaceInitialized(config: IInterfaceConfigForm) {
  return config.outputs.length > 0 && config.inputs.length > 0;
}
