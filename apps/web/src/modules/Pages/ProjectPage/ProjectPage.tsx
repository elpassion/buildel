import { ProjectClient } from './ProjectClient';

interface ProjectPageProps {
  params: {
    id: string;
  };
}

export const ProjectPage = async ({ params }: ProjectPageProps) => {
  return (
    <>
      <ProjectClient id={params.id} />
    </>
  );
};
