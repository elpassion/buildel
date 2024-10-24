import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import debounce from 'lodash.debounce';
import startCase from 'lodash.startcase';
import { ChevronDown, Trash } from 'lucide-react';
import { useFieldArray, useFormContext } from 'remix-validated-form';

import { asyncSelectApi } from '~/api/AsyncSelectApi';
import { toSelectOption } from '~/components/form/fields/asyncSelect.field';
import { CheckboxInputField } from '~/components/form/fields/checkbox.field';
import { Field as FormField } from '~/components/form/fields/field.context';
import { FieldLabel } from '~/components/form/fields/field.label';
import { FieldMessage } from '~/components/form/fields/field.message';
import { QuantityInputField } from '~/components/form/fields/quantity.field';
import {
  RadioGroupField,
  RadioTabField,
} from '~/components/form/fields/radio.field';
import {
  PasswordInputField,
  ResettableTextInputField,
} from '~/components/form/fields/text.field';
import { CheckboxInput } from '~/components/form/inputs/checkbox.input';
import type { JSONSchemaField } from '~/components/form/schema/SchemaParser';
import { IconButton } from '~/components/iconButton';
import { Button } from '~/components/ui/button';
import { Collapsible, CollapsibleTrigger } from '~/components/ui/collapsible';
import { Label } from '~/components/ui/label';
import { useOrganizationId } from '~/hooks/useOrganizationId';
import { usePipelineId } from '~/hooks/usePipelineId';
import { assert } from '~/utils/assert';
import { cn } from '~/utils/cn';

import { Field, Schema } from './Schema';
import type { FieldProps } from './Schema';

export function StringField({
  field,
  shouldDisplay,
  name,
  fields,
  ...rest
}: FieldProps) {
  assert(name);
  assert(field.type === 'string');

  const { fieldErrors, getValues } = useFormContext();

  const error = fieldErrors[name] ?? undefined;

  if (shouldDisplay && !shouldDisplay(field)) return null;

  if (!('enum' in field)) {
    if ('presentAs' in field && field.presentAs === 'password') {
      return (
        <FormField name={name}>
          <FieldLabel>{field.title}</FieldLabel>
          <PasswordInputField id={name} {...rest} />
          <FieldMessage error={error}>{field.description}</FieldMessage>
        </FormField>
      );
    }

    if ('presentAs' in field && field.presentAs === 'editor') {
      return (
        <fields.editor field={field} name={name} fields={fields} {...rest} />
      );
    }

    if ('presentAs' in field && field.presentAs === 'async-select') {
      return (
        <fields.asyncSelect
          field={field}
          name={name}
          fields={fields}
          {...rest}
        />
      );
    }

    if ('presentAs' in field && field.presentAs === 'async-creatable-select') {
      return (
        <fields.asyncCreatableSelect
          field={field}
          name={name}
          fields={fields}
          {...rest}
        />
      );
    }
    //eslint-disable-next-line
    //@ts-ignore
    let defaultValue = field.default;

    if ('defaultWhen' in field && field.defaultWhen) {
      const formValues = getValues();
      const defaultKey = Object.keys(field.defaultWhen)[0];
      const defaultFieldValue = formValues.get(defaultKey);

      if (typeof defaultFieldValue === 'string') {
        defaultValue = field.defaultWhen[defaultKey][defaultFieldValue];
      }
    }

    return (
      <FormField name={name}>
        <ResettableTextInputField
          id={name}
          defaultValue={defaultValue}
          label={field.title}
          readOnly={rest.disabled}
        />
        <FieldMessage error={error}>{field.description}</FieldMessage>
      </FormField>
    );
  }
  if (field.enumPresentAs === 'radio') {
    return (
      <FormField name={name}>
        <FieldLabel className="mb-1" htmlFor={name}>
          {field.title}
        </FieldLabel>
        <FieldMessage className="mt-0 mb-3" error={error}>
          {field.description}
        </FieldMessage>
        <RadioGroupField
          defaultValue={field.default}
          className="flex gap-0 bg-secondary p-1 rounded-lg overflow-x-auto"
        >
          {field.enum.map((value) => (
            <RadioTabField key={value} id={value} value={value} {...rest} />
          ))}
        </RadioGroupField>
      </FormField>
    );
  }
  if (field.enumPresentAs === 'checkbox') {
    return field.enum.map((value, index) => (
      <FormField key={`${name}.${index}`} name={name}>
        <Label className="flex gap-1 items-center">
          <CheckboxInput
            name={name}
            key={value}
            id={`${name}.${index}`}
            value={value}
            {...rest}
            // error={!!error}
          />

          <span>{value}</span>
        </Label>
      </FormField>
    ));
  }
}

export function NumberField({
  field,
  shouldDisplay,
  name,
  ...rest
}: FieldProps) {
  assert(name);
  assert(field.type === 'number' || field.type === 'integer');
  const { fieldErrors } = useFormContext();

  const error = fieldErrors[name] ?? undefined;

  if (shouldDisplay && !shouldDisplay(field)) return null;
  return (
    <FormField name={name}>
      <FieldLabel>{field.title}</FieldLabel>
      <QuantityInputField
        id={name}
        // supportingText={field.description}
        min={field.minimum}
        max={field.maximum}
        defaultValue={field.default}
        step={field.step}
        {...rest}
      />
      <FieldMessage error={error}>{field.description}</FieldMessage>
    </FormField>
  );
}

export function ArrayField({
  field,
  name,
  fields,
  schema,
  shouldDisplay,
  ...rest
}: FieldProps) {
  assert(field.type === 'array');

  if (shouldDisplay && !shouldDisplay(field)) return null;
  if ('enum' in field.items && field.items.enumPresentAs === 'checkbox') {
    return (
      <>
        <p>{field.title}</p>
        <fields.string
          field={field.items}
          name={name}
          schema={schema}
          fields={fields}
          {...rest}
        />
      </>
    );
  } else {
    return (
      <RealArrayField
        field={field}
        name={name}
        fields={fields}
        schema={schema}
        {...rest}
      />
    );
  }
}

export function BooleanField({
  field,
  shouldDisplay,
  name,
  ...rest
}: FieldProps) {
  assert(name);
  assert(field.type === 'boolean');
  // const { fieldErrors } = useFormContext();

  // const error = fieldErrors[name] ?? undefined;
  if (shouldDisplay && !shouldDisplay(field)) return null;

  return (
    <FormField name={name}>
      <Label className="flex gap-1 items-center text-muted-foreground">
        <CheckboxInputField
          id={name}
          defaultChecked={field.default}
          {...rest}
          // error={!!error}
        />

        <span>{field.title}</span>
      </Label>
    </FormField>
  );
}

function RealArrayField({
  field,
  name,
  fields,
  shouldDisplay,
  schema,
  ...rest
}: FieldProps) {
  assert(field.type === 'array');
  const [rhfFields, { push, remove }] = useFieldArray(name!);

  useEffect(() => {
    if (rhfFields.length >= field.minItems) return;

    push({});
  }, [push, rhfFields.length]);

  if (shouldDisplay && !shouldDisplay(field)) return null;

  return (
    <div>
      {rhfFields.map((item, index) => (
        <div key={item.key} className="mt-2 flex flex-col gap-2">
          <Field
            key={item.key}
            field={field.items}
            name={`${name}[${index}]`}
            fields={fields}
            schema={schema}
            {...rest}
          />
          <IconButton
            size="xxs"
            variant="ghost"
            aria-label="Remove field"
            icon={<Trash />}
            disabled={rhfFields.length <= field.minItems || rest.disabled}
            onClick={(e) => {
              e.preventDefault();
              remove(index);
            }}
          />
        </div>
      ))}
      <Button
        type="button"
        size="xxs"
        variant="secondary"
        onClick={() => push({})}
        className="mt-2"
        disabled={rest.disabled}
      >
        Add item
      </Button>
    </div>
  );
}

export function SectionField({ field, name, ...rest }: FieldProps) {
  assert(field.type === 'object');

  return (
    <div>
      <Label>{field.title}</Label>
      <Collapsible
        className={cn(
          "group border border-input rounded-md px-3 [&[data-state='open']]:bg-secondary/25",
        )}
      >
        <CollapsibleTrigger className="relative w-full flex justify-between items-center h-10 text-sm">
          <SectionFieldPreview field={field} keyPrefix={name} />

          <div className="w-14 h-10 absolute top-1/2 right-7 -translate-y-1/2 bg-gradient-to-r from-transparent to-white pointer-events-none" />

          <div className="min-w-[30px] max-w-[30px] shrink-0 flex justify-end">
            <ChevronDown className="w-4 h-4" />
            <span className="sr-only">Toggle</span>
          </div>
        </CollapsibleTrigger>

        <div
          className={cn('py-2 hidden group-data-[state=open]:block space-y-2')}
          onClick={(e) => e.stopPropagation()}
        >
          <Schema name={name} {...rest} />
        </div>
      </Collapsible>

      <SectionFieldErrors name={name} />
    </div>
  );
}

interface SectionFieldPreviewProps {
  keyPrefix: string | null;
  field: JSONSchemaField;
}
function SectionFieldPreview({ field, keyPrefix }: SectionFieldPreviewProps) {
  assert(field.type === 'object');

  return (
    <div className="flex items-center divide-x overflow-hidden">
      {Object.entries(field.properties).map(([propertyKey, schema]) => {
        const fieldKey =
          keyPrefix === null || keyPrefix === ''
            ? propertyKey
            : `${keyPrefix}.${propertyKey}`;

        return (
          <SectionFieldPreviewItem
            key={fieldKey + '_preview'}
            fullKey={fieldKey}
            name={propertyKey}
            schema={schema}
          />
        );
      })}
    </div>
  );
}

interface SectionFieldPreviewItemProps {
  schema: JSONSchemaField;
  fullKey: string;
  name: string;
}
function SectionFieldPreviewItem({
  schema,
  fullKey,
  name,
}: SectionFieldPreviewItemProps) {
  const { getValues } = useFormContext();
  const values = getValues();

  const propertyValue = values.get(fullKey)?.toString() ?? '';

  if (!propertyValue) return null;

  if (schema.type === 'number') {
    return (
      <SectionFieldPreviewItemWrapper title={propertyValue}>
        <SectionFieldPreviewItemTitle>
          {startCase(name)}
        </SectionFieldPreviewItemTitle>
        <SectionFieldPreviewItemValue>
          {propertyValue}
        </SectionFieldPreviewItemValue>
      </SectionFieldPreviewItemWrapper>
    );
  }

  if (schema.type === 'string') {
    if (
      'presentAs' in schema &&
      (schema.presentAs === 'async-creatable-select' ||
        schema.presentAs === 'async-select')
    ) {
      return (
        <SectionFieldPreviewAsyncItem
          url={schema.url}
          value={propertyValue}
          label={name}
        />
      );
    }

    return (
      <SectionFieldPreviewItemWrapper title={propertyValue}>
        <SectionFieldPreviewItemTitle>
          {startCase(name)}
        </SectionFieldPreviewItemTitle>
        <SectionFieldPreviewItemValue>
          {propertyValue}
        </SectionFieldPreviewItemValue>
      </SectionFieldPreviewItemWrapper>
    );
  }
  return null;
}

interface SectionFieldErrorsProps {
  name: string | null;
}

function SectionFieldErrors({ name }: SectionFieldErrorsProps) {
  const { fieldErrors } = useFormContext();

  const errors = useMemo(() => {
    if (!name) return {};
    return Object.keys(fieldErrors).reduce(
      (acc, key) => {
        if (key.includes(name)) {
          acc[key] = fieldErrors[key];
        }

        return acc;
      },
      {} as Record<string, string>,
    );
  }, [fieldErrors, name]);

  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  if (!hasErrors) return null;
  return (
    <div className="text-red-500 text-sm font-medium mt-1">
      {Object.entries(errors).map(([key, value]) => (
        <p key={key + '_preview_error'}>{value}</p>
      ))}
    </div>
  );
}

function SectionFieldPreviewItemWrapper({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex gap-1 items-center [&:not(:first-child)]:pl-3 pr-3',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

function SectionFieldPreviewItemTitle({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn('text-[#999] whitespace-nowrap', className)} {...rest}>
      {children}
    </span>
  );
}

function SectionFieldPreviewItemValue({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('max-w-[100px] truncate', className)} {...rest}>
      {children}
    </p>
  );
}

interface SectionFieldPreviewAsyncItemProps {
  url: string;
  value: string;
  label: string;
}

function SectionFieldPreviewAsyncItem({
  url,
  value,
  label,
}: SectionFieldPreviewAsyncItemProps) {
  const abortController = useRef<AbortController | null>(null);
  const organizationId = useOrganizationId();
  const pipelineId = usePipelineId();

  const { getValues } = useFormContext();
  const context = getValues();

  const [finalValue, setFinalValue] = useState(value);

  const readyUrl = useMemo(() => {
    return url
      .replace('{{organization_id}}', organizationId.toString())
      .replace('{{pipeline_id}}', pipelineId.toString())
      .replace(/{{([\w.]+)}}/g, (_fullMatch, key) => {
        const cleanedKey = key.replace(/^[^.]+\./, '');

        const replacedValue = context.get(key)?.toString();

        return replacedValue ?? cleanedKey;
      });
  }, [url, organizationId, pipelineId, context]);

  const fetchOptions = useCallback(async () => {
    if (abortController.current) {
      abortController.current.abort();
    }
    abortController.current = new AbortController();

    try {
      return await asyncSelectApi
        .getData(readyUrl, { signal: abortController.current.signal })
        .then((opts) => opts.map(toSelectOption));
    } catch (err) {
      console.error(err);
    } finally {
      abortController.current = null;
    }
  }, [readyUrl]);

  const debouncedFetchOptions = debounce(() => {
    fetchOptions().then((options) => {
      setFinalValue(
        options?.find((option) => option.value === value)?.label ?? value,
      );
    });
  }, 200);

  useEffect(() => {
    debouncedFetchOptions();

    return () => {
      debouncedFetchOptions.cancel();
    };
  }, [url, value]);

  return (
    <SectionFieldPreviewItemWrapper title={finalValue}>
      <SectionFieldPreviewItemTitle>
        {startCase(label)}
      </SectionFieldPreviewItemTitle>
      <SectionFieldPreviewItemValue>{finalValue}</SectionFieldPreviewItemValue>
    </SectionFieldPreviewItemWrapper>
  );
}
