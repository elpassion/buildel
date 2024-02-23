import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { KnowledgeBaseApi } from "~/api/knowledgeBase/KnowledgeBaseApi";

export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    const knowledgeBaseApi = new KnowledgeBaseApi(fetch);

    const collections = await knowledgeBaseApi.getCollections(
      params.organizationId
    );

    return json({
      organizationId: params.organizationId,
      collections: collections.data,
    });
  })(args);
}
