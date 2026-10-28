import { z } from "zod";

// Mirrors the backend's AddressInput validator exactly (order.validation.ts) so client-side
// errors match what the server would reject.
export const addressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().trim().min(2, "Enter the recipient's full name").max(100),
  phone: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  line1: z.string().trim().min(2, "Enter the address").max(200),
  line2: z.string().trim().max(200).optional(),
  city: z.string().trim().min(2, "Enter a city").max(100),
  state: z.string().trim().min(2, "Enter a state").max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit pincode"),
  country: z.string().min(1),
});
export type AddressFormValues = z.infer<typeof addressSchema>;
