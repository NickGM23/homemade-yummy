import { InfoBlock } from '@/components/shared';

export default function UnauthorizedPage() {
  return (
    <div className="mt-40 flex flex-col items-center justify-center">
      <InfoBlock
        title="Доступ заборонено"
        text="Цю сторінку можуть переглядати лише авторизовані користувачі"
        imageUrl="/logo/lock.png"
      />
    </div>
  );
}
