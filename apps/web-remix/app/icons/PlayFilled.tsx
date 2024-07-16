import React from 'react';

import type { IconProps } from '~/icons/icons.types';

export const PlayFilled: React.FC<IconProps> = ({ className }) => {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.068 1.59534C3.01092 1.62977 2.9631 1.6776 2.92867 1.73468C2.882 1.82201 2.88 2.07068 2.88 7.98734V14.0221C2.88 14.1052 2.90409 14.1864 2.94934 14.256C3.086 14.4673 3.30334 14.5387 3.5 14.4367C3.64134 14.3633 12.9153 8.39801 12.9827 8.33668C13.1993 8.14001 13.1967 7.81468 12.9773 7.65068C12.8307 7.54201 3.56 1.59401 3.50267 1.57201C3.39267 1.53001 3.16734 1.54268 3.068 1.59534Z"
        fill="currentColor"
      />
    </svg>
  );
};
