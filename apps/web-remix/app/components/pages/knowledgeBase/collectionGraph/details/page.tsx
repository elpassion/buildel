import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { NodePreview } from './components/NodePreview';
import type { loader } from './loader.server';

export function KnowledgeBaseGraphDetails() {
  const { details, collectionName } = useLoaderData<typeof loader>();

  return <NodePreview details={details} collectionName={collectionName} />;
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${data?.collectionName} Graph Details`,
    },
  ];
};
