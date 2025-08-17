import { type Vulnerability, type InsertVulnerability, type Assessment, type InsertAssessment, type Report, type InsertReport, type ExploitProject, type InsertExploitProject, type VulnerabilitySearch } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Vulnerability operations
  getVulnerability(id: string): Promise<Vulnerability | undefined>;
  getVulnerabilityByCveId(cveId: string): Promise<Vulnerability | undefined>;
  createVulnerability(vulnerability: InsertVulnerability): Promise<Vulnerability>;
  updateVulnerability(id: string, vulnerability: Partial<InsertVulnerability>): Promise<Vulnerability | undefined>;
  searchVulnerabilities(search: VulnerabilitySearch): Promise<{ vulnerabilities: Vulnerability[], total: number }>;
  
  // Assessment operations
  getAssessment(id: string): Promise<Assessment | undefined>;
  getAssessmentsByVulnerabilityId(vulnerabilityId: string): Promise<Assessment[]>;
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  updateAssessment(id: string, assessment: Partial<InsertAssessment>): Promise<Assessment | undefined>;
  getLatestAssessments(limit: number): Promise<Assessment[]>;
  
  // Report operations
  getReport(id: string): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  getReports(limit: number, offset: number): Promise<{ reports: Report[], total: number }>;
  
  // Exploit Project operations
  getExploitProject(id: string): Promise<ExploitProject | undefined>;
  createExploitProject(project: InsertExploitProject): Promise<ExploitProject>;
  updateExploitProject(id: string, project: Partial<InsertExploitProject>): Promise<ExploitProject | undefined>;
  getExploitProjects(limit: number, offset: number): Promise<{ projects: ExploitProject[], total: number }>;
  
  // Stats operations
  getStats(): Promise<{
    totalVulnerabilities: number;
    criticalCount: number;
    assessmentsToday: number;
    systemsProtected: number;
  }>;
}

export class MemStorage implements IStorage {
  private vulnerabilities: Map<string, Vulnerability>;
  private assessments: Map<string, Assessment>;
  private reports: Map<string, Report>;
  private exploitProjects: Map<string, ExploitProject>;

  constructor() {
    this.vulnerabilities = new Map();
    this.assessments = new Map();
    this.reports = new Map();
    this.exploitProjects = new Map();
  }

  async getVulnerability(id: string): Promise<Vulnerability | undefined> {
    return this.vulnerabilities.get(id);
  }

  async getVulnerabilityByCveId(cveId: string): Promise<Vulnerability | undefined> {
    return Array.from(this.vulnerabilities.values()).find(v => v.cveId === cveId);
  }

  async createVulnerability(insertVulnerability: InsertVulnerability): Promise<Vulnerability> {
    const id = randomUUID();
    const vulnerability: Vulnerability = { 
      ...insertVulnerability, 
      id,
      cvssScore: insertVulnerability.cvssScore ?? null,
      product: insertVulnerability.product ?? null,
      vendor: insertVulnerability.vendor ?? null,
      publishedDate: insertVulnerability.publishedDate ?? null,
      updatedDate: insertVulnerability.updatedDate ?? null,
      references: insertVulnerability.references ?? null,
      exploitAvailable: insertVulnerability.exploitAvailable ?? null,
      rawData: insertVulnerability.rawData ?? null
    };
    this.vulnerabilities.set(id, vulnerability);
    return vulnerability;
  }

  async updateVulnerability(id: string, updates: Partial<InsertVulnerability>): Promise<Vulnerability | undefined> {
    const existing = this.vulnerabilities.get(id);
    if (!existing) return undefined;
    
    const updated: Vulnerability = { 
      ...existing, 
      ...updates,
      cvssScore: updates.cvssScore ?? existing.cvssScore,
      product: updates.product ?? existing.product,
      vendor: updates.vendor ?? existing.vendor,
      publishedDate: updates.publishedDate ?? existing.publishedDate,
      updatedDate: updates.updatedDate ?? existing.updatedDate,
      references: updates.references ? Array.isArray(updates.references) ? updates.references : null : existing.references,
      exploitAvailable: updates.exploitAvailable ?? existing.exploitAvailable,
      rawData: updates.rawData ?? existing.rawData
    };
    this.vulnerabilities.set(id, updated);
    return updated;
  }

  async searchVulnerabilities(search: VulnerabilitySearch): Promise<{ vulnerabilities: Vulnerability[], total: number }> {
    let filtered = Array.from(this.vulnerabilities.values());

    if (search.cveId) {
      filtered = filtered.filter(v => v.cveId.toLowerCase().includes(search.cveId!.toLowerCase()));
    }
    if (search.severity) {
      filtered = filtered.filter(v => v.severity === search.severity);
    }
    if (search.product) {
      filtered = filtered.filter(v => v.product?.toLowerCase().includes(search.product!.toLowerCase()));
    }
    if (search.vendor) {
      filtered = filtered.filter(v => v.vendor?.toLowerCase().includes(search.vendor!.toLowerCase()));
    }
    if (search.cvssMin !== undefined) {
      filtered = filtered.filter(v => v.cvssScore !== null && v.cvssScore >= search.cvssMin!);
    }
    if (search.cvssMax !== undefined) {
      filtered = filtered.filter(v => v.cvssScore !== null && v.cvssScore <= search.cvssMax!);
    }
    if (search.hasExploit !== undefined) {
      filtered = filtered.filter(v => Boolean(v.exploitAvailable) === search.hasExploit);
    }

    // Sort by severity and CVSS score
    filtered.sort((a, b) => {
      const severityOrder = { "Critical": 4, "High": 3, "Medium": 2, "Low": 1 };
      const aSeverity = severityOrder[a.severity as keyof typeof severityOrder] || 0;
      const bSeverity = severityOrder[b.severity as keyof typeof severityOrder] || 0;
      
      if (aSeverity !== bSeverity) return bSeverity - aSeverity;
      return (b.cvssScore || 0) - (a.cvssScore || 0);
    });

    const total = filtered.length;
    const vulnerabilities = filtered.slice(search.offset, search.offset + search.limit);
    
    return { vulnerabilities, total };
  }

  async getAssessment(id: string): Promise<Assessment | undefined> {
    return this.assessments.get(id);
  }

  async getAssessmentsByVulnerabilityId(vulnerabilityId: string): Promise<Assessment[]> {
    return Array.from(this.assessments.values()).filter(a => a.vulnerabilityId === vulnerabilityId);
  }

  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const id = randomUUID();
    const assessment: Assessment = { 
      ...insertAssessment, 
      id,
      status: insertAssessment.status ?? null,
      vulnerabilityId: insertAssessment.vulnerabilityId ?? null,
      aiAnalysis: insertAssessment.aiAnalysis ?? null,
      createdAt: new Date()
    };
    this.assessments.set(id, assessment);
    return assessment;
  }

  async updateAssessment(id: string, updates: Partial<InsertAssessment>): Promise<Assessment | undefined> {
    const existing = this.assessments.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.assessments.set(id, updated);
    return updated;
  }

  async getLatestAssessments(limit: number): Promise<Assessment[]> {
    return Array.from(this.assessments.values())
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
  }

  async getReport(id: string): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = { 
      ...insertReport, 
      id,
      content: insertReport.content ?? null,
      vulnerabilityIds: insertReport.vulnerabilityIds ? [...insertReport.vulnerabilityIds] : null,
      assessmentIds: insertReport.assessmentIds ? [...insertReport.assessmentIds] : null,
      exportFormat: insertReport.exportFormat ?? null,
      generatedAt: new Date()
    };
    this.reports.set(id, report);
    return report;
  }

  async getReports(limit: number, offset: number): Promise<{ reports: Report[], total: number }> {
    const allReports = Array.from(this.reports.values())
      .sort((a, b) => (b.generatedAt?.getTime() || 0) - (a.generatedAt?.getTime() || 0));
    
    const total = allReports.length;
    const reports = allReports.slice(offset, offset + limit);
    
    return { reports, total };
  }

  async getExploitProject(id: string): Promise<ExploitProject | undefined> {
    return this.exploitProjects.get(id);
  }

  async createExploitProject(insertProject: InsertExploitProject): Promise<ExploitProject> {
    const id = randomUUID();
    const project: ExploitProject = { 
      ...insertProject, 
      id,
      status: insertProject.status ?? "draft",
      documentation: insertProject.documentation ?? null,
      authorizedTargets: insertProject.authorizedTargets ? [...insertProject.authorizedTargets] : null,
      testingResults: insertProject.testingResults ?? null,
      ethicalApproval: insertProject.ethicalApproval ?? 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.exploitProjects.set(id, project);
    return project;
  }

  async updateExploitProject(id: string, updates: Partial<InsertExploitProject>): Promise<ExploitProject | undefined> {
    const existing = this.exploitProjects.get(id);
    if (!existing) return undefined;
    
    const updated: ExploitProject = { 
      ...existing, 
      ...updates,
      documentation: updates.documentation ?? existing.documentation,
      authorizedTargets: updates.authorizedTargets ? [...updates.authorizedTargets] : existing.authorizedTargets,
      testingResults: updates.testingResults ?? existing.testingResults,
      ethicalApproval: updates.ethicalApproval ?? existing.ethicalApproval,
      updatedAt: new Date()
    };
    this.exploitProjects.set(id, updated);
    return updated;
  }

  async getExploitProjects(limit: number, offset: number): Promise<{ projects: ExploitProject[], total: number }> {
    const allProjects = Array.from(this.exploitProjects.values())
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
    
    const total = allProjects.length;
    const projects = allProjects.slice(offset, offset + limit);
    
    return { projects, total };
  }

  async getStats(): Promise<{
    totalVulnerabilities: number;
    criticalCount: number;
    assessmentsToday: number;
    systemsProtected: number;
  }> {
    const totalVulnerabilities = this.vulnerabilities.size;
    const criticalCount = Array.from(this.vulnerabilities.values()).filter(v => v.severity === "Critical").length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const assessmentsToday = Array.from(this.assessments.values())
      .filter(a => a.createdAt && a.createdAt >= today).length;
    
    const systemsProtected = 42; // This would come from actual system configuration
    
    return {
      totalVulnerabilities,
      criticalCount,
      assessmentsToday,
      systemsProtected
    };
  }
}

export const storage = new MemStorage();
