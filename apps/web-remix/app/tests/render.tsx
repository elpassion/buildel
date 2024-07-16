import type { ReactElement } from "react";
import React from "react";
import { render } from "@testing-library/react";
import Modal from "react-modal";
import { NavSidebarContext } from "~/components/sidebar/NavSidebar";
import { Toaster } from "~/components/toasts/Toaster";
import type { RenderOptions } from "@testing-library/react";

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  Modal.setAppElement("div");
  return (
    <div id="_root">
      <Toaster />
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
