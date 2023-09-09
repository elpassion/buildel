import { V2_MetaFunction } from "@remix-run/node";
import {
  Link,
  Outlet,
  useLoaderData,
  useMatch,
  useNavigate,
} from "@remix-run/react";
import { loader } from "./loader";
import { Modal } from "@elpassion/taco/Modal";
import { PipelinesNavbar } from "./PipelinesNavbar";
import { PipelinesList } from "./PipelinesList";

export function PipelinesPage() {
  const { pipelines, organizationId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(`${organizationId}/pipelines/new`);
  const isModalOpened = !!match;

  return (
    <>
      <PipelinesNavbar />

      <Modal
        isOpen={isModalOpened}
        closeModal={() => navigate(`/${organizationId}/pipelines`)}
      >
        <Outlet />
      </Modal>

      <div className="bg-neutral-50 p-4 md:p-8 flex-grow">
        <Link to={`/${organizationId}/pipelines/new`}>New Pipeline</Link>

        <PipelinesList pipelines={pipelines.data} />
      </div>
    </>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Pipelines",
    },
  ];
};
