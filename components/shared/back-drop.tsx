import React from 'react';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;

  handelMenu?: () => void;
}

export const BackDrop: React.FC<Props> = ({ className, handelMenu }) => {
  return <div className={cn(className)} onClick={handelMenu}></div>;
};
