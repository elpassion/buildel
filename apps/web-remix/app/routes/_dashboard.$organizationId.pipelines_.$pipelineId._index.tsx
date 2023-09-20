// export async function loader(args: LoaderArgs) {
//   return loaderBuilder(async ({ request, params }) => {
//     await requireLogin(request);
//     invariant(params.organizationId, "organizationId not found");
//     invariant(params.pipelineId, "pipelineId not found");
//
//     return redirect(
//       routes.pipelineBuilder(params.organizationId, params.pipelineId)
//     );
//   })(args);
// }

export { page as default, loader } from "~/components/pages/pipelines/overview";
