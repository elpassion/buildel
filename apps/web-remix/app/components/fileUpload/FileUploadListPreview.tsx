import React, { useCallback } from 'react';
import classNames from 'classnames';
import { File, FileText, Loader, X } from 'lucide-react';

import { IconButton } from '~/components/iconButton';
import { ItemList } from '~/components/list/ItemList';
import { Tooltip } from '~/components/tooltip/Tooltip';
import { cn } from '~/utils/cn';

import { isUploadError } from './fileUpload.types';
import type { IFileUpload, IPreviewProps } from './fileUpload.types';

interface FileUploadListPreviewProps
  extends Omit<IPreviewProps, 'remove'>,
    React.HTMLProps<HTMLUListElement> {
  remove?: (id: string | number) => Promise<void>;
  disabled?: boolean;
  className?: string;
}
export function FileUploadListPreview({
  fileList = [],
  remove,
  className,
  disabled,
  ...rest
}: FileUploadListPreviewProps) {
  return (
    <ItemList
      className={classNames(
        'flex flex-col items-center gap-1 overflow-y-auto',
        className,
      )}
      itemClassName="w-full"
      items={fileList}
      renderItem={(file) => (
        <FileUploadListItem file={file} onRemove={remove} disabled={disabled} />
      )}
      {...rest}
    />
  );
}

interface FileUploadListItemProps {
  file: IFileUpload;
  onRemove?: (id: string | number) => Promise<void>;
  disabled?: boolean;
}
export function FileUploadListItem({
  file,
  onRemove,
  disabled,
}: FileUploadListItemProps) {
  const isDisabled = file.status === 'uploading' || disabled;

  const handleRemove = useCallback(() => {
    onRemove?.(file.id);
  }, [onRemove]);

  return (
    <article
      data-tooltip-id={`${file.id}`}
      className={classNames(
        'flex justify-between gap-2 w-full py-1 px-2 border border-input bg-white hover:bg-muted transition rounded-md cursor-default',
        {
          'text-foreground': file.status !== 'error',
          'text-red-500': file.status === 'error',
        },
      )}
    >
      <div className="flex gap-1 grow max-w-[90%]">
        {renderTypeIcon(file.file_type)}

        <div className="flex flex-col w-full max-w-[95%]">
          <h6 className="whitespace-nowrap text-xs truncate">
            {file.file_name}
          </h6>
          <span
            className={classNames('text-[10px]', {
              'text-muted-foreground': file.status !== 'error',
              'text-red-500': file.status === 'error',
            })}
          >
            {renderSize(file.file_size)}
          </span>
        </div>
      </div>

      {isUploadError(file) && (
        <Tooltip
          id={file.id.toString()}
          content={handleErrorMessages(file.error)}
          className="!text-xs max-w-[350px] !z-[100]"
          place="right"
        />
      )}

      {onRemove && (
        <IconButton
          size="xxxs"
          icon={
            file.status === 'uploading' ? (
              <Loader
                className={cn(
                  'flex items-center justify-center origin-center w-4 h-4 !leading-5',
                  {
                    'animate-spin': file.status === 'uploading',
                  },
                )}
              />
            ) : (
              <X
                className={cn(
                  'flex items-center justify-center origin-center w-4 h-4 !leading-5',
                  {
                    'text-red-500': file.status === 'error',
                  },
                )}
              />
            )
          }
          variant="ghost"
          aria-label={`Delete file: ${file.file_name}`}
          disabled={isDisabled}
          onClick={handleRemove}
        />
      )}
    </article>
  );
}

function renderTypeIcon(fileType: string) {
  if (fileType.startsWith('audio/'))
    return <File className="mt-0.5 w-4 h-4 !text-sm" />;
  return <FileText className="mt-0.5 w-4 h-4 !text-sm" />;
}
function renderSize(size: number) {
  if (size < 1000) return `${size.toFixed(0)} B`;
  else if (size < 1000 * 1000) {
    return `${(size / 1000).toFixed(0)} KB`;
  } else return `${(size / (1000 * 1000)).toFixed(0)} MB`;
}

function handleErrorMessages(e: unknown) {
  if (e instanceof Error) {
    return e.message;
  }

  return 'Something went wrong!';
}
