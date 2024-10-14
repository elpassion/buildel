import React from 'react';
import { Logs } from 'lucide-react';

import { IconButton, IconButtonProps } from '~/components/iconButton';
import { cn } from '~/utils/cn';

export function FloatingLogsButton({
  disabled,
  className,
  ...props
}: Omit<IconButtonProps, 'icon'>) {
  return (
    <IconButton
      disabled={disabled}
      icon={<Logs />}
      {...props}
      variant="outline"
      size="xxs"
      title="Logs"
      className={cn('rounded', className)}
    />
  );
}
