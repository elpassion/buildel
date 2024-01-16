import { PropsWithChildren } from "react";

export function Section({ children }: PropsWithChildren) {
  return <section className="text-white">{children}</section>;
}

export function SectionHeading({ children }: PropsWithChildren) {
  return <h2 className="text-lg mb-4">{children}</h2>;
}

export function SectionContent({ children }: PropsWithChildren) {
  return (
    <div className="bg-neutral-800 rounded-lg p-4 flex justify-between items-center gap-3 max-w-[400px]">
      {children}
    </div>
  );
}
