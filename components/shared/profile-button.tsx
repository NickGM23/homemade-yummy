import { useSession } from 'next-auth/react';
import React from 'react';
import { Button } from '../ui/button';
import { CircleUser, User } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Props {
  onClickSignIn?: () => void;
  onClickProfile?: () => void;
  className?: string;
  isVisibleAll?: boolean;
  signButtonText?: string;
}

export const ProfileButton: React.FC<Props> = ({
  className,
  isVisibleAll,
  onClickSignIn,
  onClickProfile,
  signButtonText,
}) => {
  const { data: session } = useSession();

  return (
    <div className={className}>
      {!session ? (
        <Button
          onClick={onClickSignIn}
          variant="outline"
          className={
            !isVisibleAll
              ? 'hidden items-center gap-2 font-bold max-sm:hidden lg:flex [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300'
              : 'items-center gap-2 font-bold [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300'
          }
        >
          <User size={16} />
          {!signButtonText ? 'Увійти' : signButtonText}
        </Button>
      ) : (
        <Link href="/profile">
          <Button
            onClick={onClickProfile}
            variant="outline"
            className={
              !isVisibleAll
                ? 'hidden items-center gap-2 font-bold max-sm:hidden lg:flex [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300'
                : 'items-center gap-2 font-bold [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300'
            }
          >
            <CircleUser size={18} />
            Профіль
          </Button>
        </Link>
      )}
    </div>
  );
};
