import { z } from 'zod';

export const inventoryReportSchema = z.object({
  categoryId: z.string().optional(),
  lowStockOnly: z.boolean().optional(),
});

export type InventoryReportDto = z.infer<typeof inventoryReportSchema>;

export const validateInventoryReport = (data: any): InventoryReportDto => {
  return inventoryReportSchema.parse(data);
};
