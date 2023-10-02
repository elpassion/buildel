import React from "react";
import { Icon } from "@elpassion/taco";
import { AppNavbar } from "~/components/navbar/AppNavbar";

export const PipelinesNavbar = () => {
  return (
    <AppNavbar leftContent={<LeftContent />}>
      <Content />
    </AppNavbar>
  );
};

function LeftContent() {
  return (
    <div className="flex items-center justify-center gap-2">
      <h2 className="text-2xl font-bold text-white">Workflows</h2>

      <Icon iconName="help-circle" className="font-bold text-primary-500" />
    </div>
  );
}

function Content() {
  return <div className="flex items-center justify-end gap-4"></div>;
}
