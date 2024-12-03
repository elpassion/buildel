import { useRef } from 'react';
import { Search, X } from 'lucide-react';

import { TextInput } from '~/components/form/inputs/text.input';
import { IconButton } from '~/components/iconButton';
import type { InputProps } from '~/components/ui/input';
import { useMergedRefs } from '~/hooks/useMergeRefs';
import { cn } from '~/utils/cn';

export type SearchInputProps = InputProps & {
  onClear?: () => void;
  wrapperClassName?: string;
};
export const SearchInput = ({
  className,
  onClear,
  ref,
  wrapperClassName,
  ...rest
}: SearchInputProps) => {
  const innerRef = useRef<HTMLInputElement | null>(null);

  const onIconClick = () => {
    innerRef.current?.focus();
  };

  const refs = useMergedRefs(innerRef, ref);

  return (
    <div className={cn('relative w-fit max-w-[350px]', wrapperClassName)}>
      <Search
        className="absolute top-1/2 -translate-y-1/2 left-2.5 w-3.5 h-3.5"
        onClick={onIconClick}
      />

      <TextInput
        //@ts-ignore
        ref={refs}
        size="sm"
        placeholder="Search"
        className={cn('px-8 peer', className)}
        {...rest}
      />

      {onClear ? (
        <IconButton
          onlyIcon
          size="xs"
          className={cn(
            'absolute top-1/2 -translate-y-1/2 right-2.5 w-3.5 h-3.5 text-muted-foreground opacity-0 peer-hover:opacity-100 cursor-pointer hover:opacity-100',
            // { hidden: !defaultValues?.search },
          )}
          onClick={onClear}
          icon={<X />}
        />
      ) : null}
    </div>
  );
};
