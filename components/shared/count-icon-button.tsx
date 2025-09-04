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
        'group p-0 transition-colors duration-150 ease-in-out',
        'hover:bg-primary hover:text-white',
        'ring-0 focus:bg-transparent focus:ring-0 active:bg-transparent',
        'disabled:border-gray-400 disabled:bg-white disabled:text-gray-400',
        size === 'sm' ? 'h-[30px] w-[30px] rounded-[10px]' : 'h-[38px] w-[38px] rounded-md',
      )}
    >
      {type === 'plus' ? (
        <Plus
          stroke="currentColor"
          className={cn(
            iconSizeClass,
            'stroke-[1.5] text-gray-800 group-hover:text-white group-disabled:text-gray-400',
          )}
        />
      ) : (
        <Minus
          stroke="currentColor"
          className={cn(
            iconSizeClass,
            'stroke-[1.5] text-gray-800 group-hover:text-white group-disabled:text-gray-400',
          )}
        />
      )}
    </Button>
  );
};
