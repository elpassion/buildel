import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from "@remix-run/react";
import { Button } from "@elpassion/taco";
import {
  ActionSidebar,
  ActionSidebarHeader,
} from "~/components/sidebar/ActionSidebar";
import { routes } from "~/utils/routes.utils";
import {
  Section,
  SectionContent,
  SectionHeading,
} from "../settingsLayout/PageLayout";
import type { loader } from "./loader.server";
import type { MetaFunction } from "@remix-run/node";

export function ProfileSettingsPage() {
  const { organization } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(routes.profileSettingsChangePassword(organization.id));
  const isSidebarOpen = !!match;

  const handleCloseSidebar = () => {
    navigate(routes.profileSettings(organization.id));
  };
  return (
    <>
      <ActionSidebar
        className="!bg-neutral-950"
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
        overlay
      >
        <ActionSidebarHeader
          heading="Change password"
          onClose={handleCloseSidebar}
        />
        <Outlet />
      </ActionSidebar>
      <div className="flex flex-col gap-9">
        <Section>
          <SectionHeading>Password</SectionHeading>
          <SectionContent>
            <Link to={routes.profileSettingsChangePassword(organization.id)}>
              <Button tabIndex={0} size="sm">
                Change password
              </Button>
            </Link>
          </SectionContent>
        </Section>
      </div>
    </>
  );
}

export const meta: MetaFunction = () => {
  return [
    {
      title: "Profile settings",
    },
  ];
};
