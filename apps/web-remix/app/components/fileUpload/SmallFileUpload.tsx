import React, { useRef } from 'react';

import type { ButtonProps } from '~/components/ui/button';
import { Button } from '~/components/ui/button';
import { useMergedRefs } from '~/hooks/useMergeRefs';
import { cn } from '~/utils/cn';

export interface SmallFileUploadProps
  extends Omit<ButtonProps, 'onChange' | 'onBlur' | 'onFocus'> {
  disabled?: boolean;
  onChange?: (
    e: React.ChangeEvent<HTMLInputElement>,
    file: File | null,
  ) => void;
  ref?: React.Ref<HTMLInputElement> | null;
  wrapperClassName?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  accept?: string;
}

export const SmallFileUpload = ({
  className,
  wrapperClassName,
  children,
  disabled,
  onClick,
  onChange,
  onBlur,
  onFocus,
  name,
  ref,
  accept,
  value,
  defaultValue,
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

    onChange?.(e, file);
  };

  const refs = useMergedRefs(inputRef, ref);

  return (
    <div className={cn('w-fit', wrapperClassName)}>
      <input
        hidden
        accept={accept}
        name={name}
        type="file"
        multiple={false}
        defaultValue={defaultValue}
        value={value}
        //@ts-ignore
        ref={refs}
        disabled={disabled}
        onChange={onFileChange}
        onBlur={onBlur}
        onFocus={onFocus}
      />
      <Button
        onClick={selectFiles}
        variant="outline"
        disabled={disabled}
        isFluid
        className={className}
        type="button"
        {...rest}
      >
        {children}
      </Button>
    </div>
  );
};
