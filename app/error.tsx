'use client';

import { useEffect } from 'react';
import { InfoBlock } from '@/components/shared/info-block';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <InfoBlock
        title="Щось пішло не так"
        text="Виникла помилка під час завантаження сторінки. Спробуйте оновити або поверніться на головну"
        onRefresh={reset}
      />
    </div>
  );
}
