'use client';

import React from 'react';
import { WhiteBlock } from '../white-block';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useFormContext } from 'react-hook-form';

interface Props {
  totalCartAmount: number;
  countCartItems: number;
  shippingPrice?: number;
  freeShippingThreshold?: number;
  phoneVerified?: boolean;
  className?: string;
}

export const CheckoutSidebar: React.FC<Props> = ({
  totalCartAmount,
  countCartItems,
  shippingPrice = 75,
  freeShippingThreshold = 1000,
  phoneVerified,
  className,
}) => {
  const { watch, formState } = useFormContext();
  const deliveryType = watch('deliveryType');

  const shippingAmount =
    totalCartAmount === 0
      ? 0
      : deliveryType === 'pickup'
        ? 0
        : totalCartAmount >= freeShippingThreshold
          ? 0
          : shippingPrice;

  const finalAmount = totalCartAmount + shippingAmount;
  const isFormValid = formState.isValid && totalCartAmount > 0;

  return (
    <WhiteBlock className={cn('sticky top-4 p-4', className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {countCartItems} товар{countCartItems !== 1 ? 'ів' : ''} на суму
        </span>
        <span className="text-sm text-gray-600">{totalCartAmount.toFixed(2)} грн</span>
      </div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">Вартість доставки</span>
        <span className="text-sm text-gray-600">{`${shippingAmount.toFixed(2)} грн`}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-x-xl font-bold">Всього:</span>
        <span className="text-xl font-bold">{finalAmount.toFixed(2)} грн</span>
      </div>
      <Button
        type="submit"
        disabled={!isFormValid || !phoneVerified}
        className="mt-6 h-14 w-full rounded-2xl text-base font-bold"
      >
        Підтвердити замовлення
      </Button>
    </WhiteBlock>
  );
};
