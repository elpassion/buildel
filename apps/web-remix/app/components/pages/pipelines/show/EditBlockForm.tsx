import { z } from "zod";
import { Button } from "@elpassion/taco";
import { generateZODSchema } from "~/components/form/schema/SchemaParser";
import { BlockConfig, IBlockConfig } from "../list/contracts";
import { Schema } from "~/components/form/schema/Schema";
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from "~/components/form/schema/SchemaFields";
import { ValidatedForm } from "remix-validated-form";
import * as React from "react";
import { withZod } from "@remix-validated-form/with-zod";

export function EditBlockForm({
  onSubmit,
  blockConfig,
}: {
  onSubmit: (data: z.TypeOf<typeof BlockConfig>) => void;
  blockConfig: z.TypeOf<typeof BlockConfig>;
}) {
  const schema = generateZODSchema(blockConfig.block_type.schema as any);
  const validator = React.useMemo(() => withZod(schema), []);

  const handleUpdate = (data: IBlockConfig) => {
    console.log(data);
    // onSubmit({ ...blockConfig, ...data });
  };
  console.log(blockConfig);

  return (
    <ValidatedForm
      // @ts-ignore
      validator={validator}
      defaultValues={blockConfig}
      className="w-full max-w-md"
      method="post"
      onSubmit={(e) => console.log(e)}
    >
      <div className="space-y-4">
        <Schema
          schema={blockConfig.block_type.schema as any}
          name="opts"
          fields={{
            string: StringField,
            number: NumberField,
            array: ArrayField,
            boolean: BooleanField,
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
