export interface IFile {
  id: number;
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface IUploadError extends IFile {
  error: unknown;
}

export type IFileUpload = IFile | IUploadError;

export function isUploadRejected(
  upload: PromiseFulfilledResult<unknown> | PromiseRejectedResult
): upload is PromiseRejectedResult {
  return (upload as PromiseRejectedResult).status === "rejected";
}

export function isUploadError(upload: IFileUpload): upload is IUploadError {
  return (upload as IUploadError).error !== undefined;
}
