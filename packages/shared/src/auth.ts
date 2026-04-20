import { z } from 'zod';
import { bookingRecordSchema, vehicleCategorySchema, vehicleSchema } from './types';

export const authRoleOptions = ['ADMIN', 'CUSTOMER'] as const;
export const authTokenCookieName = 'auth-token' as const;
export const authSessionStatusOptions = ['ACTIVE', 'SIGNED_OUT'] as const;
export const authSessionCapabilityOptions = ['AUTH_WORKSPACE', 'BOOKING_WORKSPACE', 'PUBLIC_FLEET', 'ADMIN_DASHBOARD'] as const;

export const authRoleSchema = z.enum(authRoleOptions);
export const authSessionStatusSchema = z.enum(authSessionStatusOptions);
export const authSessionCapabilitySchema = z.enum(authSessionCapabilityOptions);

export type AuthRole = z.infer<typeof authRoleSchema>;

export function getAuthSessionCapabilities(role: AuthRole) {
  return role === 'ADMIN'
    ? ['AUTH_WORKSPACE', 'BOOKING_WORKSPACE', 'PUBLIC_FLEET', 'ADMIN_DASHBOARD']
    : ['AUTH_WORKSPACE', 'BOOKING_WORKSPACE', 'PUBLIC_FLEET'];
}

export function getAuthSessionPrimaryRoute(role: AuthRole) {
  return role === 'ADMIN' ? '#/admin' : '#/my-bookings';
}

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
  primaryRoute: z.string().min(1).default('#/'),
  capabilities: z.array(authSessionCapabilitySchema).default([]),
});

export type AuthSession = z.infer<typeof authSessionSchema>;

export function normalizeAuthSession(session: AuthSession): AuthSession {
  return authSessionSchema.parse({
    ...session,
    primaryRoute: session.primaryRoute || getAuthSessionPrimaryRoute(session.user.role),
    capabilities: session.capabilities.length ? session.capabilities : getAuthSessionCapabilities(session.user.role),
  });
}

export const authSessionResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    session: authSessionSchema,
  }),
});

export type AuthSessionResponse = z.infer<typeof authSessionResponseSchema>;

export const authProfileUpdateRequestSchema = z.object({
  displayName: z.string().min(2).max(80).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().min(5).max(30).optional(),
});

export type AuthProfileUpdateRequest = z.infer<typeof authProfileUpdateRequestSchema>;

export const authProfileUpdateResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    session: authSessionSchema,
  }),
});

export type AuthProfileUpdateResponse = z.infer<typeof authProfileUpdateResponseSchema>;

export const authSessionStateResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    session: authSessionSchema.nullable(),
  }),
});

export type AuthSessionStateResponse = z.infer<typeof authSessionStateResponseSchema>;

export const adminEmailRelaySettingsSchema = z.object({
  host: z.string().min(1),
  port: z.number().int().positive(),
  username: z.string().min(1),
  passwordConfigured: z.boolean(),
  secure: z.boolean(),
  notifyOnBookings: z.boolean(),
  recipientsCsv: z.string(),
  testEmail: z.string().email(),
  updatedAt: z.string(),
  lastTestAt: z.string().nullable(),
  lastTestStatus: z.enum(['PENDING', 'READY', 'FAILED']),
  lastTestMessage: z.string(),
});

export type AdminEmailRelaySettings = z.infer<typeof adminEmailRelaySettingsSchema>;

export const adminEmailRelaySettingsUpdateRequestSchema = z.object({
  host: z.string().min(1).max(255),
  port: z.coerce.number().int().positive().max(65535),
  username: z.string().min(1).max(255),
  password: z.string().max(255).optional().default(''),
  secure: z.coerce.boolean().default(false),
  notifyOnBookings: z.coerce.boolean().default(true),
  recipientsCsv: z.string().max(1000).default(''),
  testEmail: z.string().email(),
});

export type AdminEmailRelaySettingsUpdateRequest = z.infer<typeof adminEmailRelaySettingsUpdateRequestSchema>;

export const adminEmailRelaySettingsResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    settings: adminEmailRelaySettingsSchema,
  }),
});

export type AdminEmailRelaySettingsResponse = z.infer<typeof adminEmailRelaySettingsResponseSchema>;

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
  contactInquiries: z.number().int().nonnegative(),
  activeSessions: z.number().int().nonnegative(),
  adminSessions: z.number().int().nonnegative(),
  customerSessions: z.number().int().nonnegative(),
  totalBookingValue: z.number().nonnegative(),
  confirmedBookingValue: z.number().nonnegative(),
  pendingDepositValue: z.number().nonnegative(),
  averageBookingValue: z.number().nonnegative(),
  confirmationRate: z.number().min(0).max(100),
});

export type AdminDashboardSummary = z.infer<typeof adminDashboardSummarySchema>;

export const adminDashboardResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    generatedAt: z.string(),
    sessionUser: authUserSchema,
    summary: adminDashboardSummarySchema,
    vehicleCategories: z.array(adminDashboardCategorySummarySchema),
    featuredVehicles: z.array(vehicleSchema),
    latestBookings: z.array(bookingRecordSchema),
  }),
});

export type AdminDashboardResponse = z.infer<typeof adminDashboardResponseSchema>;
