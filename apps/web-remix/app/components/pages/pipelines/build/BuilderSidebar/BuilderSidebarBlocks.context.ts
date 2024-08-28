import React from 'react';

export interface IBlockSearchContext {
  searchValue: string;
}
export const BlocksSearchContext = React.createContext<
  IBlockSearchContext | undefined
>(undefined);

export const useBlocksSearch = () => {
  const context = React.useContext(BlocksSearchContext);
  if (context === undefined) {
    throw new Error('useBlockSearch must be used within a BlockSearch');
  }
  return context;
};
