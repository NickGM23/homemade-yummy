import { ProductGroup, Product } from '@prisma/client';
import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';

export type ProductGroupWithProducts = ProductGroup & {
  products: Product[];
};

export const GetAllProductGroups = async (): Promise<ProductGroupWithProducts[]> => {
  return (await axiosInstance.get<ProductGroupWithProducts[]>(ApiRoutes.PRODUCT_GROUPS)).data;
};
