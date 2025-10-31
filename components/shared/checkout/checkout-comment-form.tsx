import React from 'react';
import { WhiteBlock } from '../white-block';
import { FormInput } from '../form';

interface Props {
  className?: string;
}

export const CheckoutCommentForm: React.FC<Props> = ({ className }) => {
  return (
    <WhiteBlock title="3. Додаткова інформація" className={className}>
      <FormInput
        name="comment"
        className="text-base"
        placeholder="Коментар до замовлення (необов’язково)"
      />
    </WhiteBlock>
  );
};
