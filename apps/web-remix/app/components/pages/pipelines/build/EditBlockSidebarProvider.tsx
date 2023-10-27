import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import { IBlockConfig } from "../pipeline.types";

interface IEditBlockSidebarContext {
  editableBlock: IBlockConfig | null;
  openSidebar: (block: IBlockConfig) => void;
  closeSidebar: () => void;
}
export const EditBlockSidebarContext =
  createContext<IEditBlockSidebarContext | null>(null);

interface EditBlockSidebarProviderProps extends PropsWithChildren {}

export const EditBlockSidebarProvider: React.FC<
  EditBlockSidebarProviderProps
> = ({ children }) => {
  const [editableBlock, setEditableBlock] = useState<IBlockConfig | null>(null);

  const handleOpenSidebar = (block: IBlockConfig) => {
    setEditableBlock(block);
  };
  const handleCloseSidebar = () => {
    setEditableBlock(null);
  };
  return (
    <EditBlockSidebarContext.Provider
      value={{
        editableBlock,
        openSidebar: handleOpenSidebar,
        closeSidebar: handleCloseSidebar,
      }}
    >
      {children}
    </EditBlockSidebarContext.Provider>
  );
};

export const useEditBlockSidebar = () => {
  const ctx = useContext(EditBlockSidebarContext);

  if (!ctx)
    throw new Error(
      "useEditBlockSidebar can be used only inside EditBlockSidebarProvider"
    );

  return ctx;
};
