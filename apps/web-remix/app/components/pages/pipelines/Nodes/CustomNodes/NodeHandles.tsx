import { useMemo } from 'react';
import { Handle, Position } from '@xyflow/react';
import startCase from 'lodash.startcase';

import { cn } from '~/utils/cn';

import type { IHandle } from '../../pipeline.types';

interface HandleProps {
  handle: IHandle;
  index: number;
  isConnectable?: boolean;
  blockName: string;
}

export function InputHandle({
  handle,
  index,
  isConnectable = true,
  blockName,
}: HandleProps) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case 'text':
        return '!rounded-[1px] !bg-orange-500';
      case 'file':
      case 'file_temporary':
        return '!rounded-full !bg-orange-500';
      case 'audio':
        return '!rounded !bg-orange-500';
      case 'image':
        return '!rounded !bg-red-500';
    }
  }, [handle.data.type]);

  return (
    <>
      <span
        className="absolute right-full -translate-y-[50%] -translate-x-[12px] text-[10px] text-muted-foreground text-nowrap whitespace-nowrap"
        style={{ top: (index + 1) * 35 }}
      >
        {startCase(handle.data.name.replace(/_input/g, ' '))}
      </span>
      <Handle
        id={handle.id}
        key={handle.id}
        type={handle.type}
        position={Position.Left}
        isConnectable={isConnectable}
        style={{ top: (index + 1) * 35 }}
        data-testid={`${blockName}-${handle.data.name}-handle`}
        className={cn(
          '!bg-transparent !w-[30px] !h-[30px] !border-none !rounded flex justify-center items-center group',
        )}
      >
        <div
          className={cn(
            '!border-1 !border-orange-500 !w-[10px] !h-[10px] pointer-events-none group-hover:scale-125 transition-transform duration-100 ease-in-out',
            handleTypeClassName,
          )}
        />
      </Handle>
    </>
  );
}

export function OutputHandle({
  handle,
  index,
  isConnectable,
  blockName,
}: HandleProps) {
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case 'text':
        return '!rounded-[1px] !bg-blue-500';
      case 'file':
      case 'file_temporary':
        return '!rounded-full !bg-blue-500';
      case 'audio':
        return '!rounded !bg-blue-500';
      case 'image':
        return '!rounded !bg-red-500';
    }
  }, [handle.data.type]);

  return (
    <>
      <div
        className="absolute left-full -translate-y-[50%] translate-x-[12px] text-[10px] text-muted-foreground text-nowrap whitespace-nowrap"
        style={{ top: (index + 1) * 35 }}
      >
        {startCase(handle.data.name.replace(/_output/g, ' '))}
      </div>
      <Handle
        key={handle.id}
        type={handle.type}
        position={Position.Right}
        isConnectable={isConnectable}
        style={{ top: (index + 1) * 35 }}
        id={handle.id}
        data-testid={`${blockName}-${handle.data.name}-handle`}
        data-name={handle.data.name}
        className={cn(
          '!bg-transparent !w-[30px] !h-[30px] !border-none !rounded flex justify-center items-center group',
        )}
      >
        <div
          className={cn(
            '!border-1 !border-blue-500 !w-[10px] !h-[10px] pointer-events-none group-hover:scale-125 transition-transform duration-100 ease-in-out',
            handleTypeClassName,
          )}
        />
      </Handle>
    </>
  );
}

export function ToolHandle({
  handle,
  isConnectable = true,
  blockName,
}: HandleProps) {
  const isWorker = handle.data.type === 'worker';
  const handleTypeClassName = useMemo(() => {
    switch (handle.data.type) {
      case 'worker':
        return '!rounded-[1px] !bg-blue-500 !border-blue-500 -translate-y-[3px]';

      case 'controller':
        return '!rounded-[1px] !bg-orange-500 !border-orange-500 translate-y-[3px]';
    }
  }, [handle.data.type]);

  return (
    <>
      <span
        className={cn(
          'absolute text-[10px] -translate-x-1/2 text-muted-foreground left-1/2',
        )}
        style={{
          top: isWorker ? -26 : 'auto',
          bottom: !isWorker ? -26 : 'auto',
        }}
      >
        I/O
      </span>
      <Handle
        key={handle.id}
        type={handle.type}
        position={isWorker ? Position.Top : Position.Bottom}
        isConnectable={isConnectable}
        id={handle.id}
        data-testid={`${blockName}-${handle.data.name}-handle`}
        className={cn(
          '!bg-transparent !w-[30px] !h-[30px] !border-none !rounded flex justify-center items-center group',
        )}
      >
        <div
          className={cn(
            '!border-1 !w-[10px] !h-[10px] !rotate-45 pointer-events-none group-hover:scale-125 transition-transform duration-100 ease-in-out',
            handleTypeClassName,
          )}
        />
      </Handle>
    </>
  );
}
