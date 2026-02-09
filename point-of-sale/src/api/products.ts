import { api } from './index';

import type { Product } from '@/types/models'

export type CreateProductRequest = {
  name: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock?: number;
  categoryId: string;
};

export type UpdateProductRequest = Partial<CreateProductRequest>;

export const productsApi = {
  createProduct: async (
    product: CreateProductRequest,
  ) => {
    return api.post<Product>('/api/products', product);
  },

  getProducts: async () => {
    return api.get<Product[]>('/api/products');
  },

  getProduct: async (id: string) => {
    return api.get<Product>(`/api/products/${id}`);
  },

  updateProduct: async (id: string, product: UpdateProductRequest) => {
    return api.put<Product>(`/api/products/${id}`, product);
  },

  deleteProduct: async (id: string) => {
    return api.delete(`/api/products/${id}`);
  },
};
