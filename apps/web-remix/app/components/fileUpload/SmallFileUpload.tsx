import React, { useRef } from 'react';

import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

interface SmallFileUploadProps extends Omit<ButtonProps, 'onChange'> {
  disabled?: boolean;
  onChange?: (
    file: File | null,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => void;
}

export const SmallFileUpload = ({
  className,
  children,
  disabled,
  onClick,
  onChange,
  ...rest
}: SmallFileUploadProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const selectFiles = (e: React.MouseEvent<HTMLButtonElement>) => {
    inputRef.current?.click();
    onClick?.(e);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    const file = files?.[0] ?? null;

    onChange?.(file, e);
  };

  return (
    <div className={cn('', className)}>
      <input
        type="file"
        multiple={false}
        ref={inputRef}
        disabled={disabled}
        hidden
        onChange={onFileChange}
      />
      <Button
        onClick={selectFiles}
        variant="outline"
        disabled={disabled}
        isFluid
        {...rest}
      >
        {children}
      </Button>
    </div>
  );
};
