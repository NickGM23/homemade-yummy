import { ProductGroup } from '@prisma/client';

export interface SerializedProductWithProductGroup {
  id: number;
  productGroupId: number;
  name: string;
  aliasForSearch: string;
  price: number; // number замість Decimal
  unitWeight: string;
  minPartQuantity: number; // number замість Decimal
  minQuantity: number; // number замість Decimal
  imageUrl?: string | null;
  positionNumber: number;
  type: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  productGroup: ProductGroup;
}
