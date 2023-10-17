import React, { forwardRef } from "react";
import { Button, Label } from "@elpassion/taco";
import {
  AsyncSelectField,
  AsyncSelectFieldProps,
} from "~/components/form/fields/asyncSelect.field";
import { useFieldContext } from "~/components/form/fields/field.context";
import { Modal } from "@elpassion/taco/Modal";
import {
  generateZODSchema,
  JSONSchemaField,
} from "~/components/form/schema/SchemaParser";
import { useModal } from "~/hooks/useModal";
import { Schema } from "~/components/form/schema/Schema";
import {
  ArrayField,
  BooleanField,
  NumberField,
  StringField,
} from "~/components/form/schema/SchemaFields";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { useFetcher } from "@remix-run/react";
import { asyncSelectApi } from "~/api/AsyncSelectApi";

interface CreatableSelectField extends AsyncSelectFieldProps {
  schema: JSONSchemaField;
}
export const CreatableSelectField = forwardRef<
  HTMLSelectElement,
  CreatableSelectField
>(({ label, supportingText, url, schema: JSONSchema, ...props }, ref) => {
  const { name } = useFieldContext();
  const { isModalOpen, openModal, closeModal } = useModal();
  const schema = generateZODSchema(JSONSchema as any);
  const validator = React.useMemo(() => withZod(schema), []);

  const fetcher = useFetcher();

  const handleCreate = (data: Record<string, any>) => {
    asyncSelectApi.createData(url, data as any);
  };
  return (
    <>
      <div className="flex justify-between items-end">
        <Label text={label} labelFor={name} />

        <button
          className="text-primary-500 text-sm mb-[6px] bg-transparent"
          onClick={openModal}
          type="button"
        >
          Add new
        </button>
      </div>

      <AsyncSelectField
        ref={ref}
        url={url}
        supportingText={supportingText}
        {...props}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        overlayClassName="!z-[60]"
        className="w-[90%] max-w-[500px]"
        header={
          <header className="p-1 text-white">
            <p className="text-2xl mb-2">{label}</p>
            <p className="text-sm text-neutral-400">{supportingText}</p>
          </header>
        }
      >
        <div
          className="p-1"
          onSubmit={(e) => {
            e.stopPropagation();
            console.log(e);
          }}
        >
          <ValidatedForm
            // @ts-ignore
            validator={validator}
            className="w-full grow flex flex-col"
            noValidate
            onSubmit={async (data, e) => {
              handleCreate(data);
            }}
          >
            <Schema
              schema={JSONSchema as any}
              name={null}
              fields={{
                string: StringField,
                number: NumberField,
                array: ArrayField,
                boolean: BooleanField,
                editor: () => <></>,
                asyncSelect: () => <></>,
                asyncCreatableSelect: () => <></>,
              }}
            />

            <Button
              size="sm"
              type="submit"
              variant="filled"
              className="mt-6"
              isFluid
            >
              Create new
            </Button>
          </ValidatedForm>
        </div>
      </Modal>
    </>
  );
});
