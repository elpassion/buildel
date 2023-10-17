import React, { forwardRef, PropsWithChildren, useState } from "react";
import { Label } from "@elpassion/taco";
import {
  AsyncSelectField,
  AsyncSelectFieldProps,
} from "~/components/form/fields/asyncSelect.field";
import { useFieldContext } from "~/components/form/fields/field.context";
import { Modal } from "@elpassion/taco/Modal";
import { useModal } from "~/hooks/useModal";

interface CreatableSelectFieldProps
  extends Omit<AsyncSelectFieldProps, "url">,
    PropsWithChildren {
  onCreate: () => void;
  fetchUrl: string;
  createUrl: string;
}
export const CreatableSelectField = forwardRef<
  HTMLSelectElement,
  CreatableSelectFieldProps
>(({ onCreate, label, createUrl, fetchUrl, children, ...props }, ref) => {
  const { name } = useFieldContext();
  const { isModalOpen, openModal, closeModal } = useModal();

  const handleCreate = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();
    openModal();
  };

  return (
    <>
      <div className="flex justify-between items-end">
        <Label text={label} labelFor={name} />

        <button
          className="text-primary-500 text-sm mb-[6px] bg-transparent"
          onClick={handleCreate}
        >
          Add new
        </button>
      </div>

      <AsyncSelectField ref={ref} url={fetchUrl} {...props} />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        overlayClassName="!z-[60]"
        header={
          <header className="p-1 text-white">
            <p className="text-2xl mb-2">Create a new API Key</p>
            <p className="text-sm text-neutral-400">
              Any API Key can be used in many blocks.
            </p>
          </header>
        }
      >
        <div className="p-1">
          <p>DUPA</p>
        </div>
      </Modal>
    </>
  );
});
