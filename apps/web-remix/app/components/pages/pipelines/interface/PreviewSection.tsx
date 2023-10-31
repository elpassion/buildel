import React, { PropsWithChildren } from "react";
import Balancer from "react-wrap-balancer";

export const PreviewSection: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <section className="border-t border-neutral-600  pt-6 pb-10">
      {children}
    </section>
  );
};

export const PreviewSectionHeader: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <header className="flex gap-2 items-center text-white mb-4">
      {children}
    </header>
  );
};

export const PreviewSectionHeading: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <h3 className="font-medium">{children}</h3>;
};

export const PreviewSectionStep: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className="bg-transparent border-2 border-secondary-400 rounded-lg w-7 h-7 flex justify-center items-center text-secondary-400 text-xs">
      {children}
    </div>
  );
};

export const PreviewSectionContent: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">{children}</div>
  );
};

export const PreviewSectionText: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <p className="text-white text-sm">
      <Balancer>{children}</Balancer>
    </p>
  );
};
