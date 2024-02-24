import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { NavSidebarContext } from "~/components/sidebar/NavSidebar";
import Modal from "react-modal";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  Modal.setAppElement("div");
  return (
    <div id="_root">
      <NavSidebarContext.Provider
        value={{
          isOpen: false,
          collapsed: true,
          toggleCollapse: () => null,
          openSidebar: () => null,
          closeSidebar: () => null,
        }}
      >
        {children}
      </NavSidebarContext.Provider>
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from "@testing-library/react";
export { customRender as render };
