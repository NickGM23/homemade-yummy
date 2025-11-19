import { ProductGroup } from '@prisma/client';

export interface SerializedProductWithProductGroup {
  id: number;
  productGroupId: number;
  name: string;
  aliasForSearch: string;
  price: number;
  unitWeight: string;
  minPartQuantity: number;
  minQuantity: number;
  imageUrl?: string | null;
  positionNumber: number;
  type: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  productGroup: ProductGroup;
}
