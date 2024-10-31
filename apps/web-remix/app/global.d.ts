export {};

declare global {
  interface Window {
    YT: YT;
    onYouTubeIframeAPIReady: () => void;
  }

  namespace YT {
    class Player {
      constructor(elementId: string, options: PlayerOptions);
      playVideo(): void;
      pauseVideo(): void;
      stopVideo(): void;
      destroy(): void;
    }

    interface PlayerOptions {
      videoId?: string;
      height?: string;
      width?: string;
      events?: {
        onReady?: (event: PlayerEvent) => void;
        onStateChange?: (event: PlayerEvent) => void;
        onError?: (err: unknown) => void;
      };
    }

    interface PlayerEvent {
      target: Player;
      data: number;
    }
  }
}
