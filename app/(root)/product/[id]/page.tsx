import { use } from 'react';
import { Container } from '@/components/shared/container';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Container>
      <p>Product {id}</p>
    </Container>
  );
}
