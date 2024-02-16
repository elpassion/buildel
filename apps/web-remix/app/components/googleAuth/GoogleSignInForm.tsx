import React, { PropsWithChildren } from "react";
import { Form } from "@remix-run/react";
import { GoogleButton } from "./GoogleButton";
import classNames from "classnames";

interface GoogleSignInFormProps {
  className?: string;
}

export const GoogleSignInForm: React.FC<
  PropsWithChildren<GoogleSignInFormProps>
> = ({ className, children }) => {
  return (
    <Form
      action="/auth/google"
      method="post"
      className={classNames("w-full", className)}
    >
      {children}
    </Form>
  );
};
