import React from "react";
import classNames from "classnames";
import { useEl } from "~/components/pages/pipelines/EL/ELProvider";
import { Chat } from "~/components/chat/Chat";

export const ELHelper: React.FC = () => {
  const { isShown, hide } = useEl();

  return (
    <div
      className={classNames(
        "absolute top-8 z-10 right-0 transition md:right-4",
        {
          "opacity-0 pointer-events-none scale-90": !isShown,
          "opacity-100 pointer-events-auto scale-100": isShown,
        }
      )}
    >
      <Chat inputTopic="text_input_1:input" onClose={hide} />
    </div>
  );
};
