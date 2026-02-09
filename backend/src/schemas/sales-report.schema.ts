import { z } from 'zod';

export const salesReportSchema = z.object({
  startDate: z.string().datetime('Start date must be a valid ISO date string'),
  endDate: z.string().datetime('End date must be a valid ISO date string'),
  customerId: z.string().optional(),
  userId: z.string().optional(),
});

export type SalesReportDto = z.infer<typeof salesReportSchema>;

export const validateSalesReport = (data: any): SalesReportDto => {
  return salesReportSchema.parse(data);
};
