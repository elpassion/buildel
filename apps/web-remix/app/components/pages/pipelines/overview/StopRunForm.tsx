import React, { useMemo } from 'react';
import { CircleStop } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';

import { HiddenField } from '~/components/form/fields/field.context';
import { IconButton } from '~/components/iconButton';
import { StopRunSchema } from '~/components/pages/pipelines/overview/schema';
import { Tooltip } from '~/components/tooltip/Tooltip';
import { withZod } from '~/utils/form';

interface StopRunFormProps {
  id: number;
}

export const StopRunForm: React.FC<StopRunFormProps> = ({ id }) => {
  const validator = useMemo(() => withZod(StopRunSchema), []);

  return (
    <ValidatedForm method="POST" validator={validator}>
      <HiddenField name="runId" value={id} />

      <IconButton
        id={`stop-run-${id}`}
        variant="default"
        aria-label="Stop run"
        icon={<CircleStop />}
        size="xxs"
      />

      <Tooltip
        offset={17}
        anchorSelect={`#stop-run-${id}`}
        content="Stop run"
        place="top"
      />
    </ValidatedForm>
  );
};
