import { Button } from "@elpassion/taco";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { IFile, IFileUpload, IPreviewProps } from "./fileUpload.types";
import { assert } from "~/utils/assert";
import classNames from "classnames";

export interface FileUploadProps extends React.HTMLProps<HTMLInputElement> {
  preview?: (props: IPreviewProps) => ReactNode;
  onUpload: (file: File) => Promise<IFile>;
  onFetch?: () => Promise<IFile[]>;
  onRemove?: (id: number) => Promise<any>;
  uploadText?: ReactNode;
  labelText?: ReactNode;
  fileList?: IFileUpload[];
}

export function FileUpload({
  name,
  preview,
  onUpload,
  onFetch,
  onRemove,
  disabled,
  uploadText = "Browse files to upload",
  labelText = "Upload files",
  className,
  onChange,
  fileList: propsFileList,
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
      if (onChange) {
        return onChange(e);
      }

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
        onUpload(file)
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
          .catch(() => {
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
    [onUpload, onChange]
  );

  const handleRemove = useCallback(
    async (id: number) => {
      try {
        if (!onRemove) return;

        await onRemove(id);

        setFileList((prev) => prev.filter((file) => file.id !== id));
      } catch (err) {
        console.error(err);
      }
    },
    [onRemove]
  );

  const handleSelectFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    if (!onFetch) return;
    handleFetchFiles();
  }, []);

  return (
    <div className={classNames("flex flex-col gap-2", className)}>
      <label htmlFor={rest.id}>
        <span className="text-white text-xs font-medium">{labelText}</span>
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
          {uploadText}
        </Button>
      </label>

      {preview?.({
        fileList: propsFileList ?? fileList,
        remove: onRemove ? handleRemove : undefined,
      })}
    </div>
  );
}
