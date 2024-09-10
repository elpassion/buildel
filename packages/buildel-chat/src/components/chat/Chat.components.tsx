import { useMemo } from "react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "~/components/ui/carousel";
import { cn } from "~/utils/cn";
import {
  ChatGeneratingAnimationProps,
  ChatHeaderProps,
  ChatMessagesWrapperProps,
  ChatStatusProps,
  IntroPanelProps,
  SuggestedMessageProps,
  SuggestedMessagesProps,
} from "./chat.types";

export const ChatHeader = ({
  children,
  className,
  ...rest
}: ChatHeaderProps) => {
  return (
    <header
      className={cn(
        "flex justify-between gap-2 items-center px-3 mb-4 lg:px-4 lg:py-2",
        className,
      )}
      {...rest}
    >
      {children}
    </header>
  );
};

export const ChatMessagesWrapper = ({
  children,
  className,
  ...rest
}: ChatMessagesWrapperProps) => {
  return (
    <div
      className={cn(
        "w-full rounded-lg pt-2 grow overflow-hidden relative mx-auto",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};

export const ChatGeneratingAnimation = ({
  messages,
  isGenerating,
  size,
  className,
  ...rest
}: ChatGeneratingAnimationProps) => {
  const renderMessage = () => {
    if (!messages.length) return;
    const lastMessage = messages[messages.length - 1];

    if (
      lastMessage.role === "user" ||
      (lastMessage.role === "ai" && !lastMessage.message.length)
    ) {
      return "Thinking...";
    }

    return "Generating...";
  };

  if (!isGenerating) return null;

  return (
    <div className={cn("max-w-[820px] mx-auto", className)} {...rest}>
      <div
        className={cn("shrink-0", {
          "w-8": size !== "sm",
          "w-7": size === "sm",
        })}
      />
      <div className={cn("flex gap-0.5 items-center pl-3 grow")}>
        <span className="text-[10px] text-muted-foreground mr-1">
          {renderMessage()}
        </span>
      </div>
    </div>
  );
};

export const ChatStatus = ({
  connectionStatus,
  className,
  ...rest
}: ChatStatusProps) => {
  const mappedStatusToText = useMemo(() => {
    switch (connectionStatus) {
      case "starting":
        return "Starting";
      case "running":
        return "Running";
      default:
        return "Not running";
    }
  }, [connectionStatus]);

  return (
    <div
      title={mappedStatusToText}
      className={cn("py-0.5 px-1 rounded flex gap-1 items-center", className)}
      {...rest}
    >
      <div
        className={cn("w-[6px] h-[6px] rounded-full ", {
          "bg-red-500": connectionStatus === "idle",
          "bg-green-500": connectionStatus === "running",
          "bg-orange-500": connectionStatus === "starting",
        })}
      />

      <span className="text-xs text-muted-foreground">
        {mappedStatusToText}
      </span>
    </div>
  );
};

export const IntroPanel = ({
  children,
  className,
  size,
  hidden,
  ...rest
}: IntroPanelProps) => {
  return (
    <article
      className={cn(
        "w-full text-center text-foreground my-[30px] max-w-[820px] mx-auto ",
        {
          "text-xl mt-6 lg:mt-12": size === "sm",
          "text-2xl mt-10 lg:mt-20": size !== "sm",
          hidden: hidden,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </article>
  );
};

export const SuggestedMessages = ({
  children,
  className,
  size,
  hidden,
  ...rest
}: SuggestedMessagesProps) => {
  return (
    <div
      className={cn(
        "flex gap-2 grow w-full pl-3 max-w-[820px] mx-auto",
        {
          "h-[120px]": size === "sm",
          "h-[160px]": size !== "sm",
          hidden: hidden,
        },
        className,
      )}
      {...rest}
    >
      <Carousel className="w-full h-full">
        <CarouselContent>{children}</CarouselContent>
      </Carousel>
    </div>
  );
};

export const SuggestedMessage = ({
  className,
  content,
  onClick,
  disabled,
  wrapperClassName,
  size,
  ...rest
}: SuggestedMessageProps) => {
  return (
    <CarouselItem
      className={cn(
        "min-w-[110px] basis-[40%] md:basis-[35%] lg:basis-[29%]",
        wrapperClassName,
      )}
    >
      <button
        disabled={disabled}
        onClick={(e) => onClick(content, e)}
        className={cn(
          "p-2 border border-input rounded-lg inline-flex justify-center items-center text-center text-sm shrink-0 transition w-full",
          {
            "h-[120px]": size === "sm",
            "h-[160px]": size !== "sm",
            "cursor-pointer hover:bg-neutral-100": !disabled,
            "opacity-70": disabled,
          },
          className,
        )}
        {...rest}
      >
        <div className="line-clamp-3 w-full" title={content}>
          {content}
        </div>
      </button>
    </CarouselItem>
  );
};
