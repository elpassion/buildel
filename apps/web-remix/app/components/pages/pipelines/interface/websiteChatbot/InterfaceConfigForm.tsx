import { withZod } from "@remix-validated-form/with-zod";
import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { CheckboxInputField } from "~/components/form/fields/checkbox.field";
import { Field } from "~/components/form/fields/field.context";
import { SelectField } from "~/components/form/fields/select.field";
import { SubmitButton } from "~/components/form/submit";
import {
  IBlockConfig,
  IInterfaceConfig,
  IPipeline,
} from "~/components/pages/pipelines/pipeline.types";
import { schema } from "./schema";

interface InterfaceConfigFormProps {
  pipeline: IPipeline;
  onSubmit: (config: IInterfaceConfig) => void;
}

export const InterfaceConfigForm: React.FC<InterfaceConfigFormProps> = ({
  pipeline,
  onSubmit,
}) => {
  const validator = useMemo(() => withZod(schema), []);

  const inputs = pipeline.config.blocks.filter((block) =>
    ["text_input", "file_input"].includes(block.type),
  );
  const outputs = pipeline.config.blocks.filter(
    (block) => block.type === "text_output",
  );

  const handleOnSubmit = (
    data: IInterfaceConfig,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const body = { ...pipeline.interface_config, webchat: data.webchat };
    onSubmit(body);
  };

  return (
    <ValidatedForm
      defaultValues={{
        ...pipeline.interface_config,
      }}
      validator={validator}
      noValidate
      onSubmit={handleOnSubmit}
    >
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center max-w-screen-2xl">
        <Field name="webchat.inputs">
          <SelectField
            options={inputs.map(toSelectOption)}
            mode="multiple"
            label="Input"
          />
        </Field>

        <Field name="webchat.outputs">
          <SelectField
            options={outputs.map(toSelectOption)}
            mode="multiple"
            label="Output"
          />
        </Field>

        <Field name="webchat.public">
          <CheckboxInputField label="Public" />
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
