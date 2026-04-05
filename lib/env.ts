import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  DIRECT_URL: z.string().min(1).optional(),
  APP_URL: z.string().url().optional(),
  SESSION_SECRET: z.string().min(1).optional(),
  TRISTA_MAILBOX_HOST: z.string().min(1).optional(),
  TRISTA_SMTP_HOST: z.string().min(1).optional(),
  TRISTA_SMTP_PORT: z.coerce.number().int().positive().optional(),
  TRISTA_MAILBOX_USER: z.string().email().optional()
});

export const env = envSchema.parse({
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  APP_URL: process.env.APP_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  TRISTA_MAILBOX_HOST: process.env.TRISTA_MAILBOX_HOST,
  TRISTA_SMTP_HOST: process.env.TRISTA_SMTP_HOST,
  TRISTA_SMTP_PORT: process.env.TRISTA_SMTP_PORT,
  TRISTA_MAILBOX_USER: process.env.TRISTA_MAILBOX_USER
});
