'use client';

import React from 'react';
import { Button } from '@elpassion/taco';
import { Modal } from '@elpassion/taco/Modal';
import { CreatePipelineForm } from '~/modules/Pipelines';
import { useModal } from '~/utils/hooks';

export const PipelinesHeader = () => {
  const { isModalOpen, openModal, closeModal: closeModalBase } = useModal();

  function closeModal() {
    closeModalBase();
  }

  return (
    <>
      <div>
        <Button text="New workflow" size="xs" onClick={openModal} />
      </div>

      <div className="mb-6" />

      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        ariaHideApp={false}
        closeIcon="x"
        className="!max-w-[640px] !p-8"
        align="left"
        modalHeader={
          <div>
            <p className="text-3xl">Create a new workflow</p>
            <div className="mb-4" />
            <p className="text-sm text-neutral-400">
              Any workflow can contain many Blocks and use your Knowledge Base.
            </p>
          </div>
        }
      >
        <div className="h-full !max-h-[640px] overflow-auto">
          <CreatePipelineForm />
        </div>
      </Modal>
    </>
  );
};
