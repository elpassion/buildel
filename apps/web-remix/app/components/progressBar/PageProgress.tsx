import React, { useEffect } from "react";
import { useNavigation } from "@remix-run/react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import "./pageProgress.css";

NProgress.configure({ showSpinner: false });

export const PageProgress: React.FC = () => {
  const { state } = useNavigation();

  useEffect(() => {
    if (state === "loading") NProgress.start();
    if (state === "idle") NProgress.done();
  }, [state]);

  return null;
};
