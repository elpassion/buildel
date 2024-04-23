import React, { PropsWithChildren } from "react";
import { Icon } from "@elpassion/taco";
import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from "~/components/dropdown/Dropdown";

export const SearchParams: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <Dropdown>
      <SearchParamsTrigger />

      <DropdownPopup className="min-w-[250px] z-[11] bg-neutral-850 border border-neutral-800 rounded-lg overflow-hidden p-2 lg:min-w-[350px]">
        {children}
      </DropdownPopup>
    </Dropdown>
  );
};

function SearchParamsTrigger() {
  return (
    <DropdownTrigger
      type="button"
      aria-label="Open search params editor"
      className="bg-neutral-800 text-neutral-100 w-10 h-10 rounded-lg text-sm flex items-center justify-center hover:bg-neutral-900 transition"
    >
      <Icon iconName="settings" />
    </DropdownTrigger>
  );
}
