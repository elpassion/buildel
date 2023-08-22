import React, { PropsWithChildren } from 'react';
import { Modal } from '@elpassion/taco/Modal';
import { Icon, IconButton } from '@elpassion/taco';
import { AddBlockForm } from '~/modules/Pages';

interface AddBlockModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  return (
    <Modal isOpen={isOpen} closeModal={onClose} ariaHideApp={false}>
      <div className="p-8">
        <div className="flex space-x-6">
          <div>
            <div className="text-xl font-medium">Add block</div>
            <div className="mt-4 text-sm text-neutral-400">
              Blocks are modules within your app that can work simultaneously.
            </div>
          </div>
          <div>
            <IconButton
              onClick={onClose}
              icon={<Icon iconName="x" />}
              variant="outlined"
              size="sm"
            />
          </div>
        </div>
        <div className="mt-8">{children}</div>
      </div>
    </Modal>
  );
};
