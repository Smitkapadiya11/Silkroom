import { z } from "zod";

export const COD_FEE_INR = 49;
export const CHECKOUT_ADDRESS_KEY = "silk-room-checkout-address-v1";

export const checkoutAddressSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .transform((value) => value.replace(/\D/g, "").slice(-10))
    .refine((value) => /^\d{10}$/.test(value), "Enter a valid 10-digit Indian mobile"),
  email: z.string().trim().email().optional().or(z.literal("")),
  addressLine1: z.string().trim().min(5).max(160),
  addressLine2: z.string().trim().max(160).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  pincode: z
    .string()
    .trim()
    .refine((value) => /^\d{6}$/.test(value), "Enter a valid 6-digit pincode"),
});

export const checkoutItemSchema = z.object({
  slug: z.string().min(1),
  size: z.string().min(1),
  color: z.string().min(1),
  quantity: z.number().int().min(1).max(10),
});

export type CheckoutAddress = z.infer<typeof checkoutAddressSchema>;
export type CheckoutItemInput = z.infer<typeof checkoutItemSchema>;
