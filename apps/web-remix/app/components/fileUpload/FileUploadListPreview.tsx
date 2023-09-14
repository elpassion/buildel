import React from "react";
import { ItemList } from "~/components/list/ItemList";
import { IFile } from "./fileUpload.types";
interface FileUploadListPreviewProps {
  fileList?: IFile[];
}
export function FileUploadListPreview({
  fileList = [],
}: FileUploadListPreviewProps) {
  return (
    <ItemList
      className="flex flex-col items-center gap-1 max-h-[85px] overflow-y-auto"
      itemClassName="w-full"
      items={fileList}
      renderItem={(file) => <FileUploadListItem file={file} />}
    />
  );
}

interface FileUploadListItemProps {
  file: IFile;
}
export function FileUploadListItem({ file }: FileUploadListItemProps) {
  return (
    <article className="flex justify-between gap-2 w-full px-1 text-sm text-white">
      <h6>{file.file_name}</h6>
      <button>x</button>
    </article>
  );
}
