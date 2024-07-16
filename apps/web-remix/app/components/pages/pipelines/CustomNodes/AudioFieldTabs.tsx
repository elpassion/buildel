import React, { useState } from "react";
import { AudioRecorder } from "~/components/audioRecorder/AudioRecorder";
import { FileUpload } from "~/components/fileUpload/FileUpload";
import type { IFile } from "~/components/fileUpload/fileUpload.types";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import { RadioInput } from "~/components/form/inputs/radio.input";
import { Tab } from "~/components/tabs/Tab";
import { TabGroup } from "~/components/tabs/TabGroup";
import { useRunPipeline } from "../RunPipelineProvider";

interface AudioFieldTabsProps {
  onChunk: (chunk: Blob, name: string) => void;
  onUpload: (file: File, name: string) => Promise<IFile>;
  name: string;
  disabled?: boolean;
}

export function AudioFieldTabs({
  onChunk,
  onUpload,
  name,
  disabled = false,
}: AudioFieldTabsProps) {
  const { status } = useRunPipeline();
  const [activeTab, setActiveTab] = useState("microphone");
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveTab(e.target.value);
  };
  return (
    <TabGroup activeTab={activeTab}>
      <div className="flex gap-2 pb-3 mb-3 mt-1 w-[280px] border-b-[1px] border-neutral-600">
        <RadioInput
          size="sm"
          value="microphone"
          id="audio-upload-mic"
          name="audio-upload"
          label="Microphone"
          checked={activeTab === "microphone"}
          onChange={onChange}
        />

        <RadioInput
          size="sm"
          value="upload"
          id="audio-upload-upload"
          name="audio-upload"
          label="File upload"
          checked={activeTab === "upload"}
          onChange={onChange}
        />
      </div>

      <Tab tabId="microphone">
        <p className="text-[10px] text-white mb-3">
          You need to start the workflow first in order to stream audio.
        </p>
        <p className="text-xs font-bold text-white mb-1">Audio stream</p>
        <AudioRecorder
          onChunk={(e) => onChunk(e.data, name)}
          disabled={status !== "running" || disabled}
        />
      </Tab>

      <Tab tabId="upload">
        <p className="text-[10px] text-white mb-2">
          You need to start the workflow first in order to upload audio.
        </p>
        <FileUpload
          multiple
          name={name}
          onUpload={(file) => onUpload(file, name)}
          preview={(props) => (
            <FileUploadListPreview {...props} className="max-h-[110px]" />
          )}
          disabled={status !== "running" || disabled}
          accept="audio/*"
        />
      </Tab>
    </TabGroup>
  );
}
