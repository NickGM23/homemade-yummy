import { Minus, Plus } from 'lucide-react';
import { CountButtonProps } from './count-button';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface IconButtonProps {
  size?: CountButtonProps['size'];
  disabled?: boolean;
  type?: 'plus' | 'minus';
  onClick?: () => void;
}

export const CountIconButton: React.FC<IconButtonProps> = ({
  size = 'sm',
  disabled,
  type,
  onClick,
}) => {
  const iconSizeClass = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <Button
      variant="outline"
      disabled={disabled}
      onClick={onClick}
      type="button"
      className={cn(
        'bg-white p-0 text-black', // фон білий, текст чорний
        'hover:bg-white hover:text-black', // hover: без змін
        'focus:bg-white focus:text-black', // focus: без змін
        'active:bg-white active:text-black', // active: без змін
        'ring-0 focus:ring-0', // без обводки
        'disabled:border-gray-400 disabled:bg-white disabled:text-gray-400', // стан disabled
        size === 'sm' ? 'h-[30px] w-[30px] rounded-[10px]' : 'h-[38px] w-[38px] rounded-md',
      )}
    >
      {type === 'plus' ? (
        <Plus stroke="currentColor" className={cn(iconSizeClass, 'stroke-[1.5] text-current')} />
      ) : (
        <Minus stroke="currentColor" className={cn(iconSizeClass, 'stroke-[1.5] text-current')} />
      )}
    </Button>
  );
};
