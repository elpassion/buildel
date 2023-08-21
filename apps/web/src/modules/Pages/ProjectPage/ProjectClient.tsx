'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { AppsApi } from '~/modules/Api';
import { ROUTES } from '~/modules/Config';
import { CreateAppForm } from './components';

const appsApi = new AppsApi();

interface ProjectClientProps {
  id: string;
}

export const ProjectClient = ({ id }: ProjectClientProps) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['apps'],
    queryFn: () => appsApi.getAll(),
  });

  const apps = data?.data ?? [];

  return (
    <>
      <h1 className="text-2xl">Project page {id}</h1>

      <div className="mb-4" />

      <div>
        <h2>Apps</h2>

        <div className="mb-4" />

        <div>
          <CreateAppForm />
        </div>

        {/* TODO (hub33k): extract to separate component */}
        {isLoading ? (
          <p className="animate-spins my-4">Loading apps. Please stand by</p>
        ) : (
          <>
            <div className="mb-4" />

            <ul>
              {apps.map((app) => {
                return (
                  <li key={app.id}>
                    <Link href={ROUTES.PIPELINE(app.id)}>{app.name}</Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </>
  );
};
