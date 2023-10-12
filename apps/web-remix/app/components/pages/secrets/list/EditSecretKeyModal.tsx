import React, { useMemo } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Modal } from "@elpassion/taco/Modal";
import { withZod } from "@remix-validated-form/with-zod";
import { Button } from "@elpassion/taco";
import { Field, HiddenField } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { ISecretKey } from "../secrets.types";
import { schema } from "./schema";
interface EditSecretModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: ISecretKey;
}

export const EditSecretKeyModal: React.FC<EditSecretModalProps> = ({
  isOpen,
  onClose,
  initialData: { key, ...initialData },
}) => {
  const validator = useMemo(() => withZod(schema), []);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      header={
        <header className="p-1 text-white">
          <p className="text-3xl mb-4">Edit Secret</p>

          <p className="text-sm text-neutral-400">
            Edit your {initialData.name} secret.
          </p>
        </header>
      }
    >
      <div className="p-1">
        <ValidatedForm
          noValidate
          method="post"
          validator={validator}
          defaultValues={initialData}
        >
          <HiddenField name="id" />
          <HiddenField name="name" />

          <Field name="key">
            <TextInputField
              autoFocus
              type="text"
              label="Enter Secret"
              placeholder="Type or paste in your secret key"
              supportingText="The actual token key that will authorise you in the external system, such as Open AI."
            />
          </Field>

          <Button
            size="sm"
            hierarchy="primary"
            type="submit"
            className="mt-6 ml-auto mr-0"
          >
            Update Secret
          </Button>
        </ValidatedForm>
      </div>
    </Modal>
  );
};
