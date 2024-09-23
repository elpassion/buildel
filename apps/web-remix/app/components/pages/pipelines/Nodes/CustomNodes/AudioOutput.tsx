import React, { useEffect, useRef } from 'react';

import type { IEvent } from '~/components/pages/pipelines/RunPipelineProvider';

interface AudioOutputProps {
  events: IEvent[];
}

export const AudioOutput: React.FC<AudioOutputProps> = ({ events }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaSourceRef = useRef<MediaSource | null>(null);
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const lastIndex = useRef<number>(-1);

  useEffect(() => {
    if (!audioRef.current) return;

    const mediaSource = new MediaSource();
    mediaSourceRef.current = mediaSource;

    audioRef.current.src = URL.createObjectURL(mediaSource);

    const onSourceOpen = () => {
      if (!mediaSourceRef.current) return;

      const sourceBuffer = mediaSourceRef.current.addSourceBuffer('audio/mpeg');
      sourceBufferRef.current = sourceBuffer;

      // sourceBuffer.addEventListener('updateend', () => {
      //   if (
      //     mediaSourceRef.current &&
      //     mediaSourceRef.current.readyState === 'open'
      //   ) {
      //     console.log('CLOSE AA');
      //   }
      // });

      processAudioEvents(events);
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);

    return () => {
      mediaSource.removeEventListener('sourceopen', onSourceOpen);
    };
  }, []);

  const processAudioEvents = (audioEvents: IEvent[]) => {
    if (!sourceBufferRef.current || !mediaSourceRef.current) return;

    for (
      let index = lastIndex.current + 1;
      index < audioEvents.length;
      index++
    ) {
      const event = audioEvents[index];
      const audioChunk = new Uint8Array(event.payload);

      if (
        !sourceBufferRef.current.updating &&
        mediaSourceRef.current.readyState === 'open'
      ) {
        try {
          sourceBufferRef.current.appendBuffer(audioChunk);
          lastIndex.current = index;
        } catch (error) {
          console.error('Error appending buffer:', error);
        }
      }
    }
  };

  useEffect(() => {
    processAudioEvents(events);

    return () => {
      if (sourceBufferRef.current) {
        sourceBufferRef.current.abort();
      }
    };
  }, [events]);

  return (
    <div className="flex flex-col items-start gap-1">
      <div>
        <audio ref={audioRef} controls autoPlay />
      </div>
    </div>
  );
};
