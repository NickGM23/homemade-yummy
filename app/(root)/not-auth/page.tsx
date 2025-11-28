import { InfoBlock } from '@/components/shared';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <InfoBlock
        title="Доступ заборонено"
        text="Цю сторінку можуть переглядати лише авторизовані користувачі"
        imageUrl="/logo/lock.png"
      />
    </div>
  );
}
