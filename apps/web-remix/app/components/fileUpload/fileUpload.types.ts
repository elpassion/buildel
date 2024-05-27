export interface IFile {
  id: number | string;
  file_name: string;
  file_size: number;
  file_type: string;
  status: "uploading" | "done" | "error";
}

export interface IUploadError extends IFile {
  error: unknown;
}

export type IFileUpload = IFile | IUploadError;

export interface IPreviewProps {
  fileList: IFileUpload[];
  remove?: (id: number) => Promise<void>;
}

export function isUploadError(upload: IFileUpload): upload is IUploadError {
  return (upload as IUploadError).error !== undefined;
}
