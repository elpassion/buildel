import React, { PropsWithChildren, useEffect, useState } from "react";
import z from "zod";
import { v4 as uuidv4 } from "uuid";
import { Button, Icon } from "@elpassion/taco";
import { RunPipelineButton } from "./RunPipelineButton";
import { useRunPipeline } from "../RunPipelineProvider";
import { useModal } from "~/hooks/useModal";
import { MonacoEditorField } from "~/components/form/fields/monacoEditor.field";
import { Field as FormField } from "~/components/form/fields/field.context";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import { useLoaderData } from "@remix-run/react";
import { loader } from "~/components/pages/pipelines/build/loader";
import { generateZODSchema } from "~/components/form/schema/SchemaParser";
import { IBlockConfig } from "~/components/pages/pipelines/pipeline.types";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";

interface BuilderHeaderProps {
  isUpToDate: boolean;
}

export const BuilderHeader: React.FC<PropsWithChildren<BuilderHeaderProps>> = ({
  isUpToDate,
  children,
}) => {
  return (
    <header className="absolute top-8 left-4 right-4 z-10 flex justify-between pointer-events-none">
      <RunPipelineButton isUpToDate={isUpToDate} />

      <div className="flex gap-2 items-center pointer-events-auto">
        {children}
      </div>
    </header>
  );
};

export function PasteBlockConfiguration({
  onSubmit,
}: {
  onSubmit: (block: IBlockConfig) => void;
}) {
  const [formKey, setFormKey] = useState(uuidv4());
  const { openModal, closeModal, isModalOpen } = useModal();
  const { status: runStatus } = useRunPipeline();

  const handleOnSubmit = (block: IBlockConfig) => {
    onSubmit(block);
    closeModal();
  };

  useEffect(() => {
    // hack for resetting editor value when closing sidebar
    if (!isModalOpen) {
      setFormKey(uuidv4());
    }
  }, [isModalOpen]);

  return (
    <>
      <button
        onClick={openModal}
        disabled={runStatus !== "idle"}
        aria-label="Paste block configuration"
        title="Paste block configuration"
        className="flex items-center justify-center w-8 h-8 bg-neutral-800 hover:bg-neutral-850 disabled:bg-neutral-300 text-neutral-100 rounded-lg text-sm"
      >
        <Icon iconName="clipboard" />
      </button>
      <ActionSidebar
        isOpen={isModalOpen}
        onClose={closeModal}
        className="md:w-[460px]"
      >
        <ActionSidebarHeader
          heading="Create block"
          subheading="Copy the block configuration and paste it here for easy block creation."
          onClose={closeModal}
        />

        <PasteBlockConfigurationForm
          key={formKey}
          onSubmit={handleOnSubmit}
          disabled={runStatus !== "idle"}
        />
      </ActionSidebar>
    </>
  );
}

const schema = z.object({
  configuration: z.string(),
});

interface PasteBlockConfigurationFormProps {
  onSubmit: (block: IBlockConfig) => void;
  disabled?: boolean;
}

export function PasteBlockConfigurationForm({
  onSubmit,
  disabled,
}: PasteBlockConfigurationFormProps) {
  const validator = React.useMemo(() => withZod(schema), []);
  const { blockTypes } = useLoaderData<typeof loader>();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOnSubmit = async (
    data: { configuration: string },
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setErrors({});
    try {
      const config = JSON.parse(data.configuration);

      if (!config.type) {
        return setErrors({ configuration: "Missing block 'type'" });
      }
      if (!config.opts) {
        return setErrors({ configuration: "Missing block 'opts'" });
      }

      const index = blockTypes.findIndex((b) => b.type === config.type);

      if (index < 0) {
        return setErrors({ configuration: "Incorrect block 'type'" });
      }

      const block = blockTypes[index];

      config.block_type = block;

      const blockSchema = generateZODSchema(block.schema.properties.opts);
      const validator = withZod(blockSchema);

      const result = await validator.validate(config.opts);

      if (result.error) {
        return setErrors({
          configuration: "There is an error in block configuration",
        });
      }

      onSubmit({ inputs: [], connections: [], ...config });
      e.currentTarget?.reset();
    } catch (e) {
      console.log(e);
      setErrors({ configuration: "Invalid configuration" });
    }
  };

  return (
    <ValidatedForm
      validator={validator}
      onSubmit={handleOnSubmit}
      className="h-[95%] flex flex-col"
      noValidate
    >
      <div className="grow">
        <FormField name="configuration">
          <MonacoEditorField
            height="350px"
            label="Block configuration"
            supportingText="Paste the block configuration in JSON format."
            language="json"
            error={errors.configuration}
          />
        </FormField>
      </div>

      <Button
        isFluid
        size="sm"
        type="submit"
        variant="filled"
        className="mt-6"
        disabled={disabled}
      >
        Add block
      </Button>
    </ValidatedForm>
  );
}

interface SaveChangesButtonProps {
  isUpToDate: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

export function SaveChangesButton({
  isSaving,
  isUpToDate,
  onSave,
}: SaveChangesButtonProps) {
  const { status: runStatus } = useRunPipeline();
  return (
    <div className="flex items-center gap-2">
      {isUpToDate ? null : (
        <div className="py-1 px-2 bg-neutral-800 text-neutral-100 rounded text-xs">
          There are unsaved changes
        </div>
      )}

      <Button
        disabled={runStatus !== "idle" || isUpToDate}
        onClick={onSave}
        variant="filled"
        size="sm"
        isLoading={isSaving}
      >
        Save changes
      </Button>
    </div>
  );
}
