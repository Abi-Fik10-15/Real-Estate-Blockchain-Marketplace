import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    role: z.enum(["owner", "agent", "buyer"], {
      required_error: "Select a role",
    }),
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    phone: z.string().min(7, "Enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;

export const createPropertySchema = z.object({
  title: z.string().min(3, "Title is required"),
  description: z.string().min(20, "Add a longer description"),
  price: z.coerce.number().positive("Enter a valid price"),
  type: z.enum(["Apartment", "House", "Villa", "Condo", "Townhouse", "Land", "Commercial"]),
  bedrooms: z.coerce.number().min(0).max(20),
  bathrooms: z.coerce.number().min(0).max(20),
  area: z.coerce.number().positive("Enter a valid area"),
  location: z.string().min(3, "Enter a location"),
});
export type CreatePropertyValues = z.infer<typeof createPropertySchema>;

export const transferSchema = z.object({
  newOwner: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid wallet address (0x...)"),
});
export type TransferValues = z.infer<typeof transferSchema>;
