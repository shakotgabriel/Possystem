                                    
import { z } from 'zod';

export const CreateTransactionSchema = z.object({
  customerId: z.string().uuid().optional(),
  userId: z.string().uuid(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
      totalPrice: z.number().nonnegative(),
    }),
  ),
});

export const PaymentSchema = z.object({
  saleId: z.string().uuid(),
  amount: z.number().nonnegative(),
  method: z.enum(['CASH']),
});
