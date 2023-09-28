import { Button } from "@elpassion/taco";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  IFile,
  IFileUpload,
  IPreviewProps,
  isUploadError,
} from "./fileUpload.types";
import { assert } from "ts-utils";

interface FileUploadProps
  extends React.HTMLProps<Omit<HTMLInputElement, "onChange">> {
  preview?: (props: IPreviewProps) => ReactNode;
  onUpload: (file: File) => Promise<IFile>;
  onFetch?: () => Promise<IFile[]>;
  onRemove?: (id: number) => Promise<any>;
}

export function FileUpload({
  name,
  preview,
  onUpload,
  onFetch,
  onRemove,
  disabled,
  ...rest
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileList, setFileList] = useState<IFileUpload[]>([]);

  const handleFetchFiles = useCallback(async () => {
    assert(onFetch);
    try {
      const files = await onFetch();

      setFileList(files);
    } catch (e) {
      console.error(e);
    }
  }, [onFetch]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = e.target;

      if (!files) return;

      [...files].forEach(async (file) => {
        const id = Math.random();
        setFileList((prev) => [
          {
            id: id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            status: "uploading",
          },
          ...prev,
        ]);
        await onUpload(file)
          .then((res) => {
            setFileList((prev) =>
              prev.map((file) => {
                if (file.id === id) {
                  return { ...res, status: "done" };
                }
                return file;
              })
            );
          })
          .catch((e) => {
            setFileList((prev) =>
              prev.map((file) => {
                if (file.id === id) {
                  return { ...file, status: "error" };
                }
                return file;
              })
            );
          });
      });
    },
    [onUpload]
  );

  const handleRemove = useCallback(
    async (id: number) => {
      try {
        if (!onRemove) return;

        const item = fileList.find((file) => file.id === id);

        if (item && !isUploadError(item)) {
          await onRemove(id);
        }

        setFileList((prev) => prev.filter((file) => file.id !== id));
      } catch (err) {
        console.error(err);
      }
    },
    [onRemove, fileList]
  );

  const handleSelectFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    if (!onFetch) return;
    handleFetchFiles();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={rest.id}>
        <span className="text-white text-xs font-medium">Upload files</span>
        <input
          type="file"
          ref={inputRef}
          {...rest}
          disabled={disabled}
          onChange={handleUpload}
          hidden
        />
        <Button
          onClick={handleSelectFiles}
          size="xs"
          variant="outlined"
          className="!text-xs"
          disabled={disabled}
          isFluid
        >
          Browse files to upload
        </Button>
      </label>

      {preview?.({ fileList, remove: onRemove ? handleRemove : undefined })}
    </div>
  );
}
