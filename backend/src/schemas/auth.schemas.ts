import { z } from 'zod';

export const registerSchema = z.object({
    username: z
        .string()
        .trim()
        .min(2, 'Användarnamn måste vara minst 2 tecken'),

        email: z
        .string()
        .trim()
        .email('Ogiltig e-postadress'),

        password: z
        .string()
        .min(8, 'Lösenordet måste vara minst 8 tecken')
        .max(72, 'Lösenordet får vara maximalt 72 tecken'),
});

// ValideringsSchema för inloggnings-endpointen
export const loginSchema = z.object({
    email: z
    .string()
    .trim()
    .email('Ogiltig e-postadress'),

    password: z
    .string()
    .min(1, 'Lösenord måste fyllas i'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
