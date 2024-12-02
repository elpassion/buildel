import React, { useMemo } from 'react';
import { Edit } from 'lucide-react';

import { toSelectOption } from '~/components/form/fields/asyncSelect.field';
import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { SelectField } from '~/components/form/fields/select.field';
import { SubmitButton } from '~/components/form/submit';
import { IconButton } from '~/components/iconButton';
import { BasicLink } from '~/components/link/BasicLink';
import type { IPipeline } from '~/components/pages/pipelines/pipeline.types';
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
import { ValidatedForm, withZod } from '~/utils/form';
import { routes } from '~/utils/routes.utils';

import { Section, SectionHeading } from '../settingsLayout/PageLayout';
import type { IOrganization } from './organization.types';
import { schema } from './schema';

interface ELSettingsProps {
  organization: IOrganization;
  pipelines: IPipeline[];
}

export const ELSettings: React.FC<ELSettingsProps> = ({
  organization,
  pipelines,
}) => {
  const elWorkflow = pipelines.find((p) => p.id === organization.el_id);

  return (
    <Section>
      <SectionHeading className="mb-1">EL</SectionHeading>

      <div className="flex gap-2 items-center">
        <p className="text-sm text-muted-foreground">
          Selected workflow:{' '}
          {elWorkflow ? (
            <BasicLink
              to={routes.pipelineBuild(organization.id, elWorkflow.id)}
              className="text-foreground hover:underline"
              target="_blank"
            >
              {elWorkflow.name}
            </BasicLink>
          ) : (
            <span className="text-yellow-500">Not set</span>
          )}
        </p>

        <EditELSettingsForm organization={organization} pipelines={pipelines} />
      </div>
    </Section>
  );
};

interface EditELSettingsFormProps {
  organization: IOrganization;
  pipelines: IPipeline[];
}
function EditELSettingsForm({
  organization,
  pipelines,
}: EditELSettingsFormProps) {
  const { isModalOpen, openModal, closeModal, changeOpen } = useModal();
  const validator = useMemo(() => withZod(schema), []);

  return (
    <>
      <IconButton
        icon={<Edit />}
        size="xxs"
        variant="ghost"
        aria-label="Edit EL workflow"
        onClick={openModal}
      />

      <DialogDrawer open={isModalOpen} onOpenChange={changeOpen}>
        <DialogDrawerContent>
          <DialogDrawerHeader>
            <DialogDrawerTitle>EL</DialogDrawerTitle>

            <DialogDrawerDescription>
              Set settings for EL
            </DialogDrawerDescription>
          </DialogDrawerHeader>
          <DialogDrawerBody>
            <ValidatedForm
              method="put"
              noValidate
              validator={validator}
              onSubmit={closeModal}
              defaultValues={{
                organization: { el_id: organization.el_id?.toString() },
              }}
            >
              <HiddenField name="organization.name" value={organization.name} />

              <Field name="organization.el_id">
                <FieldLabel>Workflow</FieldLabel>
                <SelectField
                  options={pipelines.map(toSelectOption)}
                  getPopupContainer={(node) => node.parentNode.parentNode}
                />
                <FieldMessage>Workflow used as a EL</FieldMessage>
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
