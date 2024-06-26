import React, { useState } from "react";
import { MetaFunction } from "@remix-run/node";
import { Button } from "@elpassion/taco";
import {
  Form,
  useLoaderData,
  useNavigate,
  useRevalidator,
} from "@remix-run/react";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import { IFileUpload } from "~/components/fileUpload/fileUpload.types";
import { FileUpload } from "~/components/fileUpload/FileUpload";
import { loader } from "./loader.server";
import { errorToast } from "~/components/toasts/errorToast";
import { routes } from "~/utils/routes.utils";
import { ActionSidebarHeader } from "~/components/sidebar/ActionSidebar";
import { loadingToast } from "~/components/toasts/loadingToast";

type IExtendedFileUpload = IFileUpload & { file: File };
export function NewCollectionFilesPage() {
  const navigate = useNavigate();
  const revalidator = useRevalidator();
  const { organizationId, collectionName, collectionId } =
    useLoaderData<typeof loader>();
  const [items, setItems] = useState<IExtendedFileUpload[]>([]);

  const isUploading = items.some(
    (fileUpload) => fileUpload.status === "uploading",
  );
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (!files) return;

    const uploadFiles: IExtendedFileUpload[] = [...files].map((file) => {
      return {
        id: Math.random(),
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        status: "done",
        file,
      };
    });

    setItems((prev) => [...uploadFiles, ...prev]);
  };
  const removeFile = async (id: number | string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateStatus = (
    id: number | string,
    status: "done" | "error" | "uploading",
  ) => {
    setItems((prev) =>
      prev.map((fileUpload) => {
        if (fileUpload.id === id) {
          fileUpload.status = status;
        }

        return fileUpload;
      }),
    );
  };

  const handleUploadFile = async (fileUpload: IExtendedFileUpload) => {
    async function createFile(fileUpload: IExtendedFileUpload) {
      const formData = new FormData();
      formData.append("file", fileUpload.file);
      formData.append("collection_name", collectionName);

      handleUpdateStatus(fileUpload.id, "uploading");

      const res = await fetch(
        `/super-api/organizations/${organizationId}/memory_collections/${collectionId}/files`,
        {
          body: formData,
          method: "POST",
        },
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.errors?.detail ?? "Something went wrong!");
      }

      return res.json();
    }

    async function refreshFileStatus(fileId: string | number) {
      const res = await fetch(
        `/super-api/organizations/${organizationId}/memory_collections/${collectionId}/files/${fileId}`,
      );

      if (!res.ok) {
        const body = await res.json();
        errorToast("Something went wrong!");
        handleUpdateStatus(fileUpload.id, "error");
        throw new Error(body?.errors?.detail ?? "Something went wrong!");
      }

      const data = await res.json();

      if (data.data.status === "success") {
        return data;
      } else if (data.data.status === "error") {
        throw new Error();
      } else {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            refreshFileStatus(fileId).then(resolve).catch(reject);
          }, 1000);
        });
      }
    }

    async function createMemory(fileId: string | number) {
      const res = await fetch(
        `/super-api/organizations/${organizationId}/memory_collections/${collectionId}/memories`,
        {
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            file_id: fileId,
          }),
          method: "POST",
        },
      );

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body?.errors?.detail ?? "Something went wrong!");
      }
    }

    try {
      const {
        data: { id: fileId },
      } = await createFile(fileUpload);
      await refreshFileStatus(fileId);
      await createMemory(fileId);
      handleUpdateStatus(fileUpload.id, "done");
      revalidator.revalidate();
      removeFile(fileUpload.id);
    } catch (e) {
      errorToast("Something went wrong!");
      handleUpdateStatus(fileUpload.id, "error");
    }
  };

  const handleUploadFiles = async () => {
    loadingToast(() => Promise.all(items.map(handleUploadFile)), {
      loading: {
        title: "Files are still processing...",
        description: "Please do not close or refresh the app.",
      },
      success: {
        title: "Files processed successfully",
        description: "You can now view the file in the collection.",
      },
      error: {
        title: "Files processing failed",
        description: "Please try again later.",
      },
    });
  };

  const handleClose = () => {
    navigate(routes.collectionFiles(organizationId, collectionName));
  };

  return (
    <>
      <ActionSidebarHeader
        heading="New knowledge items"
        subheading={`Upload files to add to ${collectionName} Database.`}
        onClose={handleClose}
      />

      <Form className="grow flex flex-col gap-2 h-[70%]">
        <div className="grow overflow-y-auto">
          <FileUpload
            multiple
            name="files"
            className="!gap-6"
            labelText="Browse files to upload"
            fileList={items}
            onChange={onChange}
            onRemove={removeFile}
            preview={({ fileList }) => (
              <FileUploadListPreview fileList={fileList} remove={removeFile} />
            )}
          />
        </div>
        <Button
          ariaLabel="Upload knowledge items"
          isFluid
          size="sm"
          disabled={!items.length || isUploading}
          onClick={handleUploadFiles}
          isLoading={isUploading}
        >
          Add {items.length > 0 ? items.length : ""} knowledge items
        </Button>
      </Form>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "New collection files",
    },
  ];
};
