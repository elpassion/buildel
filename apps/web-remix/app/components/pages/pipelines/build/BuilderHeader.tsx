import type { PropsWithChildren } from 'react';
import React, { useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams } from '@remix-run/react';
import { CircleCheck, Loader } from 'lucide-react';
import { useDebounce, useIsFirstRender } from 'usehooks-ts';

import { IOrganization } from '~/api/organization/organization.contracts';
import { EL } from '~/components/pages/pipelines/EL/EL';
import { ELChat } from '~/components/pages/pipelines/EL/ELChat';
import type {
  IPipeline,
  IPipelineConfig,
} from '~/components/pages/pipelines/pipeline.types';
import { usePipelineId } from '~/hooks/usePipelineId';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

import { useRunPipeline } from '../RunPipelineProvider';
import { Metadata } from './Metadata';
import { RunPipelineButton } from './RunPipelineButton';

export const BuilderHeader: React.FC<
  PropsWithChildren<{ organization: IOrganization; elPipeline?: IPipeline }>
> = ({ children, organization, elPipeline }) => {
  const pipelineId = usePipelineId();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // const revalidator = useRevalidator();

  const onBlockCreate = (blockId: string, isWorking: boolean) => {
    if (blockId === 'create_block_tool_1' && isWorking === false) {
      navigate(
        routes.pipelineBuild(
          organization.id,
          pipelineId,
          Object.fromEntries(searchParams.entries()),
        ),
        { state: { reset: true, layoutNodes: true } },
      );
    }
  };

  return (
    <header className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
      <div className="hidden md:block w-[160px]" />

      <div className="flex gap-1 items-center pointer-events-auto bg-white rounded-lg p-1 border border-input">
        <EL>
          {elPipeline ? (
            <ELChat
              el={elPipeline}
              onBlockStatusChange={onBlockCreate}
              pipelineId={pipelineId}
              organizationId={organization.id}
            />
          ) : (
            <p className="text-sm text-center">
              The organization does not have EL configured. Navigate to the
              settings and set it up.
            </p>
          )}
        </EL>

        <Metadata />

        <RunPipelineButton />
      </div>

      <div className="flex gap-2 items-center justify-end pointer-events-auto w-[160px]">
        {children}
      </div>
    </header>
  );
};

interface SaveChangesButtonProps {
  onSave: (config: IPipelineConfig) => void;
  config: IPipelineConfig;
  isSaving?: boolean;
}

export function SaveChangesButton({
  isSaving,
  onSave,
  config,
}: SaveChangesButtonProps) {
  const isFirstRender = useIsFirstRender();
  const { status: runStatus } = useRunPipeline();
  const debounced = useDebounce(JSON.stringify(config), 300);

  const handleSave = useCallback(() => {
    try {
      onSave(JSON.parse(debounced));
    } catch (e) {
      console.error(e);
    }
  }, [debounced]);

  useEffect(() => {
    if (isFirstRender || runStatus !== 'idle') return;
    handleSave();
  }, [debounced, isFirstRender, runStatus]);

  return (
    <div className="flex items-center gap-2">
      {isSaving ? (
        <SavingStatusWrapper>
          <span>Saving changes</span>
          <Loader className="animate-spin w-4 h-4" />
        </SavingStatusWrapper>
      ) : (
        <SavingStatusWrapper className="text-green-500">
          <span>All changes saved</span>
          <CircleCheck className="w-4 h-4" />
        </SavingStatusWrapper>
      )}
    </div>
  );
}

function SavingStatusWrapper({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'text-foreground px-2 py-1 rounded-lg text-sm flex gap-1 items-center',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
