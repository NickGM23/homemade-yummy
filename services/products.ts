import { Product } from '@prisma/client';
import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';

export const search = async (query: string): Promise<Product[]> => {
  return (await axiosInstance.get<Product[]>(ApiRoutes.SEARCH_PRODUCTS, { params: { query } }))
    .data;
};

export const getByIds = async (ids: number[]): Promise<Product[]> => {
  return (await axiosInstance.post<Product[]>(ApiRoutes.GET_PRODUCTS_BY_IDS, { ids })).data;
};
