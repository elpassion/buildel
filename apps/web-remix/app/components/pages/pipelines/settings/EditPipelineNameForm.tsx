import { useModal } from "~/hooks/useModal";
import React, { useCallback, useEffect, useMemo } from "react";
import { withZod } from "@remix-validated-form/with-zod";
import { IconButton } from "~/components/iconButton";
import { Modal } from "@elpassion/taco/Modal";
import { ValidatedForm } from "remix-validated-form";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
import { IPipeline } from "~/components/pages/pipelines/pipeline.types";
import { updatePipelineNameSchema } from "./schema";
import { successToast } from "~/components/toasts/successToast";
import { SubmitButton } from "~/components/form/submit";
import { useFetcher } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";

interface EditPipelineNameFormProps {
  defaultValues: IPipeline;
}
export function EditPipelineNameForm({
  defaultValues,
}: EditPipelineNameFormProps) {
  const { isModalOpen, openModal, closeModal } = useModal();
  const validator = useMemo(() => withZod(updatePipelineNameSchema), []);

  const updateFetcher = useFetcher<IPipeline>();

  const handleOnSubmit = useCallback(
    (data: { name: string }, e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const pipeline = { ...defaultValues, name: data.name };

      updateFetcher.submit(pipeline, {
        method: "PUT",
        encType: "application/json",
        action:
          routes.pipelineBuild(pipeline.organization_id, pipeline.id) +
          "?index",
      });
    },
    [defaultValues]
  );

  useEffect(() => {
    if (updateFetcher.data) {
      closeModal();
      successToast({ description: "Workflow name has been changed" });
    }
  }, [updateFetcher]);

  return (
    <>
      <IconButton
        iconName="edit-2"
        variant="ghost"
        size="sm"
        aria-label="Edit workflow name"
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

            <SubmitButton type="submit" size="lg" className="mt-4 ml-auto mr-0">
              Save
            </SubmitButton>
          </ValidatedForm>
        </div>
      </Modal>
    </>
  );
}
