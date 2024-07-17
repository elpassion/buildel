import React from 'react';
import type { ModalProps } from '@elpassion/taco';
import { Modal } from '@elpassion/taco/Modal';
import classNames from 'classnames';

import { Button } from '~/components/ui/button';

export interface ConfirmationModalProps extends ModalProps {
  onConfirm?: () => Promise<void>;
  onCancel?: () => Promise<void>;
  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  children,
  className,
  onConfirm,
  onCancel,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  onClose,
  ...props
}) => {
  const handleConfirm = async () => {
    await onConfirm?.();
    onClose();
  };
  const handleCancel = async () => {
    await onCancel?.();
    onClose();
  };

  return (
    <Modal
      header={props.header ?? <ConfirmationModalHeader />}
      closeButtonProps={{ iconName: 'x', 'aria-label': 'Close' }}
      className={classNames('max-w-[500px] min-w-[300px] mx-2', className)}
      onClose={onClose}
      {...props}
    >
      {children}

      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          type="button"
          variant="outline"
          onClick={handleCancel}
        >
          {cancelText}
        </Button>
        <Button
          type="submit"
          size="sm"
          variant="destructive"
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export function ConfirmationModalHeader() {
  return (
    <header className="flex justify-between gap-2 items-center">
      <h3 className="text-white font-medium text-xl">Are you sure?</h3>
    </header>
  );
}
