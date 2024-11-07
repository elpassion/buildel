import React from 'react';

import type { VideoNodeProps } from '~/components/pages/pipelines/Nodes/VideoNodes/VideoNode';
import { VideoNode } from '~/components/pages/pipelines/Nodes/VideoNodes/VideoNode';
import { Button } from '~/components/ui/button';
import { useYoutubeVideo } from '~/hooks/useYoutubeVideo';
import { cn } from '~/utils/cn';

export function VideoPreview({
  data,
  selected,
  disabled,
  className,
  url,
  ...rest
}: VideoNodeProps & { url: string }) {
  const { playVideo, isPaused, id, src } = useYoutubeVideo({
    name: data.name,
    url,
  });

  return (
    <VideoNode
      data={data}
      id={data.name}
      disabled={disabled}
      selected={selected}
      className={cn('hover:border-blue-700 p-1 drag', className)}
      {...rest}
    >
      <div className="relative w-full h-full overflow-hidden rounded">
        <iframe
          id={id}
          src={src}
          frameBorder="0"
          title="Youtube Video"
          width="100%"
          height="100%"
        />

        <div
          className={cn(
            'bg-black/40 w-full h-full absolute top-0 left-0 right-0 bottom-0 drag',
            { hidden: !isPaused },
          )}
        />

        <Button
          onClick={playVideo}
          className={cn(
            'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 hover:bg-red-600 py-6 px-7',
            {
              hidden: !isPaused,
            },
          )}
        >
          Play
        </Button>
      </div>
    </VideoNode>
  );
}
