import { ProductGroup, Product } from '@prisma/client';
import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';

// Decimal-поля Prisma не можна передавати з Server у Client Components (і вони не JSON-числа),
// тому на межі сервера конвертуються в number.
export type ProductWithNumbers = Omit<Product, 'price' | 'minPartQuantity' | 'minQuantity'> & {
  price: number;
  minPartQuantity: number;
  minQuantity: number;
};

export type ProductGroupWithProducts = ProductGroup & {
  products: ProductWithNumbers[];
};

// Мінімум даних для навігації по категоріях (Header, бургер-меню, Categories) — без товарів.
export type CategoryItem = Pick<ProductGroup, 'id' | 'name' | 'codeGroup'>;

export const GetAllProductGroups = async (): Promise<ProductGroupWithProducts[]> => {
  return (await axiosInstance.get<ProductGroupWithProducts[]>(ApiRoutes.PRODUCT_GROUPS)).data;
};
