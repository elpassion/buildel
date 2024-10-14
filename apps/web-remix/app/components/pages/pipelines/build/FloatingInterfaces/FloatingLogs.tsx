import React from 'react';
import { Logs } from 'lucide-react';

import { IconButton, IconButtonProps } from '~/components/iconButton';

export function FloatingLogsButton({
  disabled,
  ...props
}: Omit<IconButtonProps, 'icon'>) {
  return (
    <IconButton
      disabled={disabled}
      icon={<Logs />}
      {...props}
      variant="outline"
      size="sm"
      title="Logs"
    />
  );
}
