import { useRef, useState } from 'react';

interface UseYoutubeVideoProps {
  name: string;
  url: string;
}

export const useYoutubeVideo = ({ name, url }: UseYoutubeVideoProps) => {
  const [isPaused, setIsPaused] = useState(true);
  const player = useRef<YT.Player>(null);

  const createPlayer = () => {
    player.current = new window.YT.Player(buildPlayerId(name), {
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

  return { playVideo, id: buildPlayerId(name), src: buildYTUrl(url), isPaused };
};

function buildPlayerId(name: string) {
  return `youtube-player-${name}`;
}

function buildYTUrl(url: string) {
  return (
    url.replace('watch?v=', 'embed/') +
    '?autoplay=0&mute=1&controls=1&playsinline=1&showinfo=0&rel=0&modestbranding=1&enablejsapi=1&widgetid=3'
  );
}
