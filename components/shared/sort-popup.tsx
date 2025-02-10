import React from 'react';

import { cn } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface Props {
  className?: string;
}

export const SortPopup: React.FC<Props> = ({ className }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'inline-flex h-[52px] cursor-pointer items-center gap-1 rounded-2xl bg-gray-50 px-5 py-4',
            className,
          )}
        >
          <ArrowUpDown className="h-4 w-4" />
          <b>Cортування:</b>

          <b className="text-primary">популярні</b>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[240px]">
        <ul>
          <li className="cursor-pointer rounded-md p-2 px-4 hover:bg-secondary hover:text-primary">
            Спочатку популярні
          </li>
          <li className="cursor-pointer rounded-md p-2 px-4 hover:bg-secondary hover:text-primary">
            Спочатку найдешевші
          </li>
          <li className="cursor-pointer rounded-md p-2 px-4 hover:bg-secondary hover:text-primary">
            Спочатку найдорожчі
          </li>
          {/* <li className="cursor-pointer rounded-md p-2 px-4 hover:bg-secondary hover:text-primary">
            З найкращою оцінкою
          </li> */}
        </ul>
      </PopoverContent>
    </Popover>
  );
};
