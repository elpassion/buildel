import React, { useMemo } from 'react';
import { Modal } from '@elpassion/taco/Modal';
import { withZod } from '@remix-validated-form/with-zod';
import { Edit } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { IconButton } from '~/components/iconButton';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import { useModal } from '~/hooks/useModal';

import {
  Section,
  SectionContent,
  SectionHeading,
} from '../settingsLayout/PageLayout';
import type { IOrganization } from './organization.types';
import { schema } from './schema';

interface AboutOrganizationProps {
  organization: IOrganization;
}

export const AboutOrganization: React.FC<AboutOrganizationProps> = ({
  organization,
}) => {
  return (
    <Section>
      <SectionHeading>About Organization</SectionHeading>

      <SectionContent>
        <OrganizationAvatar name={organization.name} />

        <EditOrganizationName organization={organization} />
      </SectionContent>
    </Section>
  );
};

interface OrganizationAvatarProps {
  name: string;
}
export function OrganizationAvatar({ name }: OrganizationAvatarProps) {
  return (
    <div className="flex gap-2 items-center">
      <Avatar className="rounded-full">
        <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
      </Avatar>
      <h3 className="text-sm font-medium">{name}</h3>
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
        icon={<Edit />}
        variant="ghost"
        size="sm"
        aria-label="Edit organization name"
        onClick={openModal}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        closeButtonProps={{ iconName: 'x', 'aria-label': 'Close' }}
        header={
          <header className="p-1 text-white mr-3">
            <p className="text-3xl mb-4">Edit name</p>

            <p className="text-sm text-neutral-400">
              Edit <span className="font-bold">{organization.name}</span>{' '}
              organization.
            </p>
          </header>
        }
      >
        <div className="p-1 w-[330px] md:w-[450px]">
          <ValidatedForm
            method="put"
            noValidate
            validator={validator}
            onSubmit={closeModal}
          >
            <Field name="organization.name">
              <FieldLabel>Organization name</FieldLabel>
              <TextInputField placeholder="Acme" />
              <FieldMessage>This will be visible only to you</FieldMessage>
            </Field>

            <SubmitButton className="mt-4 ml-auto mr-0">Save</SubmitButton>
          </ValidatedForm>
        </div>
      </Modal>
    </>
  );
}
