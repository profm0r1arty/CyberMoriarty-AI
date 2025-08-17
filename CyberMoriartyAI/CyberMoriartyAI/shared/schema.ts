import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, real, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vulnerabilities = pgTable("vulnerabilities", {
  id: varchar("id").primaryKey(),
  cveId: text("cve_id").notNull().unique(),
  description: text("description").notNull(),
  severity: text("severity").notNull(), // Critical, High, Medium, Low
  cvssScore: real("cvss_score"),
  product: text("product"),
  vendor: text("vendor"),
  publishedDate: timestamp("published_date"),
  updatedDate: timestamp("updated_date"),
  references: jsonb("references").$type<string[]>(),
  exploitAvailable: integer("exploit_available").default(0), // 0 = no, 1 = yes
  rawData: jsonb("raw_data").$type<Record<string, any>>(),
});

export const assessments = pgTable("assessments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vulnerabilityId: varchar("vulnerability_id").references(() => vulnerabilities.id),
  aiAnalysis: jsonb("ai_analysis").$type<{
    riskScore: number;
    exploitability: number;
    impactSeverity: string;
    recommendation: string;
    remediationAvailable: boolean;
    confidenceScore: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
  status: text("status").default("pending"), // pending, completed, failed
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  vulnerabilityIds: jsonb("vulnerability_ids").$type<string[]>(),
  assessmentIds: jsonb("assessment_ids").$type<string[]>(),
  generatedAt: timestamp("generated_at").defaultNow(),
  exportFormat: text("export_format").default("pdf"), // pdf, json, csv
  content: jsonb("content").$type<Record<string, any>>(),
});

export const exploitProjects = pgTable("exploit_projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  vulnerabilityType: text("vulnerability_type").notNull(),
  targetPlatform: text("target_platform").notNull(),
  code: text("code").notNull(),
  documentation: text("documentation"),
  status: text("status").default("draft"), // draft, testing, validated, archived
  authorizedTargets: jsonb("authorized_targets").$type<string[]>(),
  testingResults: jsonb("testing_results").$type<Record<string, any>>(),
  ethicalApproval: integer("ethical_approval").default(0), // 0 = no, 1 = yes
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertVulnerabilitySchema = createInsertSchema(vulnerabilities).omit({
  id: true,
});

export const insertAssessmentSchema = createInsertSchema(assessments).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  generatedAt: true,
});

export const insertExploitProjectSchema = createInsertSchema(exploitProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertVulnerability = z.infer<typeof insertVulnerabilitySchema>;
export type Vulnerability = typeof vulnerabilities.$inferSelect;
export type InsertAssessment = z.infer<typeof insertAssessmentSchema>;
export type Assessment = typeof assessments.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertExploitProject = z.infer<typeof insertExploitProjectSchema>;
export type ExploitProject = typeof exploitProjects.$inferSelect;

// Search and filter schemas
export const vulnerabilitySearchSchema = z.object({
  cveId: z.string().optional(),
  severity: z.enum(["Critical", "High", "Medium", "Low"]).optional(),
  product: z.string().optional(),
  vendor: z.string().optional(),
  cvssMin: z.number().min(0).max(10).optional(),
  cvssMax: z.number().min(0).max(10).optional(),
  hasExploit: z.boolean().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export type VulnerabilitySearch = z.infer<typeof vulnerabilitySearchSchema>;
