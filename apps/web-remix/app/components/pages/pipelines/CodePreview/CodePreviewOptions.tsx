import React, { useMemo, useRef, useState } from "react";
import type { MenuInfo } from "rc-menu/es/interface";
import { useOnClickOutside } from "usehooks-ts";
import { Icon } from "@elpassion/taco";
import { MenuClient } from "~/components/menu/Menu.client";
import { MenuItem } from "~/components/menu/MenuItem";
import { CopyCodeButton } from "~/components/actionButtons/CopyCodeButton";
import { CodePreviewWrapper } from "./CodePreviewWrapper";
import { ClientOnly } from "remix-utils/client-only";

interface CodePreviewOptionsProps {
  options: {
    id: number;
    framework: string;
    value: string;
    height: number;
    language?: string;
  }[];
}

export const CodePreviewOptions: React.FC<CodePreviewOptionsProps> = ({
  options,
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [activeKey, setActiveKey] = useState(options[0].id.toString());

  const handleShow = () => {
    setShowMenu(true);
  };
  const handleClose = () => {
    setShowMenu(false);
  };
  const onChange = (menu: MenuInfo) => {
    setActiveKey(menu.key);
    handleClose();
  };

  const activeOption = useMemo(() => {
    return options.find((opt) => opt.id.toString() === activeKey);
  }, [activeKey, options]);

  useOnClickOutside(wrapperRef, handleClose);

  return (
    <CodePreviewWrapper
      language={activeOption?.language ?? "typescript"}
      value={activeOption?.value ?? ""}
      height={activeOption?.height ?? 60}
    >
      {() => (
        <>
          <div className="relative w-fit" ref={wrapperRef}>
            <ClientOnly>
              {() => (
                <MenuClient
                  hidden={!showMenu}
                  activeKey={activeKey}
                  className="w-[200px] absolute z-10 -top-10 right-0"
                  onClick={onChange}
                >
                  {options.map((option) => {
                    return (
                      <MenuItem key={`${option.id}`}>
                        {option.framework}
                      </MenuItem>
                    );
                  })}
                </MenuClient>
              )}
            </ClientOnly>

            <button
              onClick={handleShow}
              className="flex gap-1 items-center text-neutral-300 px-2 py-1 text-sm"
            >
              <span>{activeOption?.framework}</span>
              <Icon iconName="chevron-down" />
            </button>
          </div>

          <CopyCodeButton value={activeOption?.value ?? ""} />
        </>
      )}
    </CodePreviewWrapper>
  );
};
