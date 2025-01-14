import type { ComponentPropsWithRef } from 'react';
import React from 'react';

import type { IPipelineRunLog } from '~/api/pipeline/pipeline.contracts';
import { SelectInput } from '~/components/form/inputs/select/select.input';
import type { SelectInputProps } from '~/components/form/inputs/select/select.input-impl.client';
import { BasicLink } from '~/components/link/BasicLink';
import { EmptyMessage } from '~/components/list/ItemList';
import { cn } from '~/utils/cn';
import { routes } from '~/utils/routes.utils';

export type LogsVariant = 'dark' | 'light';
export type LogsSize = 'sm' | 'md';

interface LogsFilterProps {
  value: string | null | undefined;
  onSelect: (blockName: string) => void;
  onClear: () => void;
  options: { value: string; label: string }[];
}

export function RunLogsFilter({
  value,
  onClear,
  onSelect,
  options,
  ...rest
}: LogsFilterProps & Partial<SelectInputProps>) {
  return (
    <SelectInput
      allowClear
      onClear={onClear}
      placeholder="Filter by block..."
      value={value}
      onSelect={onSelect}
      options={options}
      {...rest}
    />
  );
}

export type LogProps = {
  variant?: LogsVariant;
  size?: LogsSize;
};

const LogContext = React.createContext<Required<LogProps> | undefined>(
  undefined,
);

const useLogContext = () => {
  const ctx = React.use(LogContext);
  if (!ctx) {
    throw new Error('useLogContext must be used within a LogContext');
  }

  return ctx;
};

export function Log({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement> & { log: IPipelineRunLog }) {
  const { variant, size } = useLogContext();
  return (
    <p
      className={cn(
        {
          'hover:bg-gray-700': variant === 'dark',
          'hover:bg-muted': variant === 'light',
        },

        getLogSize(size),
        className,
      )}
      {...rest}
    >
      {children}
    </p>
  );
}

export function LogDate({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn('text-cyan-400 whitespace-nowrap', className)}
      {...rest}
    >
      {children}
    </span>
  );
}

export function LogTopic({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-yellow-500 ', className)} {...rest}>
      {children}
    </span>
  );
}

export function LogBlockName({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-purple-500', className)} {...rest}>
      {children}
    </span>
  );
}

export function LogMessage({
  className,
  children,
  log,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement> & { log: IPipelineRunLog }) {
  const { variant } = useLogContext();
  const isError = log?.message_types?.includes('error');
  return (
    <span
      className={cn(
        {
          'text-red-500': isError,
          'text-gray-300': !isError && variant === 'dark',
          'text-muted-foreground': !isError && variant === 'light',
        },
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

export function LogTypes({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-green-400', className)} {...rest}>
      {children}
    </span>
  );
}

export function LogsLoadMoreWrapper({
  className,
  children,
  ...rest
}: ComponentPropsWithRef<'div'>) {
  return (
    <div className={cn('flex justify-center', className)} {...rest}>
      {children}
    </div>
  );
}

export function LogsWrapper({
  className,
  children,
  variant = 'dark',
  size = 'md',
  ...rest
}: ComponentPropsWithRef<'div'> & LogProps) {
  return (
    <LogContext value={{ variant, size }}>
      <div
        className={cn(
          'p-4 h-[65vh] max-h-[450px] overflow-y-auto rounded-lg flex flex-col-reverse',
          {
            'bg-gray-800 text-gray-400': variant === 'dark',
            'bg-[#fbfbfb] text-foreground': variant === 'light',
          },
          className,
        )}
        {...rest}
      >
        {children}
      </div>
    </LogContext>
  );
}

function getLogSize(size: LogsSize = 'md') {
  switch (size) {
    case 'sm':
      return 'text-xs';
    case 'md':
      return 'text-base';
  }
}

interface LogsEmptyMessageProps {
  organizationId: number;
  pipelineId: number;
  className?: string;
}
export function LogsEmptyMessage({
  organizationId,
  className,
  pipelineId,
}: LogsEmptyMessageProps) {
  return (
    <EmptyMessage
      className={cn('block mx-auto text-center w-fit max-w-[350px]', className)}
    >
      No logs found for this run. You can enable logs in the workflow{' '}
      <BasicLink
        target="_blank"
        className="font-semibold text-foreground hover:underline"
        to={routes.pipelineSettings(organizationId, pipelineId)}
      >
        settings
      </BasicLink>
      .
    </EmptyMessage>
  );
}
