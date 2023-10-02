import React, { useCallback } from "react";
import { MetaFunction } from "@remix-run/node";
import { FileUpload } from "~/components/fileUpload/FileUpload";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import { IFile } from "~/components/fileUpload/fileUpload.types";
import { KnowledgeBaseFileResponse } from "~/components/pages/knowledgeBase/contracts";
import { useLoaderData } from "@remix-run/react";
import { loader } from "./loader";

export function NewKnowledgeBasePage() {
  const { organizationId } = useLoaderData<typeof loader>();
  const uploadFile = useCallback(async (file: File): Promise<IFile> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection_name", ``);

    // const response = await fetch(
    //   `/super-api/organizations/${organizationId}/memories`,
    //   {
    //     body: formData,
    //     method: "POST",
    //   }
    // ).then((res) => res.json());

    return { ...KnowledgeBaseFileResponse.parse({}), status: "done" };
  }, []);

  return (
    <FileUpload
      multiple
      onUpload={uploadFile}
      preview={FileUploadListPreview}
      labelText="Browse files to upload"
    />
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "New knowledge base",
    },
  ];
};
