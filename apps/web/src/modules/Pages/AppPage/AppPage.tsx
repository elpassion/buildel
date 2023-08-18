import { AppClient } from './AppClient';

interface AppPageProps {
  params: {
    id: string;
  };
}

export const AppPage = ({ params }: AppPageProps) => {
  return (
    <>
      <AppClient id={params.id} />
    </>
  );
};
