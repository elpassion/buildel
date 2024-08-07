import React from 'react';
import { Layers2 } from 'lucide-react';

import { useEl } from '~/components/pages/pipelines/EL/ELProvider';

export const ELMenuItem: React.FC = () => {
  const { show } = useEl();
  return (
    <div
      key="EL"
      className="py-1 bg-secondary-600 flex gap-1 items-center justify-center cursor-pointer hover:bg-secondary-700 text-white"
      onClick={show}
    >
      <Layers2 className="w-4 h-4" />
      <p className="text-white">EL</p>
    </div>
  );
};
