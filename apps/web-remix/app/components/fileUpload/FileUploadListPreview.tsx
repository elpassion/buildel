import React, { useCallback } from "react";
import { ItemList } from "~/components/list/ItemList";
import { IFileUpload, IPreviewProps, isUploadError } from "./fileUpload.types";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";

interface FileUploadListPreviewProps extends Omit<IPreviewProps, "remove"> {
  remove?: (id: number) => Promise<void>;
}
export function FileUploadListPreview({
  fileList = [],
  remove,
}: FileUploadListPreviewProps) {
  return (
    <ItemList
      className="flex flex-col items-center gap-1 max-h-[110px] overflow-y-auto"
      itemClassName="w-full"
      items={fileList}
      renderItem={(file) => (
        <FileUploadListItem file={file} onRemove={remove} />
      )}
    />
  );
}

interface FileUploadListItemProps {
  file: IFileUpload;
  onRemove?: (id: number) => Promise<void>;
}
export function FileUploadListItem({
  file,
  onRemove,
}: FileUploadListItemProps) {
  const handleRemove = useCallback(() => {
    onRemove?.(file.id);
  }, [onRemove]);

  return (
    <article
      className={classNames(
        "flex justify-between gap-2 w-full p-1 bg-neutral-600 hover:bg-neutral-700 transition rounded-md",
        {
          "text-white": !isUploadError(file),
          "text-red-500": isUploadError(file),
        }
      )}
    >
      <div className="flex gap-1 grow max-w-[90%]">
        <Icon size="xs" iconName="file" className="mt-0.5 w-4 h-4 !text-sm" />
        <div className="flex flex-col w-full max-w-[95%]">
          <h6 className="whitespace-nowrap text-xs truncate">
            {file.file_name}
          </h6>
          <span
            className={classNames("text-[10px]", {
              "text-neutral-100": !isUploadError(file),
              "text-red-500": isUploadError(file),
            })}
          >
            {renderSize(file.file_size)}
          </span>
        </div>
      </div>
      {onRemove && (
        <button
          onClick={handleRemove}
          className="w-4 h-4 flex items-center justify-center hover:bg-neutral-500 rounded-sm"
        >
          <Icon iconName="x" size="xs" />
        </button>
      )}
    </article>
  );
}
function renderSize(size: number) {
  if (size < 1000) return `${size.toFixed(0)} B`;
  else if (size < 1000 * 1000) {
    return `${(size / 1000).toFixed(0)} KB`;
  } else return `${(size / (1000 * 1000)).toFixed(0)} MB`;
}
