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

    const { data: content } = await knowledgeBaseApi.getTemporaryChunk(
      params.uuid,
    );

    return json({ content });
  })(args);
}

export default function ChunkPage() {
  const { content } = useLoaderData<typeof loader>();
  const { copy, isCopied } = useCopyToClipboard(content.content);
  const handleDownload = useDownloadFile(content.content, `${content.id}.txt`);

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

      <ChatMarkdown>{content.content}</ChatMarkdown>
    </main>
  );
}
