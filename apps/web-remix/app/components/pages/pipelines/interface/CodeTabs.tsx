import React, { useEffect, useMemo, useRef, useState } from "react";
import { CodePreview } from "~/components/pages/pipelines/interface/CodePreview";
import { Menu } from "~/components/menu/Menu";
import { MenuItem } from "~/components/menu/MenuItem";
import { MenuInfo } from "rc-menu/es/interface";
import { Icon } from "@elpassion/taco";
import { useOnClickOutside } from "usehooks-ts";

interface CodeTabsProps {
  options: { id: number; framework: string; value: string; height: number }[];
}

export const CodeTabs: React.FC<CodeTabsProps> = ({ options }) => {
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
    <div>
      <div className="flex gap-1 justify-end">
        <div className="relative w-fit" ref={wrapperRef}>
          <Menu
            hidden={!showMenu}
            activeKey={activeKey}
            className="w-[200px] absolute z-10 -top-10 right-0"
            onClick={onChange}
          >
            {options.map((option) => {
              return (
                <MenuItem key={`${option.id}`}>{option.framework}</MenuItem>
              );
            })}
          </Menu>

          <button
            onClick={handleShow}
            className="flex gap-1 items-center text-neutral-100 px-2 py-1 text-sm"
          >
            <span>{activeOption?.framework}</span>
            <Icon iconName="chevron-down" />
          </button>
        </div>
      </div>

      <CodePreview
        language="typescript"
        value={activeOption?.value ?? ""}
        height={activeOption?.height ?? 35}
      />
    </div>
  );
};
