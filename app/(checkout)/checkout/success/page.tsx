import { Container } from '@/components/shared/container';
import { Title } from '@/components/shared/title';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <Container className="mt-10 text-center">
      <Title text="Замовлення успішно оформлено!" className="mb-6 text-3xl" />
      <p className="mb-4">Дякуємо за ваше замовлення. Ми скоро його обробимо 📝</p>
      <Link href="/" className="text-blue-500 underline">
        Повернутися на головну
      </Link>
    </Container>
  );
}
