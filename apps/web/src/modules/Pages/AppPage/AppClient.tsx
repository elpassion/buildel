'use client';

interface AppClientProps {
  id: string;
}

export const AppClient = ({ id }: AppClientProps) => {
  return (
    <>
      <h1 className="text-2xl">App page {id}</h1>

      <div className="mb-4" />

      <div>
        <h2>App</h2>
      </div>
    </>
  );
};
