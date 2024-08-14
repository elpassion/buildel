import type { MetaFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { metaWithDefaults } from '~/utils/metadata';

import { KnowledgeBaseSearchForm } from './KnowledgeBaseSearchForm';
import { KnowledgeBaseSearchList } from './KnowledgeBaseSearchList';
import type { loader } from './loader.server';

export function KnowledgeBaseSearch() {
  const { chunks, metadata, queryMetadata, fileList } = useLoaderData<typeof loader>();

  return (
    <div className="p-1">
      <p className="text-sm text-muted-foreground mb-2">
        Total tokens: {metadata.total_tokens}
      </p>

      <KnowledgeBaseSearchForm defaultValue={queryMetadata} fileList={fileList} />

      <div className="mt-4">
        <KnowledgeBaseSearchList items={chunks} query={queryMetadata.query} />
      </div>
    </div>
  );
}

export const meta: MetaFunction = metaWithDefaults(() => {
  return [
    {
      title: 'Knowledge Base Search',
    },
  ];
});
