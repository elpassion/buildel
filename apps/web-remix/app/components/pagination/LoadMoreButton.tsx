import React from 'react';

import { cn } from '~/utils/cn';

interface LoadMoreButtonProps {
  onClick: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
  className?: string;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  isFetching,
  onClick,
  hasNextPage,
  className,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!hasNextPage}
      className={cn(
        'text-neutral-200 disabled:text-neutral-400 text-sm',
        className,
      )}
    >
      {isFetching ? 'Fetching...' : hasNextPage ? 'Fetch' : 'No more data'}
    </button>
  );
};
