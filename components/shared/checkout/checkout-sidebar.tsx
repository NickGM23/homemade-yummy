'use client';

import React from 'react';

import { WhiteBlock } from '../white-block';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ArrowRight, Package, Percent, Truck } from 'lucide-react';
import { getProductWord } from '@/lib/utils';
import { useFormContext } from 'react-hook-form';

interface Props {
  totalCartAmount: number;
  countCartItems: number;
  shippingPrice?: number;
  freeShippingThreshold?: number;
  loading?: boolean;
  className?: string;
}

export const CheckoutSidebar: React.FC<Props> = ({
  totalCartAmount,
  countCartItems,
  shippingPrice = 75, // 👉 дефолтна вартість доставки
  freeShippingThreshold = 1000, // 👉 дефолтний поріг безкоштовної доставки
  loading,
  className,
}) => {
  // ✅ отримуємо доступ до даних форми
  const { watch } = useFormContext();
  const deliveryType = watch('deliveryType'); // 'pickup' або 'address'

  // ✅ логіка підрахунку доставки
  const shippingAmount =
    totalCartAmount === 0
      ? 0
      : deliveryType === 'pickup'
        ? 0 // самовивіз — безкоштовно
        : totalCartAmount >= freeShippingThreshold
          ? 0 // перевищено поріг — теж безкоштовно
          : shippingPrice;

  const finalAmount = totalCartAmount + shippingAmount;

  return (
    <WhiteBlock className={cn('sticky top-4 p-4', className)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-gray-600">
          {countCartItems} {getProductWord(countCartItems)} на суму
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
        disabled={finalAmount === 0}
        loading={loading}
        className="mt-6 h-14 w-full rounded-2xl text-base font-bold"
        /*</WhiteBlock>*onClick={() => {
          alert('обробка оформлення...(буде реалізовано в наступних версіях)');
        }}*/
      >
        Підтвердити замовлення
      </Button>
    </WhiteBlock>
  );
};
