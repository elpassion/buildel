import React, { useCallback } from "react";
import { ItemList } from "~/components/list/ItemList";
import { IFileUpload, IPreviewProps } from "./fileUpload.types";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";
import { IconButton } from "~/components/iconButton";

interface FileUploadListPreviewProps extends Omit<IPreviewProps, "remove"> {
  remove?: (id: number) => Promise<void>;
  disabled?: boolean;
  className?: string;
}
export function FileUploadListPreview({
  fileList = [],
  remove,
  className,
}: FileUploadListPreviewProps) {
  return (
    <ItemList
      className={classNames(
        "flex flex-col items-center gap-1 max-h-[110px] overflow-y-auto",
        className
      )}
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
  const disabled = file.status === "uploading";

  const handleRemove = useCallback(() => {
    onRemove?.(file.id);
  }, [onRemove]);

  return (
    <article
      className={classNames(
        "flex justify-between gap-2 w-full py-1 px-2 bg-neutral-600 hover:bg-neutral-700 transition rounded-md",
        {
          "text-white": file.status !== "error",
          "text-red-500": file.status === "error",
        }
      )}
    >
      <div className="flex gap-1 grow max-w-[90%]">
        <Icon
          size="xs"
          iconName={renderTypeIcon(file.file_type)}
          className="mt-0.5 w-4 h-4 !text-sm"
        />
        <div className="flex flex-col w-full max-w-[95%]">
          <h6 className="whitespace-nowrap text-xs truncate">
            {file.file_name}
          </h6>
          <span
            className={classNames("text-[10px]", {
              "text-white": file.status !== "error",
              "text-red-500": file.status === "error",
            })}
          >
            {renderSize(file.file_size)}
          </span>
        </div>
      </div>
      {onRemove && (
        <IconButton
          className={classNames("origin-center w-4 h-4", {
            "animate-spin": file.status === "uploading",
          })}
          onlyIcon
          icon={
            <Icon
              className="w-4 h-4"
              iconName={file.status === "uploading" ? "loader" : "x"}
            />
          }
          disabled={disabled}
          onClick={handleRemove}
        />
      )}
    </article>
  );
}

function renderTypeIcon(fileType: string) {
  if (fileType.startsWith("audio/")) return "file" as const;
  return "file-text" as const;
}
function renderSize(size: number) {
  if (size < 1000) return `${size.toFixed(0)} B`;
  else if (size < 1000 * 1000) {
    return `${(size / 1000).toFixed(0)} KB`;
  } else return `${(size / (1000 * 1000)).toFixed(0)} MB`;
}
