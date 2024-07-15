import { Outlet, useLoaderData, useSearchParams } from "@remix-run/react";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";
import { TabGroup } from "~/components/tabs/TabGroup";
import { routes } from "~/utils/routes.utils";
import { AliasSelect, CreateAliasForm, RestoreWorkflow } from "./Aliases";
import { loader } from "./loader.server";

export function PipelineLayout() {
  const { pipeline, aliases, aliasId } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  return (
    <>
      <AppNavbar
        leftContent={
          <div className="flex gap-3 items-center justify-between w-full">
            <h1 className="text-2xl font-medium text-white">{pipeline.name}</h1>

            <div className="flex gap-2 items-center">
              <AliasSelect aliases={aliases} value={aliasId} />

              {aliasId !== "latest" && <RestoreWorkfulow pipeline={pipeline} />}

              {aliasId === "latest" && (
                <CreateAliasForm pipeline={pipeline} aliases={aliases} />
              )}
            </div>
          </div>
        }
      />
      <div className="px-4 md:px-6 lg:px-10">
        <TabGroup>
          <FilledTabsWrapper>
            <FilledTabLink
              end
              to={routes.pipelineBuild(
                pipeline.organization_id,
                pipeline.id,
                Object.fromEntries(searchParams)
              )}
            >
              Build
            </FilledTabLink>
            <FilledTabLink
              to={routes.pipelineRuns(
                pipeline.organization_id,
                pipeline.id,
                Object.fromEntries(searchParams)
              )}
            >
              Overview
            </FilledTabLink>
            <FilledTabLink
              to={routes.pipelineInterface(
                pipeline.organization_id,
                pipeline.id,
                Object.fromEntries(searchParams)
              )}
            >
              Interface
            </FilledTabLink>
            <FilledTabLink
              to={routes.pipelineSettings(
                pipeline.organization_id,
                pipeline.id,
                Object.fromEntries(searchParams)
              )}
            >
              Settings
            </FilledTabLink>
          </FilledTabsWrapper>

          <Outlet />
        </TabGroup>
      </div>
    </>
  );
}
