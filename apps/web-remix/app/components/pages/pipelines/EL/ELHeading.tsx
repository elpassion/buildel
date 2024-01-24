import React, { PropsWithChildren } from "react";
import { Icon } from "@elpassion/taco";

export const ELHeading: React.FC = () => {
  return (
    <h3 className="flex gap-2 text-white">
      <Icon size="xs" iconName="two-layers" />
      <div className="text-white">Ask EL</div>
    </h3>
  );
};
