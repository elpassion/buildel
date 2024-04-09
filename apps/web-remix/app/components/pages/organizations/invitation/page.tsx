import { MetaFunction } from "@remix-run/node";

export function InvitationPage() {
  return (
    <div className="min-h-screen w-full flex justify-center items-center p-2">
      Invitation
    </div>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Invitation",
    },
  ];
};
