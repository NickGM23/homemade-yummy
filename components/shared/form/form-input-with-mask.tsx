'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import { Input } from '../../ui/input';
import { ClearButton } from '../clear-button';
import { ErrorText } from '../error-text';
import { RequiredSymbol } from '../required-symbol';
import React from 'react';

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string;
  label?: string;
  required?: boolean;
  notEdit?: boolean;
  className?: string;
}

export const FormInputWithMask: React.FC<Props> = ({
  className,
  name,
  label,
  required,
  notEdit = false,
  ...props
}) => {
  const {
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext();

  const value = watch(name);
  const errorText = errors[name]?.message as string;

  const onClickClear = () => {
    setValue(name, '', { shouldValidate: true });
  };

  return (
    <div className={className}>
      {label && (
        <p className="mb-2 font-medium">
          {label} {required && <RequiredSymbol />}
        </p>
      )}

      <div className="relative">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <IMaskInput
              {...field}
              mask="+38(000)000-00-00"
              lazy={false}
              overwrite={true}
              unmask={false}
              inputRef={field.ref}
              onAccept={(val: string) => field.onChange(val)}
              disabled={notEdit}
              className="text-md flex h-12 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
              {...props}
            />
          )}
        />

        {notEdit === false && value && <ClearButton onClick={onClickClear} />}
      </div>

      {errorText && <ErrorText text={errorText} className="mt-2" />}
    </div>
  );
};
