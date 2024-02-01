import React, { PropsWithChildren } from "react";
import classNames from "classnames";
interface ChatbotSectionHeaderProps {
  className?: string;
}

export const ChatbotSectionHeader: React.FC<
  PropsWithChildren<ChatbotSectionHeaderProps>
> = ({ children, className }) => {
  return (
    <header
      className={classNames(
        "w-full bg-neutral-900 px-6 py-4 rounded-t-xl",
        className
      )}
    >
      {children}
    </header>
  );
};

export const ChatbotSectionHeading: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <h3 className="text-white text-sm">{children}</h3>;
};

export const ChatbotSectionHeaderParagraph: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return <p className="text-neutral-100 text-xs">{children}</p>;
};
