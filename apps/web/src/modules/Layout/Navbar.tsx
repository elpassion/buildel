'use client';

import React from 'react';
import { Button, Icon, Navbar as NavbarTaco } from '@elpassion/taco';
import { Modal } from '@elpassion/taco/Modal';
import { useLayout } from '~/modules/Layout/LayoutContext';
import { CreatePipelineForm } from '~/modules/Pipelines';
import { useModal } from '~/utils/hooks';

export const Navbar = () => {
  const [{ isSidebarOpen }, layoutDispatch] = useLayout();
  const { isModalOpen, openModal, closeModal: closeModalBase } = useModal();

  function closeModal() {
    closeModalBase();
  }

  return (
    <NavbarTaco
      leftContent={<LeftContent />}
      menuClassName="md:hidden"
      isMenuOpen={isSidebarOpen}
      menuPosition="right"
      className=""
      onMenuClick={function noRefCheck() {
        layoutDispatch({ type: 'toggleSidebar' });
      }}
    >
      <Modal
        isOpen={isModalOpen}
        closeModal={closeModal}
        ariaHideApp={false}
        closeIcon="x"
        className="w-[600px]"
      >
        <CreatePipelineForm />
      </Modal>

      <div className="flex justify-end gap-2">
        <Button size="sm" text="New pipeline" onClick={openModal} />
      </div>
    </NavbarTaco>
  );
};

function LeftContent() {
  // TODO (hub33k): change it based on route
  return (
    <>
      <div className="flex items-center justify-center gap-2">
        <h2 className="text-2xl font-bold text-neutral-500">Workflows</h2>

        <Icon iconName="help-circle" className="font-bold text-primary-500" />
      </div>
    </>
  );
}
