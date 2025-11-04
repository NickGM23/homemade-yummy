import React from 'react';
import { WhiteBlock } from '../white-block';
import { FormTextarea } from '../form';

interface Props {
  className?: string;
}

export const CheckoutCommentForm: React.FC<Props> = ({ className }) => {
  return (
    <WhiteBlock title="3. Додаткова інформація" className={className}>
      <FormTextarea
        name="comment"
        placeholder="Коментар до замовлення (необов’язково)"
        minRows={3}
        maxHeight={350}
      />
    </WhiteBlock>
  );
};
