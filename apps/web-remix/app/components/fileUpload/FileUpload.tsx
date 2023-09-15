import React, { ReactNode, useCallback, useEffect, useState } from "react";
import {
  SmallFileInput,
  SmallFileInputProps,
} from "~/components/form/inputs/file.input";
import {
  IFile,
  IFileUpload,
  IPreviewProps,
  isUploadRejected,
} from "./fileUpload.types";

interface FileUploadProps
  extends Partial<Omit<SmallFileInputProps, "onChange">> {
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

        await onRemove(id);

        setFileList((prev) => prev.filter((file) => file.id !== id));
      } catch (err) {
        console.error(err);
      }
    },
    [onRemove]
  );

  useEffect(() => {
    handleFetchFiles();
  }, [handleFetchFiles]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center items-center w-full p-2 border-dashed border border-neutral-300 rounded min-h-[120px] bg-neutral-600">
        {loading ? (
          <p className="text-white">loading...</p>
        ) : (
          <SmallFileInput
            multiple
            buttonText="Browse files"
            label="Upload"
            supportingText="SVG, PNG, JPG or GIF. Max size of 2MB"
            onChange={handleUpload}
            {...rest}
          />
        )}
      </div>

      {preview?.({ fileList, remove: handleRemove })}
    </div>
  );
}
