import { V2_MetaFunction } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import * as React from "react";

export function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/stories";
  const actionData = useActionData();
  const emailRef = React.useRef<HTMLInputElement>(null);
  const passwordRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (actionData?.errors.email) {
      emailRef.current?.focus();
    } else if (actionData?.errors.password) {
      passwordRef.current?.focus();
    }
  }, [actionData]);

  return (
    <div className="container flex h-screen">
      <div className="my-auto flex w-full justify-center">Hello</div>
    </div>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Login",
    },
  ];
};
