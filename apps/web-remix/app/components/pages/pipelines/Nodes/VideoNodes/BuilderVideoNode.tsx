import React, { useRef, useState } from 'react';
import { useReactFlow } from '@xyflow/react';

import {
  CustomNode,
  CustomNodeHeader,
} from '~/components/pages/pipelines/Nodes/CustomNodes/CustomNode';
import { VideoNodeBody } from '~/components/pages/pipelines/Nodes/VideoNodes/VideoNodeBody';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { Button } from '~/components/ui/button';
import { cn } from '~/utils/cn';

import type { VideoNodeProps } from './VideoNode';
import { VideoNode } from './VideoNode';

export function BuilderVideoNode({
  data,
  selected,
  disabled,
  id,
  className,
  ...rest
}: VideoNodeProps) {
  const url = data.opts['url'];
  const { updateNode } = useReactFlow();
  const { status: runStatus } = useRunPipeline();
  const isDisabled = runStatus !== 'idle' || disabled;

  const update = (opts: Record<string, any>) => {
    updateNode(id ?? data.name, {
      data: {
        ...data,
        opts: { ...data.opts, ...opts },
      },
    });
  };

  if (!url) {
    return (
      <CustomNode
        disabled={isDisabled}
        data={data}
        selected={selected}
        className={className}
        {...rest}
      >
        <CustomNodeHeader data={data} />

        <div className="px-2 py-4 nodrag">
          <VideoNodeBody data={data} disabled={disabled} onSubmit={update} />
        </div>
      </CustomNode>
    );
  }

  return (
    <VideoPreview
      data={data}
      url={url}
      disabled={isDisabled}
      selected={selected}
      className={className}
      {...rest}
    />
  );
}

function VideoPreview({
  data,
  selected,
  disabled,
  className,
  url,
  ...rest
}: VideoNodeProps & { url: string }) {
  const [isPaused, setIsPaused] = useState(true);
  const player = useRef<YT.Player>(null);

  const createPlayer = () => {
    player.current = new window.YT.Player(buildPlayerId(data.name), {
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
        onError: (err: unknown) => console.warn(err),
      },
    });
  };

  const onPlayerStateChange = (event: { data: number }) => {
    if (event.data === 1) {
      setIsPaused(false);
    } else if (event.data === 2 || event.data === 0 || event.data === -1) {
      setIsPaused(true);
    }
  };

  const onPlayerReady = () => {
    playVideo();
  };

  const playVideo = () => {
    if (!player.current) createPlayer();

    if (player.current) {
      player.current.playVideo();
    }
  };

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
          id={buildPlayerId(data.name)}
          src={buildYTUrl(url)}
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

function buildPlayerId(name: string) {
  return `youtube-player-${name}`;
}

function buildYTUrl(url: string) {
  return (
    url.replace('watch?v=', 'embed/') +
    '?autoplay=0&mute=1&controls=1&playsinline=1&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&widgetid=3'
  );
}
