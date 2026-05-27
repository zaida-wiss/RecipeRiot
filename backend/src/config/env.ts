import 'dotenv/config';
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  MONGO_URI: z.string().url("MONGO_URI måste vara en giltig URL"),
  CORS_ORIGIN: z.string().url("CORS_ORIGIN måste vara ett giltigt URL"),
  JWT_SECRET: z.string().min(20, "JWT_SECRET måste vara minst 20 tecken."),
  JWT_EXPIRES_IN: z.string().default("1h"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().int().min(8).max(14).default(10),
});

export const env = envSchema.parse(process.env);