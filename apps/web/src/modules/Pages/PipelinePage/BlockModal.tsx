import React, { PropsWithChildren, ReactNode } from 'react';
import { Icon, IconButton } from '@elpassion/taco';
import { Modal } from '@elpassion/taco/Modal';

interface BlockModalProps extends PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  header: ReactNode;
}

export const BlockModal: React.FC<BlockModalProps> = ({
  isOpen,
  onClose,
  children,
  header,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      closeModal={onClose}
      ariaHideApp={false}
      closeIcon="x"
      className="!max-w-[640px] !p-8"
      align="left"
      modalHeader={header}
    >
      <div className="h-full !max-h-[640px] overflow-auto">{children}</div>
    </Modal>
  );
};

interface BlockModalHeaderProps {
  heading: string;
  description: string;
}
export function BlockModalHeader({
  heading,
  description,
}: BlockModalHeaderProps) {
  return (
    <div>
      <div className="text-xl font-medium">{heading}</div>
      <div className="mt-4 text-sm text-neutral-400">{description}</div>
    </div>
  );
}
