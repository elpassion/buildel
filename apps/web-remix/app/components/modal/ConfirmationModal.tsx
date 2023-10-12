import React from "react";
import { Modal } from "@elpassion/taco/Modal";
import { Button, Icon, ModalProps } from "@elpassion/taco";
import { IconButton } from "~/components/iconButton";
import classNames from "classnames";
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
  cancelText = "Cancel",
  confirmText = "Confirm",
  ...props
}) => {
  const handleConfirm = async () => {
    await onConfirm?.();
    props.onClose();
  };
  const handleCancel = async () => {
    await onCancel?.();
    props.onClose();
  };

  return (
    <Modal
      header={
        props.header ?? <ConfirmationModalHeader onClose={props.onClose} />
      }
      className={classNames("max-w-[500px] min-w-[300px] mx-2", className)}
      {...props}
    >
      {children}

      <div className="flex gap-2 justify-end">
        <Button size="md" type="button" variant="filled" onClick={handleCancel}>
          {cancelText}
        </Button>
        <Button
          size="md"
          type="submit"
          variant="ghost"
          hierarchy="destructive"
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

interface ConfirmationModalHeaderProps {
  onClose: () => void;
}

export function ConfirmationModalHeader({
  onClose,
}: ConfirmationModalHeaderProps) {
  return (
    <header className="flex justify-between gap-2 items-center">
      <h3 className="text-white font-medium text-xl">Are you sure?</h3>
      <IconButton
        aria-label="Close"
        size="sm"
        variant="outlined"
        icon={<Icon iconName="x" />}
        onClick={onClose}
      />
    </header>
  );
}
