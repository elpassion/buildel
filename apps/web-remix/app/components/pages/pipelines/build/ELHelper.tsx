import React from "react";
import classNames from "classnames";
import { Icon } from "@elpassion/taco";
import { ELWrapper } from "~/components/pages/pipelines/EL/ELWrapper";
import { useEl } from "~/components/pages/pipelines/EL/ELProvider";
import { ELHeading } from "~/components/pages/pipelines/EL/ELHeading";
import { ElChat } from "~/components/pages/pipelines/EL/ElChat";

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
      <ELWrapper>
        <header className="flex justify-between gap-2 items-center mb-3">
          <ELHeading />

          <button onClick={hide} className="text-neutral-200 hover:text-white">
            <Icon iconName="x" />
          </button>
        </header>

        <div className="w-full">
          <ElChat />
        </div>
      </ELWrapper>
    </div>
  );
};
