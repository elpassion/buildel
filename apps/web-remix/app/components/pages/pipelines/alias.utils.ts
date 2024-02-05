import { fetchTyped } from "~/utils/fetch.server";
import invariant from "tiny-invariant";
import {
  AliasResponse,
  PipelineResponse,
} from "~/components/pages/pipelines/contracts";
import { Params } from "@remix-run/react";

export const getAliasedPipeline = async ({
  fetch,
  params,
  url,
}: {
  fetch: typeof fetchTyped;
  params: Params<string>;
  url: string;
}) => {
  invariant(params.organizationId, "organizationId not found");
  invariant(params.pipelineId, "pipelineId not found");

  const pipeline = await fetch(
    PipelineResponse,
    `/organizations/${params.organizationId}/pipelines/${params.pipelineId}`
  );

  const aliasId = new URL(url).searchParams.get("alias") ?? "latest";

  if (aliasId !== "latest") {
    const alias = await fetch(
      AliasResponse,
      `/organizations/${params.organizationId}/pipelines/${params.pipelineId}/aliases/${aliasId}`
    );

    return {
      pipeline: {
        ...pipeline.data,
        config: alias.data.config,
        interface_config: alias.data.interface_config,
      },
      aliasId,
    };
  }

  return { pipeline: pipeline.data, aliasId };
};
