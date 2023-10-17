import React from "react";
import { Outlet, useLoaderData, useLocation } from "@remix-run/react";
import { Icon } from "@elpassion/taco";
import classNames from "classnames";
import { TabGroup } from "~/components/tabs/TabGroup";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { AppNavbar, AppNavbarHeading } from "~/components/navbar/AppNavbar";
import { PageContentWrapper } from "~/components/layout/PageContentWrapper";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";
import { routes } from "~/utils/routes.utils";
import { Tooltip } from "~/components/tooltip/Tooltip";
import { loader } from "./loader";

export function VariablesLayout() {
  const { organizationId } = useLoaderData<typeof loader>();
  const location = useLocation();

  return (
    <>
      <AppNavbar
        leftContent={
          <AppNavbarHeading className="flex gap-3 items-center">
            <span>Secrets and API Keys</span>

            <HelpfulIcon
              id="secrets-and-api-keys"
              text="API Keys and Secrets allow you to manage reusable configuration data. Both are encrypted for your security. Secrets are designed for storing sensitive information that your applications might need to communicate with external services, like GPT API. API Keys, on the other hand, enable authorized communication with our API."
            />
          </AppNavbarHeading>
        }
      />

      <PageContentWrapper>
        <TabGroup activeTab={location.pathname}>
          <FilledTabsWrapper>
            <FilledTabLink
              tabId={routes.secrets(organizationId)}
              to={routes.secrets(organizationId)}
            >
              Secrets
            </FilledTabLink>
            <FilledTabLink
              tabId={routes.apiKeys(organizationId)}
              to={routes.apiKeys(organizationId)}
            >
              API Keys
            </FilledTabLink>
          </FilledTabsWrapper>

          <Outlet />
        </TabGroup>
      </PageContentWrapper>
    </>
  );
}

interface HelpfulIconProps {
  text: string;
  id: string;
  className?: string;
}

function HelpfulIcon({ className, text, id }: HelpfulIconProps) {
  return (
    <>
      <Tooltip
        anchorSelect={`#${id}-helpful-icon`}
        content={text}
        className="!text-xs max-w-[350px] "
        place="bottom"
      />
      <Icon
        id={`${id}-helpful-icon`}
        iconName="help-circle"
        className={classNames(
          "text-primary-500 text-xl cursor-pointer",
          className
        )}
      />
    </>
  );
}
