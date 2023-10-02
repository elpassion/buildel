import { json, LoaderFunctionArgs } from "@remix-run/node";
import invariant from "tiny-invariant";
import { loaderBuilder } from "~/utils.server";
import { requireLogin } from "~/session.server";
import { KnowledgeBaseFileListResponse } from "../contracts";

const dummyFiles = [
  {
    id: 6,
    file_name: "test.txt",
    file_size: 2539,
    file_type: "text/plain",
  },
  {
    id: 3,
    file_name: "test.txt",
    file_size: 2539,
    file_type: "text/plain",
  },
  {
    id: 2,
    file_name: "test.txt",
    file_size: 2539,
    file_type: "text/plain",
  },
];
export async function loader(args: LoaderFunctionArgs) {
  return loaderBuilder(async ({ request, params }, { fetch }) => {
    await requireLogin(request);
    invariant(params.organizationId, "organizationId not found");

    // const knowledgeBase = await fetch(
    //   KnowledgeBaseFileListResponse,
    //   `/organizations/${params.organizationId}/memories`
    // );

    return json({
      fileList: dummyFiles,
      organizationId: params.organizationId,
    });
  })(args);
}
