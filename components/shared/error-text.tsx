import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  text: string;
  className?: string;
}

export const ErrorText: React.FC<Props> = ({ text, className }) => {
  return <p className={cn('text-sm text-red-500', className)}>{text}</p>;
};
