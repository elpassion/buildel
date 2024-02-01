import React, { PropsWithChildren } from "react";
import classNames from "classnames";
interface ChatbotSectionWrapperProps {
  className?: string;
}

export const ChatbotSectionWrapper: React.FC<
  PropsWithChildren<ChatbotSectionWrapperProps>
> = ({ className, children }) => {
  return (
    <article
      className={classNames(
        "bg-transparent border border-neutral-800 rounded-xl",
        className
      )}
    >
      {children}
    </article>
  );
};
