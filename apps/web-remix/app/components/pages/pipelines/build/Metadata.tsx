import React, { useEffect, useState } from 'react';
import { withZod } from '@remix-validated-form/with-zod';
import { FileText } from 'lucide-react';
import { ValidatedForm } from 'remix-validated-form';
import { z } from 'zod';

import {
  Dropdown,
  DropdownPopup,
  DropdownTrigger,
} from '~/components/dropdown/Dropdown';
import { useDropdown } from '~/components/dropdown/DropdownContext';
import { EditorField } from '~/components/form/fields/editor.field';
import { Field } from '~/components/form/fields/field.context';
import type { Metadata as IMetadata } from '~/components/pages/pipelines/RunPipelineProvider';
import { useRunPipeline } from '~/components/pages/pipelines/RunPipelineProvider';
import { successToast } from '~/components/toasts/successToast';
import { Button } from '~/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { useBreakpoints } from '~/hooks/useBreakpoints';

export const Metadata = () => {
  const { isDesktop } = useBreakpoints();
  const { metadata, setMetadata } = useRunPipeline();

  return (
    <Dropdown placement={isDesktop ? 'bottom' : 'bottom-start'}>
      <MetadataTrigger />

      <DropdownPopup className="min-w-[250px] z-[11] bg-white border border-input rounded-lg overflow-hidden p-2 lg:min-w-[350px]">
        <MetadataForm
          defaultValue={JSON.stringify(metadata)}
          onSubmit={setMetadata}
        />
      </DropdownPopup>
    </Dropdown>
  );
};

function MetadataTrigger() {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        <DropdownTrigger
          aria-label="Open metadata editor"
          className="w-7 h-7 p-0"
          variant="ghost"
          asChild
        >
          <TooltipTrigger>
            <FileText className="w-4 h-4" />
          </TooltipTrigger>
        </DropdownTrigger>

        <TooltipContent className="max-w-[400px]" side="bottom">
          Configure metadata for the workflow.
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

const metadataSchema = z.object({
  value: z.string().transform((str, ctx) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      ctx.addIssue({ code: 'custom', message: 'Invalid JSON' });
      return z.NEVER;
    }
  }),
});

type MetadataSchema = z.TypeOf<typeof metadataSchema>;

interface MetadataFormProps {
  defaultValue: string;
  onSubmit: (value: IMetadata) => void;
}
function MetadataForm({ defaultValue, onSubmit }: MetadataFormProps) {
  const { isShown, hide } = useDropdown();
  const [key, setKey] = useState(new Date().getTime());
  const validator = React.useMemo(() => withZod(metadataSchema), []);

  const handleOnSubmit = (
    data: MetadataSchema,
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (!data.value) return onSubmit({});
    onSubmit(data.value);

    successToast({ description: 'Metadata configured' });
    hide();
  };

  useEffect(() => {
    if (!isShown) {
      setKey(new Date().getTime());
    }
  }, [isShown]);

  return (
    <ValidatedForm
      key={key}
      defaultValues={{ value: defaultValue }}
      onSubmit={handleOnSubmit}
      validator={validator}
      noValidate
    >
      <Field name="value">
        <EditorField
          supportingText="Properties that will be accessible in every block."
          language="json"
          label="Metadata"
        />
      </Field>

      <div className="flex justify-end w-full mt-2">
        <Button size="xs" isFluid>
          Set
        </Button>
      </div>
    </ValidatedForm>
  );
}
