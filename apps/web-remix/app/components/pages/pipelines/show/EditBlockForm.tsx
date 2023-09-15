import * as React from "react";
import { z } from "zod";
import { Button } from "@elpassion/taco";
import { generateZODSchema } from "~/components/form/schema/SchemaParser";
import { BlockConfig } from "../contracts";
import { FieldProps, Schema } from "~/components/form/schema/Schema";
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from "~/components/form/schema/SchemaFields";
import { ValidatedForm } from "remix-validated-form";
import { withZod } from "@remix-validated-form/with-zod";
import {
  Field as FormField,
  HiddenField,
} from "~/components/form/fields/field.context";
import { MonacoEditorField } from "~/components/form/fields/monacoEditor.field";
import { useCallback } from "react";

export function EditBlockForm({
  onSubmit,
  blockConfig,
}: {
  onSubmit: (data: z.TypeOf<typeof BlockConfig>) => void;
  blockConfig: z.TypeOf<typeof BlockConfig>;
}) {
  const schema = generateZODSchema(blockConfig.block_type.schema as any);
  const validator = React.useMemo(() => withZod(schema), []);

  const handleUpdate = (
    data: Record<string, any>,
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    onSubmit({ ...blockConfig, ...data });
  };

  const EditorField = useCallback(
    (props: FieldProps) => (
      <FormField name={props.name!}>
        <MonacoEditorField
          suggestions={generateSuggestions(blockConfig.inputs)}
        />
      </FormField>
    ),
    [blockConfig.inputs]
  );

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      defaultValues={blockConfig}
      onSubmit={handleUpdate}
      className="w-full max-w-md"
      noValidate
    >
      <div className="space-y-4">
        <HiddenField name="name" value={blockConfig.name} />
        <HiddenField name="inputs" value={JSON.stringify(blockConfig.inputs)} />

        <Schema
          schema={blockConfig.block_type.schema as any}
          name="opts"
          fields={{
            string: StringField,
            number: NumberField,
            array: ArrayField,
            boolean: BooleanField,
            editor: EditorField,
          }}
        />
      </div>
      <div className="mt-6 flex justify-end">
        <Button type="submit" variant="filled">
          Confirm
        </Button>
      </div>
    </ValidatedForm>
  );
}

function generateSuggestions(inputs: string[]) {
  return inputs.map((suggestion) => suggestion.split("->").at(0) ?? "");
}
