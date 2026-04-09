import { z } from 'zod';
import { bookingRecordSchema, vehicleCategorySchema } from './types';

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

export const adminDashboardCategorySummarySchema = z.object({
  category: vehicleCategorySchema,
  totalVehicles: z.number().int().nonnegative(),
  luxuryVehicles: z.number().int().nonnegative(),
});

export type AdminDashboardCategorySummary = z.infer<typeof adminDashboardCategorySummarySchema>;

export const adminDashboardSummarySchema = z.object({
  totalVehicles: z.number().int().nonnegative(),
  availableVehicles: z.number().int().nonnegative(),
  totalBookings: z.number().int().nonnegative(),
  pendingBookings: z.number().int().nonnegative(),
  confirmedBookings: z.number().int().nonnegative(),
  failedBookings: z.number().int().nonnegative(),
  activeSessions: z.number().int().nonnegative(),
  adminSessions: z.number().int().nonnegative(),
  customerSessions: z.number().int().nonnegative(),
});

export type AdminDashboardSummary = z.infer<typeof adminDashboardSummarySchema>;

export const adminDashboardResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    generatedAt: z.string(),
    sessionUser: authUserSchema,
    summary: adminDashboardSummarySchema,
    vehicleCategories: z.array(adminDashboardCategorySummarySchema),
    latestBookings: z.array(bookingRecordSchema),
  }),
});

export type AdminDashboardResponse = z.infer<typeof adminDashboardResponseSchema>;
