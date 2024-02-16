import React from "react";
import { Google } from "~/icons/Google";
import { useNavigation } from "@remix-run/react";

type GoogleButtonContent = "Sign in with Google" | "Sign up with Google";

export const GoogleButton: React.FC<{ content?: GoogleButtonContent }> = ({
  content = "Sign in with Google",
}) => {
  const { state } = useNavigation();

  const disabled = state !== "idle";

  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex items-center justify-center gap-[10px] w-full text-[#1f1f1f] bg-[#F2F2F2] px-3 py-[10px] rounded-lg font-['Roboto'] font-medium"
    >
      <Google className="w-6 h-6" />

      <div className="text-sm">{content}</div>
    </button>
  );
};
