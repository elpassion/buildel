import React, { useEffect } from "react";
import {
  Link,
  Outlet,
  useFetcher,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";
import { Button, Icon } from "@elpassion/taco";
import { confirm } from "~/components/modal/confirm";
import { AppNavbar } from "~/components/navbar/AppNavbar";
import { FilledTabLink } from "~/components/tabs/FilledTabLink";
import { FilledTabsWrapper } from "~/components/tabs/FilledTabsWrapper";
import { TabGroup } from "~/components/tabs/TabGroup";
import { successToast } from "~/components/toasts/successToast";
import { routes } from "~/utils/routes.utils";
import type { loader } from "./loader.server";

export function PipelineRunLayout() {
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [searchParams] = useSearchParams();
  const { pipeline, pipelineRun, runId, pipelineId, organizationId } =
    useLoaderData<typeof loader>();

  const handleRestoreRun = () => {
    confirm({
      onConfirm: async () =>
        fetcher.submit(
          { ...pipeline, config: { ...pipelineRun.config } },
          {
            method: "PUT",
            encType: "application/json",
            action: routes.pipelineBuild(organizationId, pipelineId) + "?index",
          }
        ),
      confirmText: "Restore Run",
      children: (
        <p className="text-neutral-100 text-sm">
          You are about to restore pipeline run configuration. This action is
          irreversible.
        </p>
      ),
    });
  };

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      successToast({ description: "Configuration restored!" });
      navigate(routes.pipelineBuild(organizationId, pipelineId));
    }
  }, [fetcher]);

  return (
    <div>
      <AppNavbar
        leftContent={
          <div className="flex gap-2 text-white">
            <Link
              to={routes.pipelineRuns(
                organizationId,
                pipelineId,
                Object.fromEntries(searchParams.entries())
              )}
            >
              <Icon iconName="arrow-left" className="text-2xl" />
            </Link>
            <div>
              <h2 className="text-2xl font-medium">Run history</h2>
              <h1 className="text-sm font-medium">{pipeline.name}</h1>
            </div>
          </div>
        }
      />

      <div className="px-4 md:px-6 lg:px-10">
        <TabGroup>
          <div className="flex justify-between items-center">
            <FilledTabsWrapper>
              <FilledTabLink
                end
                to={routes.pipelineRun(
                  organizationId,
                  pipelineId,
                  runId,
                  Object.fromEntries(searchParams.entries())
                )}
              >
                Overview
              </FilledTabLink>
              <FilledTabLink
                to={routes.pipelineRunCosts(
                  organizationId,
                  pipelineId,
                  runId,
                  Object.fromEntries(searchParams.entries())
                )}
              >
                Costs details
              </FilledTabLink>
              <FilledTabLink
                to={routes.pipelineRunLogs(
                  organizationId,
                  pipelineId,
                  runId,
                  Object.fromEntries(searchParams.entries())
                )}
              >
                Logs
              </FilledTabLink>
            </FilledTabsWrapper>

            <Button
              size="xs"
              hierarchy="primary"
              variant="outlined"
              onClick={handleRestoreRun}
            >
              Convert as latest
            </Button>
          </div>

          <Outlet />
        </TabGroup>
      </div>
    </div>
  );
}
