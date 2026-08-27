import { SITE } from "@config";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      author: z.string().default(SITE.author),
      pubDatetime: z.date(),
      modDatetime: z.date().optional().nullable(),
      title: z.string(),
      featured: z.boolean().optional(),
      draft: z.boolean().optional(),
      tags: z.array(z.string()).default(["others"]),
      ogImage: image()
        .refine(img => img.width >= 1200 && img.height >= 630, {
          message: "OpenGraph image must be at least 1200 X 630 pixels!",
        })
        .or(z.string())
        .optional(),
      description: z.string(),
      canonicalURL: z.string().optional(),
    }),
});

const products = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    sku: z.string(),
    price: z.number(),
    currency: z.string().default("TRY"),
    description: z.string().optional(),
    image: z.string().optional(),
    stock: z.number().int().nonnegative().default(0),
    available: z.boolean().default(true),
  }),
});

const orders = defineCollection({
  type: "content",
  schema: z.object({
    order_number: z.string(),
    customer_email: z.string().email(),
    status: z.enum([
      "pending_payment",
      "paid",
      "processing",
      "shipped",
      "completed",
      "cancelled",
    ]),
    total: z.number(),
    currency: z.string().default("TRY"),
    items: z.string(),
    shipping_address: z.string().optional(),
    created_at: z.coerce.date(),
  }),
});

export const collections = { blog, products, orders };
