import { z } from "zod";
import type { PropertyType } from "@/types";

const PROPERTY_TYPES = [
  "Apartment",
  "House",
  "Villa",
  "Condo",
  "Townhouse",
  "Land",
  "Commercial",
] as const satisfies readonly PropertyType[];

const locationSchema = z.object({
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
  lat: z.coerce.number({ invalid_type_error: "Click the map to set a location" }),
  lng: z.coerce.number({ invalid_type_error: "Click the map to set a location" }),
});




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
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
export type RegisterValues = z.infer<typeof registerSchema>;
export const createPropertySchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  priceEth: z.coerce.number().min(0).optional(),
  type: z.enum(PROPERTY_TYPES),
  listingType: z.enum(["sale", "rent"]),
  bedrooms: z.coerce.number().min(0),
  bathrooms: z.coerce.number().min(0),
  area: z.coerce.number().min(0),
  location: locationSchema,
  images: z.array(z.string()).min(1, "At least one image is required").max(10),
  imagePublicIds: z.array(z.string()).optional(),
});

// export const createPropertySchema = z.object({
//   title: z.string().min(3, "Title is required"),
//   description: z.string().min(20, "Add a longer description"),
//   price: z.coerce.number().positive("Enter a valid price"),
//   type: z.enum(["Apartment", "House", "Villa", "Condo", "Townhouse", "Land", "Commercial"], {
//     required_error: "Select a property type",
//   }),
//   listingType: z.enum(["sale", "rent"], {
//     required_error: "Select a listing type",
//   }),
//   bedrooms: z.coerce.number().min(0, "Minimum 0 bedrooms").max(20, "Maximum 20 bedrooms"),
//   bathrooms: z.coerce.number().min(0, "Minimum 0 bathrooms").max(20, "Maximum 20 bathrooms"),
//   area: z.coerce.number().positive("Enter a valid area"),
//   location: z.string().min(3, "Enter a location"),
//   priceEth: z.coerce.number().positive("Enter a valid ETH price").default(0.01),
//   images: z.array(z.string()).min(1, "At least one image is required").max(10, "Maximum 10 images"),
//   imagePublicIds: z.array(z.string()).optional(),
// });
export type CreatePropertyValues = z.infer<typeof createPropertySchema>;

export const transferSchema = z.object({
  newOwner: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/, "Enter a valid wallet address (0x...)"),
});
export type TransferValues = z.infer<typeof transferSchema>;
