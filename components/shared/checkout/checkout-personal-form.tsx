import React from 'react';
import { WhiteBlock } from '../white-block';
import { FormInput, FormInputWithMask } from '../form';

interface Props {
  className?: string;
}

export const CheckoutPersonalForm: React.FC<Props> = ({ className }) => {
  return (
    <WhiteBlock title="1. Контактна інформація" className={className}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <FormInput name="fullName" className="text-base" placeholder="Імя" />
        <FormInputWithMask name="phone" className="text-base" placeholder="Телефон" />
        <FormInput name="email" className="text-base" placeholder="E-mail адреса (необов’язково)" />
      </div>
    </WhiteBlock>
  );
};
