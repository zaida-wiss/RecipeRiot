import { z } from "zod";

export const registerSchema = z.object ({
  username: z
  .string()
  .min(5, "Användarnamn måste ha minst 5 tecken")
  .max(50, "Användarnamn får inte överstiga 50 tecken")
  .trim(),
email: z
  .email("Ogiltig e-postadress")
  .trim()
  .toLowerCase(),
password: z
  .string()
  .min(8, "Lösenordet måste ha minst 8 tecken")
  .max(100, "Lösenordet är för långt"),
});


export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Användarnamn eller e-post är obligatoriskt")
    .max(100, "Användarnamn eller e-post är för långt")
    .trim(),
  password: z
    .string()
    .min(1, "Lösenord är obligatoriskt"),
});
