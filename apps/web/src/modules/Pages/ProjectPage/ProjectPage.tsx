import { AppsApi } from '~/modules/Api';
import { ProjectClient } from './ProjectClient';

const appsApi = new AppsApi();

async function getApps() {
  const res = await appsApi.getAll();
  return res.data;
}

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export const ProjectPage = async ({ params }: ProjectPageProps) => {
  const apps = await getApps();

  return (
    <>
      <ProjectClient id={params.id} apps={apps} />
    </>
  );
};
