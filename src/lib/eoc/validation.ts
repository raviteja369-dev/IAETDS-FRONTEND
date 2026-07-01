import { z } from "zod";

export const workflowSchema = z.object({
  name: z.string().trim().min(2, "Workflow name must be at least 2 characters"),
  trigger: z.string().trim().min(2, "Trigger is required"),
});

export const inviteMemberSchema = z.object({
  name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().email("Enter a valid email address"),
  role: z.string().trim().optional(),
  department: z.string().trim().optional(),
});

export const knowledgeDocSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
});

export const agentSchema = z.object({
  name: z.string().trim().min(2, "Agent name is required"),
  model: z.string().min(1, "Select a model"),
});

export const maintenanceSchema = z.object({
  title: z.string().trim().min(3, "Task title is required"),
  app: z.string().trim().min(2, "Application name is required"),
  type: z.enum(["scheduled", "predictive", "patch", "upgrade", "backup"]),
  risk: z.enum(["low", "medium", "high", "critical"]),
  window: z.string().trim().optional(),
});

export const appConfigSchema = z.object({
  owner: z.string().trim().min(2, "Owner is required"),
  environment: z.enum(["production", "staging", "development"]),
  licenseTotal: z.number({ message: "Enter a valid number" }).int().min(1, "At least 1 license seat required"),
  nextMaintenance: z.string().trim().optional(),
});

export const paymentSchema = z.object({
  amount: z.coerce.number().positive("Enter an amount greater than ₹0"),
  purpose: z.string().trim().min(3, "Purpose is required"),
  method: z.string().min(1, "Select a payment method"),
  mode: z.enum(["wallet", "payment"]),
});

export const settingsSchema = z.object({
  profileName: z.string().trim().min(2, "Name is required"),
  profileEmail: z.string().trim().email("Enter a valid email"),
  profileRole: z.string().trim().min(2, "Role is required"),
  workspaceName: z.string().trim().min(2, "Workspace name is required"),
  workspacePlan: z.string().trim().min(1, "Plan is required"),
  workspaceRegion: z.string().trim().min(1, "Region is required"),
  mfa: z.boolean(),
  sso: z.boolean(),
  sessionTimeout: z.boolean(),
  securityAlerts: z.boolean(),
  billingNotifications: z.boolean(),
  maintenanceNotifications: z.boolean(),
  productUpdates: z.boolean(),
  reducedMotion: z.boolean(),
  compactDensity: z.boolean(),
});

export const storageCapacitySchema = z.object({
  amount: z.number({ message: "Select a valid capacity amount" }).refine((n) => [1, 2, 5, 10].includes(n), "Select a valid capacity amount"),
});

export const marketplaceSubmitSchema = z.object({
  name: z.string().trim().min(2, "Application name is required"),
  email: z.string().trim().email("Enter a valid contact email"),
  description: z.string().trim().min(20, "Description must be at least 20 characters"),
});

export type WorkflowInput = z.infer<typeof workflowSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type KnowledgeDocInput = z.infer<typeof knowledgeDocSchema>;
export type AgentInput = z.infer<typeof agentSchema>;
export type MaintenanceInput = z.infer<typeof maintenanceSchema>;
export type AppConfigInput = z.infer<typeof appConfigSchema>;
export type PaymentInput = z.infer<typeof paymentSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
export type StorageCapacityInput = z.infer<typeof storageCapacitySchema>;
export type MarketplaceSubmitInput = z.infer<typeof marketplaceSubmitSchema>;
