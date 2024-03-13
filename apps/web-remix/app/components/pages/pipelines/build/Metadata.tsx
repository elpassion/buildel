import React, { ButtonHTMLAttributes, PropsWithChildren, useRef } from "react";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";
import { useBoolean, useOnClickOutside } from "usehooks-ts";
import {
  useRunPipeline,
  Metadata as IMetadata,
} from "~/components/pages/pipelines/RunPipelineProvider";
import { z } from "zod";
import { withZod } from "@remix-validated-form/with-zod";
import { useFormContext, ValidatedForm } from "remix-validated-form";
import { Field } from "~/components/form/fields/field.context";
import { MonacoEditorField } from "~/components/form/fields/monacoEditor.field";
import { SubmitButton } from "~/components/form/submit";

export const MetadataField = () => {
  const { metadata, setMetadata } = useRunPipeline();

  return (
    <Metadata>
      <MetadataForm
        defaultValue={JSON.stringify(metadata)}
        onSubmit={setMetadata}
      />
    </Metadata>
  );
};

function Metadata({ children }: PropsWithChildren) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { value: isShown, setFalse, toggle } = useBoolean(false);

  const hide = () => {
    setFalse();
  };

  useOnClickOutside(wrapperRef, hide);

  return (
    <div ref={wrapperRef} className="relative">
      <MetadataTrigger onClick={toggle} />

      {isShown && (
        <MetadataDropdown className="lg:min-w-[400px]">
          {children}
        </MetadataDropdown>
      )}
    </div>
  );
}

const metadataSchema = z.object({
  value: z.string().transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: "custom", message: "Invalid JSON" });
      return z.NEVER;
    }
  }),
});

type MetadataSchema = z.TypeOf<typeof metadataSchema>;

interface MetadataFormProps {
  defaultValue: string;
  onSubmit: (value: IMetadata) => void;
}
function MetadataForm({ defaultValue, onSubmit }: MetadataFormProps) {
  const validator = React.useMemo(() => withZod(metadataSchema), []);

  const handleOnSubmit = (data: MetadataSchema) => {
    if (!data.value) return onSubmit({});
    onSubmit(data.value);
  };

  return (
    <ValidatedForm
      defaultValues={{ value: defaultValue }}
      onSubmit={handleOnSubmit}
      validator={validator}
      noValidate
    >
      <Field name="value">
        <MetadataEditor />
      </Field>

      <div className="flex justify-end w-full">
        <SubmitButton size="xs">Set</SubmitButton>
      </div>
    </ValidatedForm>
  );
}

function MetadataEditor() {
  const { fieldErrors } = useFormContext();

  return (
    <MonacoEditorField
      supportingText="Properties that will be accessible in every block."
      language="json"
      label="Metadata"
      defaultValue=""
      error={fieldErrors["value"]}
    />
  );
}

function MetadataTrigger({
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={classNames(
        "bg-neutral-950 text-neutral-100 w-8 h-8 rounded-lg text-sm flex items-center justify-center hover:bg-neutral-900 transition",
        className
      )}
      {...rest}
    >
      <Icon iconName="file-text" />
    </button>
  );
}

interface MetadataDropdownProps {
  className?: string;
}

function MetadataDropdown({
  children,

  className,
}: PropsWithChildren<MetadataDropdownProps>) {
  return (
    <div
      className={classNames(
        "min-w-[250px] absolute z-[11] top-full translate-y-[4px] left-0 bg-neutral-850 border border-neutral-800 rounded-lg p-2 transition",

        className
      )}
    >
      {children}
    </div>
  );
}
