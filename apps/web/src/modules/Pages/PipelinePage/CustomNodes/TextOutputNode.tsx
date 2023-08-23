import React from 'react';
interface TextOutputNodeProps {}

export const TextOutputNode: React.FC<TextOutputNodeProps> = () => {
  return <textarea value="OUTPUT" />;
};
