'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Textarea } from '../../ui/textarea';
import { ClearButton } from '../clear-button';
import { ErrorText } from '../error-text';
import { RequiredSymbol } from '../required-symbol';

interface Props extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label?: string;
  required?: boolean;
  notEdit?: boolean;
  className?: string;
  minRows?: number;
  maxHeight?: number;
}

export const FormTextarea: React.FC<Props> = ({
  className,
  name,
  label,
  required,
  notEdit = false,
  minRows = 3,
  maxHeight = 300,
  ...props
}) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const value = watch(name);
  const errorText = errors[name]?.message as string;

  const onClickClear = () => setValue(name, '', { shouldValidate: true });

  return (
    <div className={className}>
      {label && (
        <p className="mb-2 font-medium">
          {label} {required && <RequiredSymbol />}
        </p>
      )}

      <div className="relative w-full rounded-md">
        <Textarea
          {...register(name)}
          {...props}
          value={value ?? ''}
          disabled={notEdit}
          minRows={minRows}
          maxHeight={maxHeight}
          className="text-md"
        />

        {!notEdit && value && (
          <ClearButton
            onClick={onClickClear}
            className="absolute right-6 top-1/2 z-10 -translate-y-1/2"
          />
        )}
      </div>

      {errorText && <ErrorText text={errorText} className="mt-2" />}
    </div>
  );
};
