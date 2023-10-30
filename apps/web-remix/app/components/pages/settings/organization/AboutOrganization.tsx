import React, { useMemo } from "react";
import { withZod } from "@remix-validated-form/with-zod";
import { ValidatedForm } from "remix-validated-form";
import { Avatar, Button } from "@elpassion/taco";
import { IconButton } from "~/components/iconButton";
import {
  OrganizationSection,
  OrganizationSectionContent,
  OrganizationSectionHeading,
} from "./OrganizationSection";
import { Modal } from "@elpassion/taco/Modal";
import { useModal } from "~/hooks/useModal";
import { IOrganization } from "./organization.types";
import { schema } from "./schema";
import { Field } from "~/components/form/fields/field.context";
import { TextInputField } from "~/components/form/fields/text.field";
interface AboutOrganizationProps {
  organization: IOrganization;
}

export const AboutOrganization: React.FC<AboutOrganizationProps> = ({
  organization,
}) => {
  return (
    <OrganizationSection>
      <OrganizationSectionHeading>
        About Organization
      </OrganizationSectionHeading>

      <OrganizationSectionContent>
        <OrganizationAvatar organization={organization} />

        <EditOrganizationName organization={organization} />
      </OrganizationSectionContent>
    </OrganizationSection>
  );
};

interface OrganizationAvatarProps {
  organization: IOrganization;
}
function OrganizationAvatar({ organization }: OrganizationAvatarProps) {
  return (
    <div className="flex gap-2 items-center">
      <Avatar
        name={organization.name}
        contentType="text"
        shape="circle"
        className="!bg-neutral-950 !text-white"
        size="sm"
      />
      <h3 className="text-sm font-medium">{organization.name}</h3>
    </div>
  );
}

interface EditOrganizationNameProps {
  organization: IOrganization;
}
function EditOrganizationName({ organization }: EditOrganizationNameProps) {
  const { isModalOpen, openModal, closeModal } = useModal();
  const validator = useMemo(() => withZod(schema), []);

  return (
    <>
      <IconButton
        iconName="edit-2"
        variant="ghost"
        size="sm"
        aria-label="Edit organization name"
        onClick={openModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        closeButtonProps={{ iconName: "x", "aria-label": "Close" }}
        header={
          <header className="p-1 text-white mr-3">
            <p className="text-3xl mb-4">Edit name</p>

            <p className="text-sm text-neutral-400">
              Edit <span className="font-bold">{organization.name}</span>{" "}
              organization.
            </p>
          </header>
        }
      >
        <div className="p-1 w-[330px] md:w-[450px]">
          <ValidatedForm method="put" noValidate validator={validator}>
            <Field name="name">
              <TextInputField
                label="Organization name"
                placeholder="Acme"
                supportingText="This will be visible only to you"
              />
            </Field>

            <Button size="lg" type="submit" className="mt-4 ml-auto mr-0">
              Save
            </Button>
          </ValidatedForm>
        </div>
      </Modal>
    </>
  );
}
