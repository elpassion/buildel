import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Button } from "@elpassion/taco";
import { withZod } from "@remix-validated-form/with-zod";
import {
  IBlockConfig,
  IInterfaceConfig,
  IPipeline,
} from "~/components/pages/pipelines/pipeline.types";
import { Field } from "~/components/form/fields/field.context";
import { SelectField } from "~/components/form/fields/select.field";
import { schema } from "./schema";
import { SubmitButton } from "~/components/form/submit";

interface InterfaceConfigFormProps {
  pipeline: IPipeline;
  onSubmit: (config: IInterfaceConfig) => void;
}

export const InterfaceConfigForm: React.FC<InterfaceConfigFormProps> = ({
  pipeline,
  onSubmit,
}) => {
  const validator = useMemo(() => withZod(schema), []);

  const inputs = pipeline.config.blocks.filter(
    (block) => block.type === "text_input"
  );
  const outputs = pipeline.config.blocks.filter(
    (block) => block.type === "text_output"
  );
  const chats = pipeline.config.blocks.filter((block) => block.type === "chat");

  const handleOnSubmit = (
    data: IInterfaceConfig,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <ValidatedForm
      defaultValues={{
        input: pipeline.interface_config?.input,
        output: pipeline.interface_config?.output,
        chat: pipeline.interface_config?.chat,
      }}
      validator={validator}
      noValidate
      onSubmit={handleOnSubmit}
    >
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-center max-w-screen-2xl">
        <Field name="input">
          <SelectField options={inputs.map(toSelectOption)} label="Input" />
        </Field>

        <Field name="output">
          <SelectField options={outputs.map(toSelectOption)} label="Output" />
        </Field>

        <Field name="chat">
          <SelectField options={chats.map(toSelectOption)} label="Chat" />
        </Field>
      </div>

      <SubmitButton size="sm" variant="filled" className="mt-6">
        Save changes
      </SubmitButton>
    </ValidatedForm>
  );
};

function toSelectOption(item: IBlockConfig) {
  return {
    id: item.name.toString(),
    value: item.name.toString(),
    label: item.name,
  };
}
