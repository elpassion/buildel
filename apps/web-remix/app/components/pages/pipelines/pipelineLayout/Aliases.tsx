import type { PropsWithChildren } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import {
  useFetcher,
  useLocation,
  useNavigate,
  useSearchParams,
} from '@remix-run/react';
import { ChevronDown, ChevronUp, FilePenLine, Trash } from 'lucide-react';
import z from 'zod';

import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';
import { useDropdown } from '~/components/dropdown/DropdownContext';
import { HiddenField } from '~/components/form/fields/field.context';
import { IconButton } from '~/components/iconButton';
import { BasicLink } from '~/components/link/BasicLink';
import { ItemList } from '~/components/list/ItemList';
import { confirm } from '~/components/modal/confirm';
import type {
  IPipeline,
  IPipelineAlias,
} from '~/components/pages/pipelines/pipeline.types';
import { EditAliasNameModal } from '~/components/pages/pipelines/pipelineLayout/EditAliasNameModal';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';
import { ValidatedForm, withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';

interface AliasSelectProps {
  aliases: IPipelineAlias[];
  value?: string;
}

export const AliasSelect = ({ aliases, value }: AliasSelectProps) => {
  const name = useMemo(() => {
    return (
      aliases.find((alias) => alias.id.toString() === value?.toString())
        ?.name ?? 'Latest'
    );
  }, [value, aliases]);

  return (
    <Dropdown placement="bottom-end">
      <AliasTrigger name={name} value={value} />

      <DropdownPopup className="min-w-[250px] max-w-[250px] absolute z-[11] top-full translate-y-[4px] right-0 bg-white border border-input rounded-lg overflow-hidden p-1 transition">
        <div className="overflow-y-auto max-h-[300px]">
          <AliasList data={aliases} />
        </div>
      </DropdownPopup>
    </Dropdown>
  );
};

function AliasTrigger({
  name,
  value,
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { isShown } = useDropdown();
  return (
    <DropdownTrigger aria-label="Select aliases" variant="outline" size="xs">
      <div className="flex gap-1 items-center">
        <span className="block max-w-[200px] truncate">
          Aliases{' '}
          <span className={cn({ 'font-bold': value !== 'latest' })}>
            ({name})
          </span>
        </span>
        {isShown ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>
    </DropdownTrigger>
  );
}

interface AliasListProps {
  data: IPipelineAlias[];
}

export const AliasList = ({ data }: AliasListProps) => {
  const [searchParams] = useSearchParams();
  const alias = searchParams.get('alias') ?? 'latest';
  const location = useLocation();
  const [editableKey, setEditableKey] = useState<IPipelineAlias | null>(null);

  const handleEdit = (alias: IPipelineAlias) => {
    setEditableKey(alias);
  };

  const onClose = () => {
    setEditableKey(null);
  };

  return (
    <>
      <ItemList
        items={data}
        className="flex flex-col gap-1"
        emptyText={<span className="text-neutral-200 text-xs">No data</span>}
        renderItem={(data) => (
          <BasicLink
            to={`${location.pathname}?alias=${data.id}`}
            state={{ reset: true }}
            className="focus:border"
            aria-label={`Select alias: ${data.name}`}
            data-testid="alias-link"
          >
            <AliasListItem
              data={data}
              onEdit={handleEdit}
              isActive={alias === `${data.id}`}
            />
          </BasicLink>
        )}
      />

      {editableKey && (
        <EditAliasNameModal
          onClose={onClose}
          isOpen={!!editableKey}
          initialData={editableKey}
        />
      )}
    </>
  );
};

interface AliasListItemProps {
  data: IPipelineAlias;
  isActive?: boolean;
  onEdit: (alias: IPipelineAlias) => void;
}

export const AliasListItem = ({
  data,
  isActive,
  onEdit,
}: AliasListItemProps) => {
  const fetcher = useFetcher();

  const onDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();

    fetcher.submit(
      { id: data.id },
      { method: 'DELETE', encType: 'application/json' },
    );
  };

  const handleOnEdit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    e.preventDefault();
    onEdit(data);
  };

  return (
    <div
      className={cn(
        'text-foreground group flex justify-between items-center gap-2 text-sm py-2 px-1.5 rounded hover:pl-2 transition-all hover:bg-muted',
        { 'bg-muted': isActive, 'bg-white': !isActive },
      )}
    >
      <div className="flex gap-2 items-center">
        <span className="truncate max-w-[175px]">
          {isActive ? '*' : null} {data.name}
        </span>
        {data.id === 'latest' ? (
          <AliasListItemBadge>{data.id}</AliasListItemBadge>
        ) : null}
      </div>

      {data.id !== 'latest' && (
        <div className="flex items-center opacity-0 group-hover:opacity-100">
          <IconButton
            size="xxs"
            variant="ghost"
            icon={<FilePenLine />}
            aria-label={`Edit alias: ${data.name}`}
            onClick={handleOnEdit}
          />

          {!isActive ? (
            <IconButton
              size="xxs"
              variant="ghost"
              icon={<Trash />}
              onClick={onDelete}
              aria-label={`Delete alias: ${data.name}`}
            />
          ) : null}
        </div>
      )}
    </div>
  );
};

function AliasListItemBadge({ children }: PropsWithChildren) {
  return (
    <div className="px-1 bg-primary text-primary-foreground text-xs !leading-[20px] rounded-sm">
      {children}
    </div>
  );
}

interface CreateAliasFormProps {
  pipeline: IPipeline;
  aliases: IPipelineAlias[];
}

export const CreateAliasForm = ({
  pipeline,
  aliases,
}: CreateAliasFormProps) => {
  const validator = useMemo(() => withZod(z.any()), []);
  const version = getLastAliasNumber(aliases.map((alias) => alias.name)) + 1;

  return (
    <ValidatedForm method="POST" validator={validator}>
      <HiddenField name="name" value={pipeline.name + ` v${version}`} />

      <HiddenField
        name="interface_config"
        value={JSON.stringify(pipeline.interface_config ?? {})}
      />

      <HiddenField name="config.version" value="1" />

      <HiddenField
        name="config.blocks"
        value={JSON.stringify(pipeline.config.blocks)}
      />

      <HiddenField
        name="config.connections"
        value={JSON.stringify(pipeline.config.connections)}
      />

      <Button type="submit" data-testid="create-alias" size="xs">
        Create alias
      </Button>
    </ValidatedForm>
  );
};

interface RestoreWorkflowProps {
  pipeline: IPipeline;
}

export const RestoreWorkflow = ({ pipeline }: RestoreWorkflowProps) => {
  const updateFetcher = useFetcher();
  const navigate = useNavigate();

  const onSubmit = () => {
    confirm({
      onConfirm: async () =>
        updateFetcher.submit(pipeline, {
          method: 'PUT',
          encType: 'application/json',
          action: routes.pipelineBuild(pipeline.organization_id, pipeline.id),
        }),
      children: (
        <p className="text-sm">
          You are about to restore the workflow to previous version. This action
          is irreversible.
        </p>
      ),
    });
  };

  useEffect(() => {
    if (updateFetcher.data) {
      navigate(routes.pipelineBuild(pipeline.organization_id, pipeline.id));
    }
  }, [updateFetcher.data]);

  return (
    <Button variant="destructive" type="button" onClick={onSubmit} size="xs">
      Restore
    </Button>
  );
};

export function getLastAliasNumber(names: string[]) {
  const nrs = names
    .map((name) => name.split('v'))
    .map((part) => Number.parseInt(part[part.length - 1]))
    .filter((n) => !isNaN(n));

  return Math.max(...nrs, 0);
}
