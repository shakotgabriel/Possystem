import { z } from 'zod';

export const createStockAlertSchema = z.object({
  productId: z.string().uuid(),
  threshold: z.number().int().positive(),
  isActive: z.boolean().default(true),
  userId: z.string().uuid()
});

export const updateStockAlertSchema = z.object({
  threshold: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

export const createStockTransferSchema = z.object({
  fromProductId: z.string().uuid(),
  toProductId: z.string().uuid(),
  quantity: z.number().int().positive(),
  reason: z.string().min(1, 'Reason is required'),
  userId: z.string().uuid(),
});

export const createStockAdjustmentSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int(),
  reason: z.string().min(1, 'Reason is required'),
  userId: z.string().uuid(),
});

export const createStockCountSchema = z.object({
  productId: z.string().uuid(),
  countedStock: z.number().int(),
  userId: z.string().uuid(),
  updateStock: z.boolean().default(false),
});

export type CreateStockAlertInput = z.infer<typeof createStockAlertSchema>;
export type UpdateStockAlertInput = z.infer<typeof updateStockAlertSchema>;
export type CreateStockTransferInput = z.infer<typeof createStockTransferSchema>;
export type CreateStockAdjustmentInput = z.infer<typeof createStockAdjustmentSchema>;
export type CreateStockCountInput = z.infer<typeof createStockCountSchema>;
