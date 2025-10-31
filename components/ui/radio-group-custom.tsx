'use client';

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import React from 'react';
import { cn } from '@/lib/utils'; // якщо в тебе є util для злиття класів (як у shadcn/ui)

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupCustomProps {
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  itemClassName?: string;
  labelClassName?: string;
}

export const RadioGroupCustom: React.FC<RadioGroupCustomProps> = ({
  options,
  value,
  onChange,
  className,
  itemClassName,
  labelClassName,
}) => {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={onChange}
      className={cn('flex flex-col gap-3', className)}
    >
      {options.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <RadioGroupPrimitive.Item
            value={option.value}
            id={option.value}
            className={cn(
              'h-5 w-5 rounded-full border border-gray-400 transition-all',
              'flex items-center justify-center data-[state=checked]:border-orange-500 data-[state=checked]:bg-orange-50',
              itemClassName,
            )}
          >
            <RadioGroupPrimitive.Indicator className="h-2.5 w-2.5 rounded-full bg-orange-500" />
          </RadioGroupPrimitive.Item>
          <label
            htmlFor={option.value}
            className={cn('cursor-pointer select-none text-sm text-gray-800', labelClassName)}
          >
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroupPrimitive.Root>
  );
};
