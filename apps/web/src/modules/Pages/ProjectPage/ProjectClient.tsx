'use client';

import { TApp, TBlockType } from '~/contracts';
import { CreateAppForm } from './components';

interface ProjectClientProps {
  id: string;
  apps: TApp[];
}

export const ProjectClient = ({ id, apps }: ProjectClientProps) => {
  return (
    <>
      <h1 className="text-2xl">Project page {id}</h1>

      <div className="mb-4" />

      <div>
        <h2>Apps</h2>

        <div>
          <CreateAppForm />
        </div>

        {apps.length > 0 && (
          <>
            <div className="mb-4" />

            <ul>
              {apps.map((app) => {
                return <li key={app.id}>{app.name}</li>;
              })}
            </ul>
          </>
        )}

        {/*<ul>*/}
        {/*  <li>*/}
        {/*    <Link href={ROUTES.APP('1')}>App One</Link>*/}
        {/*  </li>*/}
        {/*</ul>*/}
      </div>
    </>
  );
};
