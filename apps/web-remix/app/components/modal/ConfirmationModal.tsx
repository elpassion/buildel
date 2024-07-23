import React from 'react';

import { Button } from '~/components/ui/button';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { cn } from '~/utils/cn';

export interface ConfirmationModalProps {
  onConfirm?: () => Promise<void>;
  onCancel?: () => Promise<void>;
  confirmText?: React.ReactNode;
  cancelText?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
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
    <DialogDrawer
      open={props.isOpen}
      onOpenChange={(value) => {
        if (value) return;
        onClose();
      }}
    >
      <DialogDrawerContent
        className={cn('md:max-w-[500px] md:min-w-[300px] mx-2', className)}
      >
        <DialogDrawerHeader>
          <DialogDrawerTitle>Are you sure?</DialogDrawerTitle>
        </DialogDrawerHeader>
        <DialogDrawerBody>
          <div className="w-full mb-4">{children}</div>
        </DialogDrawerBody>

        <DialogDrawerFooter>
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
        </DialogDrawerFooter>
      </DialogDrawerContent>
    </DialogDrawer>
  );
};
