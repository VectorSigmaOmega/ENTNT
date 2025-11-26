import { z } from "zod";

export const jobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  status: z.enum(["active", "archived"]),
  tags: z.string().transform((val) => val.split(",").map((t) => t.trim()).filter(Boolean)),
});

export type JobFormData = z.infer<typeof jobSchema>;
export type JobFormInput = z.input<typeof jobSchema>;