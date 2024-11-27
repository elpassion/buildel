import React, { useMemo } from 'react';
import { Edit } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import { Field } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import { IconButton } from '~/components/iconButton';
import { Avatar, AvatarFallback } from '~/components/ui/avatar';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { useModal } from '~/hooks/useModal';
import { withZod } from '~/utils/form';

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
      <SectionHeading className="mb-1">About Organization</SectionHeading>

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
  const { isModalOpen, openModal, closeModal, changeOpen } = useModal();
  const validator = useMemo(() => withZod(schema), []);

  return (
    <>
      <IconButton
        icon={<Edit />}
        variant="ghost"
        aria-label="Edit organization name"
        onClick={openModal}
      />

      <DialogDrawer open={isModalOpen} onOpenChange={changeOpen}>
        <DialogDrawerContent>
          <DialogDrawerHeader>
            <DialogDrawerTitle>Edit name</DialogDrawerTitle>

            <DialogDrawerDescription>
              Edit <span className="font-bold">{organization.name}</span>{' '}
              organization.
            </DialogDrawerDescription>
          </DialogDrawerHeader>
          <DialogDrawerBody>
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

              <DialogDrawerFooter>
                <SubmitButton className="mt-4 ml-auto mr-0">Save</SubmitButton>
              </DialogDrawerFooter>
            </ValidatedForm>
          </DialogDrawerBody>
        </DialogDrawerContent>
      </DialogDrawer>
    </>
  );
}
