import { fetchActiveProductGroupsWithProducts } from '@/server/productGroups';
import { NextResponse } from 'next/server';
import { withErrorHandling } from '@/server/withErrorHandling';

export const revalidate = 60;

async function getProductGroups() {
  return NextResponse.json(await fetchActiveProductGroupsWithProducts());
}

// Обгортка через хелпер
export const { GET } = withErrorHandling({
  GET: getProductGroups,
});
