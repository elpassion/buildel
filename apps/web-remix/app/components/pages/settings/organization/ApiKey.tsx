import React, { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import classNames from 'classnames';

import { TextInput } from '~/components/form/inputs/text.input';
import { confirm } from '~/components/modal/confirm';
import { Button } from '~/components/ui/button';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

import type { IAPIKey } from './organization.types';

interface ApiKeyProps {
  apiKey: IAPIKey;
}
export const ApiKey: React.FC<ApiKeyProps> = ({ apiKey }) => {
  const [isFocused, setIsFocused] = useState(false);
  const { copy, isCopied } = useCopyToClipboard(apiKey.key ?? '');
  const fetcher = useFetcher();

  const onFocus = () => {
    setIsFocused(true);
  };
  const onBlur = () => {
    setIsFocused(false);
  };

  const handleGenerate = () => {
    if (!apiKey.key) return fetcher.submit({}, { method: 'post' });

    confirm({
      onConfirm: async () => fetcher.submit({}, { method: 'post' }),
      children: (
        <p className="text-sm">
          You are about to regenerate the API Key. This action is irreversible.
        </p>
      ),
    });
  };

  return (
    <section>
      <h2 className="text-lg text-foreground">API Key</h2>
      <p className="text-xs text-muted-foreground">
        This is your workspace API key. It's required in order to use the Sync
        API endpoints and authorize webhooks.
      </p>

      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center">
        <div className="flex gap-2 items-center">
          <TextInput
            placeholder="Generate API Key..."
            value={apiKey.key ?? ''}
            className="w-[300px]"
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={() => {}}
            type={isFocused ? 'text' : 'password'}
          />
          <CopyButton
            onClick={copy}
            isCopied={isCopied}
            disabled={!apiKey.key}
          />
        </div>

        <Button
          size="xs"
          className="!h-[42px] !w-fit"
          isLoading={fetcher.state !== 'idle'}
          onClick={handleGenerate}
        >
          {apiKey.key ? 'Regenerate' : 'Generate'}
        </Button>
      </div>
    </section>
  );
};

interface CopyButtonProps {
  onClick: () => void;
  isCopied: boolean;
  disabled?: boolean;
}
function CopyButton({ onClick, isCopied, disabled }: CopyButtonProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      disabled={disabled}
      onClick={onClick}
      className={classNames('!h-[42px]', {
        '!text-green-600': isCopied,
      })}
    >
      {isCopied ? 'Copied' : 'Copy'}
    </Button>
  );
}
