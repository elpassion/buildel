import React from "react";
interface LoadMoreButtonProps {
  onClick: () => void;
  hasNextPage: boolean;
  isFetching: boolean;
}

export const LoadMoreButton: React.FC<LoadMoreButtonProps> = ({
  isFetching,
  onClick,
  hasNextPage,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={!hasNextPage}
      className="text-neutral-200 disabled:text-neutral-400 text-sm"
    >
      {isFetching ? "Fetching..." : hasNextPage ? "Fetch" : "No more data"}
    </button>
  );
};
