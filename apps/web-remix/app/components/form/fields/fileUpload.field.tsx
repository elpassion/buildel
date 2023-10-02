import React, { forwardRef } from "react";
import { useControlField } from "remix-validated-form";
import { useFieldContext } from "~/components/form/fields/field.context";
import { IFileUpload } from "~/components/fileUpload/fileUpload.types";
import {
  FileUpload,
  FileUploadProps,
} from "~/components/fileUpload/FileUpload";

export const FileUploadField = forwardRef<
  HTMLInputElement,
  Partial<Omit<FileUploadProps, "onUpload" | "onRemove" | "onFetch">>
>((props, ref) => {
  const { name, getInputProps } = useFieldContext();
  const [items, setItems] = useControlField<IFileUpload[]>(name);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (!files) return;

    const uploadFiles: IFileUpload[] = [...files].map((file) => {
      return {
        id: Math.random(),
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        status: "done",
      };
    });
    setItems(uploadFiles);
  };

  const removeFile = async (id: number) => {
    setItems(items.filter((item) => item.id !== id));
  };

  return (
    <FileUpload
      {...getInputProps()}
      {...props}
      fileList={items}
      onChange={onChange}
      onRemove={removeFile}
    />
  );
});
