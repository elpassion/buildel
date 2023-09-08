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

export function PipelinesPage() {
  const { pipelines, organizationId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const match = useMatch(`${organizationId}/pipelines/new`);
  const isModalOpened = !!match;

  return (
    <div>
      <Modal
        isOpen={isModalOpened}
        closeModal={() => {
          navigate(`/${organizationId}/pipelines`);
        }}
      >
        <Outlet />
      </Modal>
      <Link to={`/${organizationId}/pipelines/new`}>New Pipeline</Link>

      {pipelines.data.map((pipeline) => (
        <div key={pipeline.id}>
          <Link to={`/${organizationId}/pipelines/${pipeline.id}`}>
            {pipeline.name}
          </Link>
        </div>
      ))}
    </div>
  );
}

export const meta: V2_MetaFunction = () => {
  return [
    {
      title: "Pipelines",
    },
  ];
};
