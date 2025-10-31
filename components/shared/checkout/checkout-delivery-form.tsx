'use client';

import React from 'react';
import { WhiteBlock } from '../white-block';
import { RadioGroupCustom } from '@/components/ui/radio-group-custom';
import { FormInput } from '../form';
import { useFormContext, Controller } from 'react-hook-form';

interface Props {
  className?: string;
}

export const CheckoutDeliveryForm: React.FC<Props> = ({ className }) => {
  const { control, watch } = useFormContext();

  // спостерігаємо, що вибрав користувач
  const deliveryType = watch('deliveryType');

  return (
    <WhiteBlock title="2. Спосіб доставки" className={className}>
      {/* Вибір типу доставки */}
      <Controller
        name="deliveryType"
        control={control}
        defaultValue="pickup"
        render={({ field }) => (
          <RadioGroupCustom
            {...field}
            options={[
              { label: 'Самовивіз', value: 'pickup' },
              { label: 'Адресна доставка', value: 'address' },
            ]}
          />
        )}
      />

      {/* Поле для адреси — з’являється лише при виборі адресної доставки */}
      {deliveryType === 'address' && (
        <div className="mt-5">
          <FormInput name="address" className="text-base" placeholder="Вкажіть адресу доставки" />
        </div>
      )}
    </WhiteBlock>
  );
};
