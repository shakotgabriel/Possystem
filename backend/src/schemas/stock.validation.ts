                                     

import { z } from 'zod';

export const stockValidationSchema = z.object({
  productId: z.string().uuid(),                                           
  quantity: z.number().int().positive(),                                                
  userId: z.string().uuid(),                                        
});

export type StockInput = z.infer<typeof stockValidationSchema>;
