import React, { PropsWithChildren } from "react";
import { Modal } from "@elpassion/taco/Modal";
import { useNavigate } from "@remix-run/react";
import { routes } from "~/utils/routes.utils";
interface CreateCollectionModalProps extends PropsWithChildren {
  isOpen: boolean;
  organizationId: string;
}

export const CreateCollectionModal: React.FC<CreateCollectionModalProps> = ({
  isOpen,
  children,
  organizationId,
}) => {
  const navigate = useNavigate();
  return (
    <Modal
      isOpen={isOpen}
      onClose={() => navigate(routes.knowledgeBase(organizationId))}
      header={
        <header className="p-1 text-white">
          <p className="text-3xl mb-4">Create a new collection</p>

          <p className="text-sm text-neutral-400">
            Any collection can contain many files and be used in your workflows
          </p>
        </header>
      }
      className="!overflow-auto"
    >
      <div className="p-1">{children}</div>
    </Modal>
  );
};
