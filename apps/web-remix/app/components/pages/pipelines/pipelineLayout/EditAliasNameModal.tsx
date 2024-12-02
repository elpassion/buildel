import React, { useMemo } from 'react';

import { UpdateAliasSchema } from '~/api/pipeline/pipeline.contracts';
import { Field, HiddenField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { TextInputField } from '~/components/form/fields/text.field';
import { SubmitButton } from '~/components/form/submit';
import type { IPipelineAlias } from '~/components/pages/pipelines/pipeline.types';
import {
  DialogDrawer,
  DialogDrawerBody,
  DialogDrawerContent,
  DialogDrawerDescription,
  DialogDrawerFooter,
  DialogDrawerHeader,
  DialogDrawerTitle,
} from '~/components/ui/dialog-drawer';
import { ValidatedForm, withZod } from '~/utils/form';

interface EditAliasNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData: IPipelineAlias;
}

export const EditAliasNameModal: React.FC<EditAliasNameModalProps> = ({
  isOpen,
  onClose,
  initialData,
}) => {
  const validator = useMemo(() => withZod(UpdateAliasSchema), []);

  return (
    <DialogDrawer
      open={isOpen}
      onOpenChange={(value) => {
        if (value) return;
        onClose();
      }}
    >
      <DialogDrawerContent>
        <DialogDrawerHeader>
          <DialogDrawerTitle>Edit Alias</DialogDrawerTitle>
          <DialogDrawerDescription>
            Edit your <span className="font-bold">{initialData.name}</span>{' '}
            alias.
          </DialogDrawerDescription>
        </DialogDrawerHeader>
        <DialogDrawerBody>
          <ValidatedForm
            noValidate
            method="PATCH"
            validator={validator}
            defaultValues={initialData}
            onSubmit={onClose}
          >
            <HiddenField name="id" value={initialData.id} />

            <Field name="name">
              <FieldLabel>Name</FieldLabel>
              <TextInputField data-testid="alias-name" />
              <FieldMessage />
            </Field>

            <DialogDrawerFooter>
              <SubmitButton size="sm" className="mt-6 ml-auto mr-0">
                Save
              </SubmitButton>
            </DialogDrawerFooter>
          </ValidatedForm>
        </DialogDrawerBody>
      </DialogDrawerContent>
    </DialogDrawer>
  );
};
