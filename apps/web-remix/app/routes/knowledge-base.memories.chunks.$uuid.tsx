import React from 'react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

import { KnowledgeBaseApi } from '~/api/knowledgeBase/KnowledgeBaseApi';
import { ChatMarkdown } from '~/components/chat/ChatMarkdown';
import { Button } from '~/components/ui/button';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useDownloadFile } from '~/hooks/useDownloadFile';
import { loaderBuilder } from '~/utils.server';
import { assert } from '~/utils/assert';
import { cn } from '~/utils/cn';

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ params }, { fetch }) => {
    assert(params.uuid, 'Missing uuid');

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const { data: chunk } = await knowledgeBaseApi.getTemporaryChunk(
      params.uuid,
    );

    return json({ chunk });
  })(args);
}

export default function ChunkPage() {
  const { chunk } = useLoaderData<typeof loader>();
  const { copy, isCopied } = useCopyToClipboard(chunk.content);
  const handleDownload = useDownloadFile(chunk.content, `${chunk.id}.txt`);

  return (
    <main className="max-w-screen-lg mx-auto mt-8 px-6">
      <header className="flex justify-end gap-2 items-center mb-4">
        <Button size="xxs" variant="ghost" onClick={handleDownload}>
          Download
        </Button>

        <Button
          size="xxs"
          variant="ghost"
          className={cn({ 'text-green-500': isCopied })}
          onClick={copy}
        >
          {isCopied ? 'Copied' : 'Copy'}
        </Button>
      </header>

      <div
        className={cn('flex flex-wrap gap-1 mb-2', {
          hidden: chunk.keywords.length === 0,
        })}
      >
        <span className="text-sm text-muted-foreground">Keywords:</span>
        {chunk.keywords.map((keyword) => (
          <p
            key={keyword}
            className="px-2 py-0.5 rounded-xl border border-input text-xs text-foreground"
          >
            {keyword}
          </p>
        ))}
      </div>

      <ChatMarkdown>{chunk.content}</ChatMarkdown>

      <div className="mt-2 flex justify-between items-center gap-2 flex-wrap">
        <h1
          className="text-muted-foreground text-sm truncate"
          title={chunk.file_name}
        >
          {chunk.file_name}
        </h1>

        <p className="text-sm text-muted-foreground shrink-0">
          Page: {chunk.pages.join(', ')}
        </p>
      </div>
    </main>
  );
}
