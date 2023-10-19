import React, { useState } from "react";
import { FileUpload } from "~/components/fileUpload/FileUpload";
import { FileUploadListPreview } from "~/components/fileUpload/FileUploadListPreview";
import { IFile } from "~/components/fileUpload/fileUpload.types";
import { TabGroup } from "~/components/tabs/TabGroup";
import { RadioInput } from "~/components/form/inputs/radio.input";
import { Tab } from "~/components/tabs/Tab";
interface DocumentSearchTabsProps {
  name: string;
  onUpload?: (file: File) => Promise<IFile>;
  onFetch?: () => Promise<IFile[]>;
  onRemove?: (id: number) => Promise<any>;
}

export const DocumentSearchTabs: React.FC<DocumentSearchTabsProps> = ({
  name,
  onUpload,
  onFetch,
  onRemove,
}) => {
  const [activeTab, setActiveTab] = useState("file");
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
          value="file"
          id="document-file"
          name="document-file"
          label="Files"
          checked={activeTab === "file"}
          onChange={onChange}
        />

        <RadioInput
          size="sm"
          value="url"
          id="document-url"
          name="document-url"
          label="Url"
          checked={activeTab === "url"}
          onChange={onChange}
        />
      </div>

      <Tab tabId="file">
        <FileUpload
          multiple
          id={name}
          name={name}
          onUpload={onUpload}
          onFetch={onFetch}
          onRemove={onRemove}
          preview={(props) => (
            <FileUploadListPreview {...props} className="max-h-[110px]" />
          )}
        />
      </Tab>

      <Tab tabId="url">
        <p>url</p>
      </Tab>
    </TabGroup>
  );
};
