import { ProductGroup } from '@prisma/client';
import { Unit } from '@prisma/client';

export interface SerializedProductWithProductGroup {
  id: number;
  productGroupId: number;
  name: string;
  description?: string | null;
  aliasForSearch: string;
  price: number;
  unit: Unit;
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
