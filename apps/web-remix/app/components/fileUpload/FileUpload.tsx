import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Button } from "@elpassion/taco";
import {
  IFile,
  IFileUpload,
  IPreviewProps,
  isUploadError,
  isUploadRejected,
} from "./fileUpload.types";

interface FileUploadProps
  extends React.HTMLProps<Omit<HTMLInputElement, "onChange">> {
  preview?: (props: IPreviewProps) => ReactNode;
  onUpload: (file: File) => Promise<IFile>;
  onFetch: () => Promise<IFile[]>;
  onRemove?: (id: number) => Promise<any>;
  onUploadError?: (e: unknown) => void;
  onUploadSuccess?: () => void;
}

export function FileUpload({
  name,
  preview,
  onUpload,
  onFetch,
  onUploadError,
  onUploadSuccess,
  onRemove,
  ...rest
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<IFileUpload[]>([]);

  const handleFetchFiles = useCallback(async () => {
    try {
      const files = await onFetch();

      setFileList(files);
    } catch (e) {
      console.error(e);
    }
  }, [onFetch]);

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      setLoading(true);
      try {
        const { files } = e.target;

        if (!files) return;

        const promises = [...files].map((file) => onUpload(file));

        const settledResult = await Promise.allSettled(promises);

        const uploaded = settledResult.reduce((acc, curr, currentIndex) => {
          if (isUploadRejected(curr)) {
            return [
              ...acc,
              {
                id: Math.random(),
                file_name: files[currentIndex].name,
                file_size: files[currentIndex].size,
                file_type: files[currentIndex].type,
                error: curr.reason?.message || "Unknown upload error",
              },
            ];
          }
          return [...acc, curr.value];
        }, [] as IFileUpload[]);

        setFileList((prev) => [...uploaded, ...prev]);

        onUploadSuccess?.();

        setLoading(false);
      } catch (e) {
        onUploadError?.(e);
        setLoading(false);
      }
    },
    [onUploadError, onUploadSuccess, onUpload]
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
    [onRemove]
  );

  const handleSelectFiles = useCallback(() => {
    inputRef.current?.click();
  }, []);

  useEffect(() => {
    handleFetchFiles();
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={rest.id}>
        <span className="text-white text-xs font-medium">Upload files</span>
        <input
          type="file"
          ref={inputRef}
          {...rest}
          onChange={handleUpload}
          disabled={loading}
          hidden
        />
        <Button
          onClick={handleSelectFiles}
          size="xs"
          variant="outlined"
          className="!text-xs"
          disabled={loading}
          isFluid
        >
          Browse files to upload
        </Button>
      </label>

      {preview?.({ fileList, remove: handleRemove })}
    </div>
  );
}
