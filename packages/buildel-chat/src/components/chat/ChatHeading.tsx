import { ChatHeadingProps } from "~/components/chat/chat.types.ts";
import { cn } from "~/utils/cn.ts";

export const ChatHeading = ({
  children,
  className,
  ...rest
}: ChatHeadingProps) => {
  return (
    <h3
      className={cn("flex gap-2 items-center text-foreground", className)}
      {...rest}
    >
      {children}
    </h3>
  );
};
