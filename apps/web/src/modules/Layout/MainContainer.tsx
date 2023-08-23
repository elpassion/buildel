import React from 'react';

interface MainContainerProps {
  children: React.ReactNode;
}

export const MainContainer = ({ children }: MainContainerProps) => {
  return (
    <main className="h-fit w-full min-w-0 flex-grow bg-neutral-50 p-8">
      <div className="mx-auto">{children}</div>
    </main>
  );
};
