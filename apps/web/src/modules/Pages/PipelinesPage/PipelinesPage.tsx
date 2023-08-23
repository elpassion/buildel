import { PipelinesClient } from './PipelinesClient';
import { PipelinesNavbar } from './PipelinesNavbar';

export const PipelinesPage = () => {
  return (
    <>
      <PipelinesNavbar />

      <div className="p-8">
        <PipelinesClient />
      </div>
    </>
  );
};
