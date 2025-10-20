import { cn } from '@/lib/utils';
import React from 'react';
import { CountIconButton } from './count-icon-button';

export interface CountButtonProps {
  value?: number;
  minValue?: number;
  maxValue?: number;
  minPartValue?: number;
  size?: 'sm' | 'lg';
  onClick?: (type: 'plus' | 'minus') => void;
  className?: string;
}

export const CountButton: React.FC<CountButtonProps> = ({
  className,
  onClick,
  value = 1,
  minValue = 1,
  maxValue = 8,
  minPartValue = 1,
  size = 'sm',
}) => {
  return (
    <div
      className={cn(
        'inline-flex items-center justify-between gap-2 [tap-highlight-color:transparent]',
        className,
      )}
    >
      <CountIconButton
        onClick={() => onClick?.('minus')}
        disabled={value - minPartValue < minValue}
        size={size}
        type="minus"
      />

      <b
        className={cn(
          'flex select-none items-center justify-center text-center',
          size === 'sm' ? 'w-4 text-sm' : 'text-md w-10', // 👈 фіксована ширина
        )}
      >
        {value}
      </b>

      <CountIconButton
        disabled={value >= maxValue}
        onClick={() => onClick?.('plus')}
        size={size}
        type="plus"
      />
    </div>
  );
};
