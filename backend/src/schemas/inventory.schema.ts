import { z } from 'zod';

export const createInventorySchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive(),
  userId: z.string().uuid(),
});

export const updateInventorySchema = z.object({
  quantity: z.number().int().positive(),
  userId: z.string().uuid(),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
