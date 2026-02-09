                                
import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().nonnegative(),
  costPrice: z.number().nonnegative(),
  stock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative().optional(),
  categoryId: z.string().uuid(),
});

export const UpdateProductSchema = CreateProductSchema.partial();
