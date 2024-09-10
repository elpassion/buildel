import { cn } from "~/utils/cn";
import { ChatWrapperProps } from "~/components/chat/chat.types.ts";

export const ChatWrapper = ({
  children,
  className,
  ...rest
}: ChatWrapperProps) => {
  return (
    <div
      className={cn(
        "w-full rounded-lg flex flex-col gap-2 h-full py-3 lg:py-4 relative",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
};
