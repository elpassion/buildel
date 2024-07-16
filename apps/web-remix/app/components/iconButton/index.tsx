import React, { useMemo } from 'react';
import type { IconButtonProps as TacoIconButtonProps } from '@elpassion/taco';
import { IconButton as TacoIconButton } from '@elpassion/taco';
import classNames from 'classnames';

export type IconButtonProps = TacoIconButtonProps & {
  onlyIcon?: boolean;
};
export const IconButton: React.FC<IconButtonProps> = ({
  onlyIcon = false,
  className,
  ...props
}) => {
  const additionalClassNames = useMemo(() => {
    if (onlyIcon) {
      return '!p-0 !bg-transparent !w-fit !h-fit !border-none !text-neutral-200 hover:!text-primary-500 disabled:!text-neutral-400 transition';
    }
    return '';
  }, [onlyIcon]);

  return (
    <TacoIconButton
      {...props}
      className={classNames(additionalClassNames, className)}
    />
  );
};
