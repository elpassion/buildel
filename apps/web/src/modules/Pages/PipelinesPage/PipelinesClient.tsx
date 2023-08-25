'use client';

import React from 'react';
import { Button, Icon } from '@elpassion/taco';
import { Modal } from '@elpassion/taco/Modal';
import { PipelinesList } from '~/modules/Pages/PipelinesPage/PipelinesList';
import { CreatePipelineForm } from '~/modules/Pipelines';
import { useModal } from '~/utils/hooks';

export const PipelinesClient = () => {
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

      <PipelinesList />

      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        ariaHideApp={false}
        closeIcon="x"
        className="absolute top-[10%] !max-w-[640px] !p-8"
        // TODO (hub33k): wait for Taco to remove align center
        modalHeader={
          <div className="flex flex-col justify-start text-left">
            <p className="text-3xl">Create a new workflow</p>
            <div className="mb-4" />
            <p className="text-sm text-neutral-400">
              Any workflow can contain many Blocks and use your Knowledge Base.
            </p>
          </div>
        }
      >
        <CreatePipelineForm />
      </Modal>
    </>
  );
};
