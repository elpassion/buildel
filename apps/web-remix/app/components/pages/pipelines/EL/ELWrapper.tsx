import React, { PropsWithChildren } from "react";
interface ELWrapperProps {}

export const ELWrapper: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="w-full w-[450px] bg-neutral-900 rounded-lg py-2 px-3 border border-neutral-800">
      {children}
    </div>
  );
};
