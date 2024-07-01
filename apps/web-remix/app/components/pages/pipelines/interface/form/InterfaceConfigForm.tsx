import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Button } from "@elpassion/taco";
import { withZod } from "@remix-validated-form/with-zod";
import {
  IBlockConfig,
  IFormInterfaceConfig,
  IPipeline,
} from "~/components/pages/pipelines/pipeline.types";
import { Field } from "~/components/form/fields/field.context";
import { SelectField } from "~/components/form/fields/select.field";
import { SubmitButton } from "~/components/form/submit";
import { CheckboxInputField } from "~/components/form/fields/checkbox.field";
import { FormInterfaceConfig } from "~/api/pipeline/pipeline.contracts";

interface InterfaceConfigFormProps {
  pipeline: IPipeline;
  onSubmit: (config: IFormInterfaceConfig) => void;
}

export const InterfaceConfigForm: React.FC<InterfaceConfigFormProps> = ({
  pipeline,
  onSubmit,
}) => {
  const validator = useMemo(() => withZod(FormInterfaceConfig), []);

  const inputs = pipeline.config.blocks.filter(
    (block) => ["text_input", "file_input"].includes(block.type),
  );
  const outputs = pipeline.config.blocks.filter(
    (block) => block.type === "text_output", // todo: add file output
  );

  const handleOnSubmit = (
    data: IFormInterfaceConfig,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <ValidatedForm
      defaultValues={{
        inputs: pipeline.interface_config?.form?.inputs,
        outputs: pipeline.interface_config?.form?.outputs,
        public: pipeline.interface_config?.form?.public,
      }}
      validator={validator}
      noValidate
      onSubmit={handleOnSubmit}
    >
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-center max-w-screen-2xl">
        <Field name="input">
          <SelectField options={inputs.map(toSelectOption)} label="Input" />
        </Field>

        <Field name="output">
          <SelectField options={outputs.map(toSelectOption)} label="Output" />
        </Field>

        <Field name="public">
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
