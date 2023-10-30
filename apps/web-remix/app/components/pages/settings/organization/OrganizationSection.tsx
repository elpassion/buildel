import React, { PropsWithChildren } from "react";

export function OrganizationSection({ children }: PropsWithChildren) {
  return <section className="text-white">{children}</section>;
}

export function OrganizationSectionHeading({ children }: PropsWithChildren) {
  return <h2 className="text-lg mb-4">{children}</h2>;
}

export function OrganizationSectionContent({ children }: PropsWithChildren) {
  return (
    <div className="bg-neutral-800 rounded-lg p-4 flex justify-between items-center gap-3 max-w-[400px]">
      {children}
    </div>
  );
}
