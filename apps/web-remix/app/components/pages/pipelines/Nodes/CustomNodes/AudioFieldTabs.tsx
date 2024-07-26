import React, { useState } from 'react';

import { AudioRecorder } from '~/components/audioRecorder/AudioRecorder';
import { FileUpload } from '~/components/fileUpload/FileUpload';
import type { IFile } from '~/components/fileUpload/fileUpload.types';
import { FileUploadListPreview } from '~/components/fileUpload/FileUploadListPreview';
import { RadioInput } from '~/components/form/inputs/radio.input';
import { Tab } from '~/components/tabs/Tab';
import { TabGroup } from '~/components/tabs/TabGroup';
import { Label } from '~/components/ui/label';
import { RadioGroup } from '~/components/ui/radio-group';

import { useRunPipeline } from '../../RunPipelineProvider';

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
  const [activeTab, setActiveTab] = useState('microphone');

  return (
    <TabGroup activeTab={activeTab}>
      <div className="flex gap-2 pb-3 mb-3 mt-1 w-[280px] border-b-[1px] border-input">
        <RadioGroup
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex gap-2 items-center"
        >
          <Label className="flex gap-1 items-center">
            <RadioInput
              value="microphone"
              id="audio-upload"
              checked={activeTab === 'microphone'}
            />

            <span>Microphone</span>
          </Label>

          <Label className="flex gap-1 items-center">
            <RadioInput
              value="upload"
              id="audio-upload"
              checked={activeTab === 'upload'}
            />

            <span>File upload</span>
          </Label>
        </RadioGroup>
      </div>

      <Tab tabId="microphone">
        <p className="text-[10px] text-muted-foreground mb-3">
          You need to start the workflow first in order to stream audio.
        </p>
        <p className="text-xs font-medium text-foreground mb-1">Audio stream</p>
        <AudioRecorder
          onChunk={(e) => onChunk(e.data, name)}
          disabled={status !== 'running' || disabled}
        />
      </Tab>

      <Tab tabId="upload">
        <p className="text-[10px] text-muted-foreground mb-2">
          You need to start the workflow first in order to upload audio.
        </p>
        <FileUpload
          multiple
          name={name}
          onUpload={(file) => onUpload(file, name)}
          preview={(props) => (
            <FileUploadListPreview {...props} className="max-h-[110px]" />
          )}
          disabled={status !== 'running' || disabled}
          accept="audio/*"
        />
      </Tab>
    </TabGroup>
  );
}
