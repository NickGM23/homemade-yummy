'use client';

import { useSession } from 'next-auth/react';
import React from 'react';
import Link from 'next/link';
import { CircleUser, User } from 'lucide-react';

import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { SignOutDialog } from './sign-out-dialog';

interface Props {
  onClickSignIn?: () => void;
  /** Викликається після вибору пункту меню (напр. щоб закрити бургер-меню). */
  onNavigate?: () => void;
  className?: string;
  isVisibleAll?: boolean;
  signButtonText?: string;
}

const buttonClassName = (isVisibleAll?: boolean) =>
  !isVisibleAll
    ? 'hidden items-center gap-2 font-bold max-sm:hidden lg:flex [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300'
    : 'items-center gap-2 font-bold [@media(any-hover:hover){&:hover}]:border-orange-600 [@media(any-hover:hover){&:hover}]:bg-green-300';

const menuItemClassName =
  'block w-full rounded-md px-3 py-2 text-left text-sm font-semibold text-slate-800 transition-colors hover:bg-secondary hover:text-primary focus-visible:bg-secondary focus-visible:outline-none';

export const ProfileButton: React.FC<Props> = ({
  className,
  isVisibleAll,
  onClickSignIn,
  onNavigate,
  signButtonText,
}) => {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [signOutOpen, setSignOutOpen] = React.useState(false);

  if (!session) {
    return (
      <div className={className}>
        <Button onClick={onClickSignIn} variant="outline" className={buttonClassName(isVisibleAll)}>
          <User size={16} />
          {!signButtonText ? 'Увійти' : signButtonText}
        </Button>
      </div>
    );
  }

  const closeMenu = () => {
    setMenuOpen(false);
    onNavigate?.();
  };

  return (
    <div className={className}>
      <Popover open={menuOpen} onOpenChange={setMenuOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className={buttonClassName(isVisibleAll)}>
            <CircleUser size={18} className="shrink-0" />
            <span className="max-w-[160px] truncate">{session.user?.fullName || 'Профіль'}</span>
          </Button>
        </PopoverTrigger>

        <PopoverContent align="end" className="w-40 p-2">
          <nav className="flex flex-col">
            <Link href="/profile" onClick={closeMenu} className={menuItemClassName}>
              Профіль
            </Link>
            <Link href="/orders" onClick={closeMenu} className={menuItemClassName}>
              Замовлення
            </Link>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setSignOutOpen(true);
              }}
              className={`${menuItemClassName} mt-4`}
            >
              Вийти
            </button>
          </nav>
        </PopoverContent>
      </Popover>

      <SignOutDialog open={signOutOpen} onClose={() => setSignOutOpen(false)} />
    </div>
  );
};
