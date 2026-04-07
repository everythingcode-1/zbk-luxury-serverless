import { z } from 'zod';

export const authRoleOptions = ['ADMIN', 'CUSTOMER'] as const;
export const authSessionStatusOptions = ['ACTIVE', 'SIGNED_OUT'] as const;

export const authRoleSchema = z.enum(authRoleOptions);
export const authSessionStatusSchema = z.enum(authSessionStatusOptions);

export const authLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export type AuthLoginRequest = z.infer<typeof authLoginRequestSchema>;

export const authRegistrationRequestSchema = z.object({
  displayName: z.string().min(2).max(80),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().trim().min(5).max(30).optional(),
});

export type AuthRegistrationRequest = z.infer<typeof authRegistrationRequestSchema>;

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  role: authRoleSchema,
  phone: z.string().optional(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const authSessionSchema = z.object({
  token: z.string().min(16),
  status: authSessionStatusSchema,
  issuedAt: z.string(),
  expiresAt: z.string(),
  user: authUserSchema,
});

export type AuthSession = z.infer<typeof authSessionSchema>;

export const authSessionResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    session: authSessionSchema,
  }),
});

export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;

export const authSessionStateResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    session: authSessionSchema.nullable(),
  }),
});

export type AuthSessionStateResponse = z.infer<typeof authSessionStateResponseSchema>;

export const authLogoutResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    session: authSessionSchema.nullable(),
  }),
});

export type AuthLogoutResponse = z.infer<typeof authLogoutResponseSchema>;
