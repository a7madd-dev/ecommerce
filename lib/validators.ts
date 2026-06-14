import { z } from "zod";

export const checkoutSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z
    .string()
    .min(7, "Phone must be at least 7 digits")
    .regex(/^[+]?[\d\s()-]+$/, "Invalid phone number format"),
  address: z.string().min(10, "Address must be at least 10 characters"),
});

export const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be positive"),
  compare_at_price: z.coerce.number().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  image_url: z.string().url("Must be a valid URL").or(z.literal("")),
  category_id: z.string().min(1, "Category is required"),
  is_active: z.coerce.boolean().optional().default(true),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
