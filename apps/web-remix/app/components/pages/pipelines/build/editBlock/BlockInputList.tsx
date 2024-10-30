import type { PropsWithChildren } from 'react';
import React, { useMemo, useState } from 'react';

import { CheckboxInput } from '~/components/form/inputs/checkbox.input';
import { ItemList } from '~/components/list/ItemList';
import { useInputs } from '~/components/pages/pipelines/EditBlockForm';
import type { IConfigConnection } from '~/components/pages/pipelines/pipeline.types';
import { HelpfulIcon } from '~/components/tooltip/HelpfulIcon';
import { cn } from '~/utils/cn';

interface BlockInputListProps {
  connections: IConfigConnection[];
  disabled?: boolean;
}

export const BlockInputList: React.FC<BlockInputListProps> = ({
  connections,
  disabled,
}) => {
  const formattedConnections: IItem[] = useMemo(
    () =>
      connections.map((connection) => {
        const id = `${connection.from.block_name}:${connection.from.output_name}-${connection.to.block_name}:${connection.to.input_name}`;
        return {
          id: id,
          data: connection,
        };
      }),
    [connections],
  );

  if (formattedConnections.length === 0) return null;

  return (
    <div>
      <div className="grid grid-cols-[120px_60px_70px] text-xs text-muted-foreground mb-1">
        <h4 className="font-medium text-muted-foreground text-xs">Inputs</h4>
        <p className="col-start-2 flex gap-1 items-center">
          <span>Reset</span>
          <HelpfulIcon
            id={`inputs-reset-helpful-icon`}
            text="Check if the input must be resubmitted for each workflow execution."
            size="xs"
            place="top"
          />
        </p>

        <p className="flex gap-1 items-center">
          <span>Optional</span>
          <HelpfulIcon
            id={`inputs-optional-helpful-icon`}
            text="Check if the input is optional. If the input is optional, blocks will not wait for the input message."
            size="xs"
            place="top"
          />
        </p>
      </div>
      <ItemList
        className="flex flex-col gap-y-1"
        items={formattedConnections}
        renderItem={(item) => <BlockInputItem {...item} disabled={disabled} />}
      />
    </div>
  );
};

interface IItem {
  id: string;
  data: IConfigConnection;
  disabled?: boolean;
}

function BlockInputItem({ data, disabled }: IItem) {
  const [resettable, setResettable] = useState(data.opts.reset);
  const [optional, setOptional] = useState(data.opts.optional);
  const { updateInputReset, updateInputOptional } = useInputs();

  const onResetChange = (checked: boolean) => {
    updateInputReset(data, checked);
    setResettable(checked);
  };

  const onOptionalChange = (checked: boolean) => {
    updateInputOptional(data, checked);
    setOptional(checked);
  };

  return (
    <div className="relative grid grid-cols-[120px_60px_70px] gap-x-1">
      <p className="text-sm truncate" title={data.from.block_name}>
        {data.from.block_name}
      </p>
      <div className="flex items-center text-sm">
        <CheckboxInput
          size="sm"
          disabled={disabled}
          checked={resettable}
          onCheckedChange={onResetChange}
          id={`${data.from.block_name}-resettable`}
        />
      </div>

      <div className="flex items-center text-sm">
        <CheckboxInput
          size="sm"
          disabled={disabled}
          checked={optional}
          onCheckedChange={onOptionalChange}
          id={`${data.from.block_name}-optional`}
        />
      </div>
    </div>
  );
}

interface BadgeProps {
  className?: string;
  onClick?: () => void;
}

function Badge({
  children,
  className,
  onClick,
}: PropsWithChildren<BadgeProps>) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-muted text-foreground px-2 py-1 rounded-md flex items-center',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface BadgeTextProps {
  variant?: 'primary' | 'secondary';
}

function BadgeText({
  variant = 'primary',
  children,
}: PropsWithChildren<BadgeTextProps>) {
  return (
    <p
      className={cn('text-xs', {
        'text-yellow-500': variant === 'primary',
        'text-blue-500': variant === 'secondary',
      })}
    >
      {children}
    </p>
  );
}
