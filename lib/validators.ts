import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),

  // Validate price as a string matching number format
  price: z.string()
    .min(1, { message: 'Price is required' })
    .regex(/^\d+(\.\d{1,2})?$/, { message: 'Price must be a valid number (e.g., 10 or 10.99)' })
    .refine(val => parseFloat(val) >= 0.01, { message: 'Price must be positive' }), // Add refine check for minimum value

  category: z.string().min(2, { message: 'Category is required' }),

  // Validate inventory as a string matching integer format
  inventory: z.string()
    .min(1, { message: 'Inventory is required' })
    .regex(/^\d+$/, { message: 'Inventory must be a whole number' })
    .refine(val => parseInt(val, 10) >= 0, { message: 'Inventory cannot be negative' }), // Add refine check for minimum value


  imageUrl: z.string().url({ message: "Must be a valid URL" }).optional().or(z.literal('')),
});

// NOTE: ProductFormData will infer price and inventory as strings here
export type ProductFormData = z.infer<typeof productSchema>;

// Define a type for the data *after* conversion, to be sent to the API
export type ProductApiPayload = Omit<ProductFormData, 'price' | 'inventory'> & {
    price: number;
    inventory: number;
    imageUrl?: string; 
};