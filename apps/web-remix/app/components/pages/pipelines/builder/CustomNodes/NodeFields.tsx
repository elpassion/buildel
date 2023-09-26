import React, { useCallback, useState } from "react";
import { IBlockConfig, IField } from "../../pipeline.types";
import {
  FileListResponse,
  FileResponse,
} from "~/components/pages/pipelines/contracts";
import { FileUpload } from "~/components/fileUpload/FileUpload";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import {
  IEvent,
  useRunPipeline,
  useRunPipelineNode,
} from "../RunPipelineProvider";
import { AudioRecorder } from "~/components/audioRecorder/AudioRecorder";
import { TextareaInput } from "~/components/form/inputs/textarea.input";
import { Button } from "@elpassion/taco";
import { IFile } from "~/components/fileUpload/fileUpload.types";
import { TabGroup } from "~/components/tabs/TabGroup";
import { Tab, TabButton } from "~/components/tabs/Tab";
import { RadioInput } from "~/components/form/inputs/radio.input";

interface NodeFieldsProps {
  fields: IField[];
  block: IBlockConfig;
}

export function NodeFieldsForm({ fields, block }: NodeFieldsProps) {
  const blockName = block.name;
  const { status, organizationId, pipelineId } = useRunPipeline();
  const { push, clearEvents } = useRunPipelineNode(block);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      clearEvents(blockName);

      const formData = new FormData(e.currentTarget);
      const fieldsData: Record<string, any> = {};

      for (let [key, value] of formData.entries()) {
        fieldsData[key] = value;
      }

      Object.keys(fieldsData).forEach((key) => {
        const topic = `${blockName}:${key}`;
        if (Array.isArray(fieldsData[key])) {
          fieldsData[key].forEach((value: any) => {
            push(topic, value);
          });
        } else {
          push(topic, fieldsData[key]);
        }
      });
    },
    [blockName, clearEvents, push]
  );

  const uploadAudioChunk = useCallback(
    (chunk: Blob, fieldName: string) => {
      const topic = `${blockName}:${fieldName}`;
      push(topic, chunk);
    },
    [blockName, push]
  );

  const uploadFile = useCallback(async (file: File): Promise<IFile> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("collection_name", `${pipelineId}_${blockName}`);

    const response = await fetch(
      `/super-api/organizations/${organizationId}/memories`,
      {
        body: formData,
        method: "POST",
      }
    ).then((res) => res.json());

    return { ...FileResponse.parse(response), status: "done" };
  }, []);

  const removeFile = useCallback(async (id: number) => {
    return fetch(`/super-api/organizations/${organizationId}/memories/${id}`, {
      method: "DELETE",
    });
  }, []);

  const fetchFiles = useCallback(async (): Promise<IFile[]> => {
    const response = await fetch(
      `/super-api/organizations/${organizationId}/memories?collection_name=${pipelineId}_${blockName}`
    ).then((res) => res.json());

    return FileListResponse.parse(response).map((file) => ({
      ...file,
      status: "done",
    }));
  }, []);

  const renderInput = useCallback(
    (field: IField) => {
      const { type, name } = field.data;

      if (type === "text") {
        return (
          <TextareaInput
            label=""
            id={name}
            name={name}
            placeholder="Input text to test the workflow"
            rows={5}
          />
        );
      } else if (type === "file") {
        return (
          <FileUpload
            multiple
            id={name}
            name={name}
            onUpload={uploadFile}
            onFetch={fetchFiles}
            onRemove={removeFile}
            preview={(props) => <FileUploadListPreview {...props} />}
          />
        );
      } else if (field.data.type === "audio") {
        return (
          <AudioField
            name={field.data.name}
            onUpload={uploadFile}
            onFetch={fetchFiles}
            onChunk={uploadAudioChunk}
          />
        );
      }

      return <span>Unsupported input type - {type}</span>;
    },
    [fetchFiles, removeFile, uploadFile, status]
  );

  return (
    <form onSubmit={onSubmit}>
      <div className="mb-2">
        {fields.map((field) => (
          <React.Fragment key={field.type}>{renderInput(field)}</React.Fragment>
        ))}
      </div>

      {status === "running" && (
        <Button
          type="submit"
          size="xs"
          disabled={status !== "running"}
          className="!text-xs"
          isFluid
        >
          Send
        </Button>
      )}
    </form>
  );
}

interface AudioFieldProps {
  onChunk: (chunk: Blob, name: string) => void;
  onUpload: (file: File) => Promise<IFile>;
  onFetch: () => Promise<IFile[]>;
  name: string;
}

function AudioField({ onChunk, onFetch, onUpload, name }: AudioFieldProps) {
  const [activeTab, setActiveTab] = useState("microphone");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveTab(e.target.value);
  };
  return (
    <TabGroup activeTab={activeTab}>
      <div className="flex gap-2 mb-3 mt-1 w-[260px]">
        <RadioInput
          size="sm"
          value="microphone"
          id="audio-upload-mic"
          name="audio-upload"
          labelText="Microphone"
          checked={activeTab === "microphone"}
          onChange={onChange}
        />

        <RadioInput
          size="sm"
          value="upload"
          id="audio-upload-upload"
          name="audio-upload"
          labelText="File upload"
          checked={activeTab === "upload"}
          onChange={onChange}
        />
      </div>

      <Tab tabId="microphone">
        <AudioRecorder onChunk={(e) => onChunk(e.data, name)} />
      </Tab>

      <Tab tabId="upload">
        <FileUpload
          multiple
          name={name}
          onFetch={onFetch}
          onUpload={onUpload}
        />
      </Tab>
    </TabGroup>
  );
}

export function NodeFieldsOutput({ fields, block }: NodeFieldsProps) {
  const { events } = useRunPipelineNode(block);

  const renderOutput = useCallback(
    (field: IField) => {
      const { type } = field.data;

      if (type === "text") {
        return (
          <div className="w-full min-w-full max-w-full overflow-y-auto resize min-h-[100px] max-h-[500px] border border-neutral-200 rounded-md py-2 px-[10px]">
            <p className="text-xs text-white">
              {getTextFieldsMessages(events, field.data.name)}
            </p>
          </div>
        );
      } else if (type === "audio") {
        return (
          <>
            <p>Audio output</p>
          </>
        );
      }

      return <span>Unsupported output type - {type}</span>;
    },
    [events]
  );

  return (
    <div>
      {fields.map((field) => (
        <React.Fragment key={field.data.name}>
          {renderOutput(field)}
        </React.Fragment>
      ))}
    </div>
  );
}

const getTextFieldsMessages = (events: IEvent[], outputName: string) => {
  const fieldEvents = events.filter((ev) => ev.output === outputName);

  return fieldEvents.map((ev) => ev.payload.message).join("");
};
