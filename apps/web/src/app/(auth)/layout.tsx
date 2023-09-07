import { PropsWithChildren } from 'react';

export default function AuthLayout({ children }: PropsWithChildren) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-neutral-50 p-4">
      <section className="w-full max-w-lg rounded bg-white">{children}</section>
    </main>
  );
}
