import React from "react";
import { Icon, Navbar } from "@elpassion/taco";

export const PipelinesNavbar = () => {
  return (
    <Navbar menuClassName="md:hidden" leftContent={<LeftContent />}>
      <Content />
    </Navbar>
  );
};

function LeftContent() {
  return (
    <div className="flex items-center justify-center gap-2">
      <h2 className="text-2xl font-bold text-neutral-500">Workflows</h2>

      <Icon iconName="help-circle" className="font-bold text-primary-500" />
    </div>
  );
}

function Content() {
  return <div className="flex items-center justify-end gap-4"></div>;
}
