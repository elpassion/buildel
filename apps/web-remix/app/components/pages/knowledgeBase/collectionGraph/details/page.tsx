import React from 'react';
import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { metaWithDefaults } from '~/utils/metadata';

import { NodePreview } from './components/NodePreview';
import type { loader } from './loader.server';

export function KnowledgeBaseGraphDetails() {
  const { details, collectionName, searchParams } =
    useLoaderData<typeof loader>();

  return (
    <NodePreview
      details={details}
      collectionName={collectionName}
      searchParams={searchParams}
    />
  );
}

export const meta: MetaFunction<typeof loader> = metaWithDefaults(
  ({ data }) => {
    return [
      {
        title: `${data?.collectionName} Graph Details`,
      },
    ];
  },
);
