import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { SITE } from "@config";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
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

const categories = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/categories" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      description: z.string().optional(),
      // Absolute public URLs (e.g. /assets/x.jpg uploaded via the CMS) stay
      // plain strings; relative paths are resolved and optimized by image().
      image: z.string().startsWith("/").or(image()).optional(),
    }),
});

const products = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/products" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      sku: z.string(),
      price: z.number(),
      currency: z.string().default("TRY"),
      description: z.string().optional(),
      image: z.string().startsWith("/").or(image()).optional(),
      stock: z.number().int().nonnegative().default(0),
      available: z.boolean().default(true),
      categories: z.array(z.string()).default([]),
    }),
});

const orders = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/orders" }),
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

export const collections = { blog, categories, products, orders };
