import { useModal } from "~/hooks/useModal";
import React, { useCallback, useMemo } from "react";
import { withZod } from "@remix-validated-form/with-zod";
import { IconButton } from "~/components/iconButton";
import { Modal } from "@elpassion/taco/Modal";
import { ValidatedForm } from "remix-validated-form";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { Button } from "@elpassion/taco";
import { IPipeline } from "~/components/pages/pipelines/pipeline.types";
import { updatePipelineNameSchema } from "./schema";
import { successToast } from "~/components/toasts/successToast";
import { SubmitButton } from "~/components/form/submit";

interface EditPipelineNameFormProps {
  defaultValues: IPipeline;
  onSubmit: (data: IPipeline) => void;
}
export function EditPipelineNameForm({
  defaultValues,
  onSubmit,
}: EditPipelineNameFormProps) {
  const { isModalOpen, openModal, closeModal } = useModal();
  const validator = useMemo(() => withZod(updatePipelineNameSchema), []);

  const handleOnSubmit = useCallback(
    (data: { name: string }, e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      onSubmit({ ...defaultValues, name: data.name });
      closeModal();
      successToast({ description: "Workflow name has been changed" });
    },
    [defaultValues, onSubmit]
  );

  return (
    <>
      <IconButton
        iconName="edit-2"
        variant="ghost"
        size="sm"
        aria-label="Edit organization name"
        onClick={openModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        closeButtonProps={{ iconName: "x", "aria-label": "Close" }}
        header={
          <header className="p-1 text-white mr-3">
            <p className="text-3xl mb-4">Edit name</p>

            <p className="text-sm text-neutral-400">
              Edit <span className="font-bold">{defaultValues.name}</span>{" "}
              workflow.
            </p>
          </header>
        }
      >
        <div className="p-1 w-[330px] md:w-[450px]">
          <ValidatedForm
            method="put"
            noValidate
            validator={validator}
            onSubmit={handleOnSubmit}
            defaultValues={{ name: defaultValues.name }}
          >
            <Field name="name">
              <TextInputField
                label="Pipeline name"
                placeholder="Acme"
                supportingText="This will be visible only to you"
              />
            </Field>

            <SubmitButton size="lg" className="mt-4 ml-auto mr-0">
              Save
            </SubmitButton>
          </ValidatedForm>
        </div>
      </Modal>
    </>
  );
}
