import React from 'react';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';
import { Title } from './title';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  title: string;
  text: string;
  className?: string;
  imageUrl?: string;
}

export const InfoBlock: React.FC<Props> = ({ className, title, text, imageUrl }) => {
  return (
    <div
      className={cn(
        className,
        `flex flex-col items-center gap-6 px-4 text-center md:w-[840px] md:flex-row md:items-start md:justify-between md:gap-12 md:text-left`,
      )}
    >
      {/* TEXT BLOCK */}
      <div className="flex max-w-full flex-col md:max-w-[445px]">
        <Title size="lg" text={title} className="font-extrabold" />
        <p className="mt-2 text-base text-gray-400 md:text-lg">{text}</p>

        <div className="mt-6 flex flex-col gap-4 md:mt-11 md:flex-row md:gap-5">
          <Link href="/">
            <Button variant="outline" className="w-full gap-2 md:w-auto">
              <ArrowLeft />
              На головну
            </Button>
          </Link>

          <button className="w-full md:w-auto">
            <Button
              variant="outline"
              className="w-full border-gray-400 text-gray-500 hover:bg-gray-50 md:w-auto"
            >
              Оновити
            </Button>
          </button>
        </div>
      </div>

      {/* IMAGE */}
      {imageUrl && <img src={imageUrl} alt={title} className="h-auto w-40 md:w-[300px]" />}
    </div>
  );
};
