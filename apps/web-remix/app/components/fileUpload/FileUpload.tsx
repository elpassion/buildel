import React, { ReactNode, useEffect, useState } from "react";
import {
  SmallFileInput,
  SmallFileInputProps,
} from "~/components/form/inputs/file.input";
import { IFile } from "./fileUpload.types";

interface FileUploadProps
  extends Partial<Omit<SmallFileInputProps, "onChange">> {
  preview?: (fileList: IFile[]) => ReactNode;
  uploadFile: (file: File) => Promise<void>;
  fetchFiles: () => Promise<IFile[]>;
  onUploadError?: (e: unknown) => void;
  onUploadSuccess?: () => void;
}
export function FileUpload({
  name,
  preview,
  uploadFile,
  fetchFiles,
  onUploadError,
  onUploadSuccess,
  ...rest
}: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<IFile[]>([]);

  const handleFetchFiles = async () => {
    try {
      const files = await fetchFiles();

      setFileList(files);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    try {
      //todo handle errors
      const { files } = e.target;
      if (!files) return;

      const promises = [...files].map((file) => uploadFile(file));

      await Promise.allSettled(promises);

      onUploadSuccess?.();

      setLoading(false);

      await handleFetchFiles();
    } catch (e) {
      onUploadError?.(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchFiles();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-center items-center w-full p-2 border-dashed border border-neutral-300 rounded min-h-[120px] bg-neutral-600">
        {loading ? (
          <p className="text-white">loading...</p>
        ) : (
          <SmallFileInput
            buttonText="Browse files"
            label="Upload"
            supportingText="SVG, PNG, JPG or GIF. Max size of 2MB"
            onChange={handleUpload}
            {...rest}
          />
        )}
      </div>

      {preview?.(fileList)}
    </div>
  );
}
