import React, { PropsWithChildren } from "react";
import { Modal } from "@elpassion/taco/Modal";
import { useNavigate } from "@remix-run/react";
interface CreatePipelineModalProps extends PropsWithChildren {
  isOpen: boolean;
  organizationId: string;
}

export const CreatePipelineModal: React.FC<CreatePipelineModalProps> = ({
  isOpen,
  children,
  organizationId,
}) => {
  const navigate = useNavigate();
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => navigate(`/${organizationId}/pipelines`)}
      header={
        <header className="p-1 text-white">
          <p className="text-3xl">Create a new workflow</p>
          <div className="mb-4" />
          <p className="text-sm text-neutral-400">
            Any workflow can contain many Blocks and use your Knowledge Base.
          </p>
        </header>
      }
      className="!overflow-auto"
    >
      <div className="p-1">{children}</div>
    </Modal>
  );
};
