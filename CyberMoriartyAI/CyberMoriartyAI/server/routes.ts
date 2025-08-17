import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { vulnerabilitySearchSchema, insertAssessmentSchema, insertReportSchema, insertExploitProjectSchema } from "@shared/schema";
import { assessVulnerabilityRisk, generateVulnerabilityReport } from "./services/openai";
import { fetchCVEDetails, searchCVEs } from "./services/cve";
import { generateExploitCode, validateExploitCode, generateExploitDocumentation } from "./services/exploitGeneration";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard stats
  app.get("/api/stats", async (_req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Search vulnerabilities
  app.get("/api/vulnerabilities/search", async (req, res) => {
    try {
      const searchParams = vulnerabilitySearchSchema.parse(req.query);
      const result = await storage.searchVulnerabilities(searchParams);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: "Invalid search parameters" });
    }
  });

  // Get vulnerability by ID
  app.get("/api/vulnerabilities/:id", async (req, res) => {
    try {
      const vulnerability = await storage.getVulnerability(req.params.id);
      if (!vulnerability) {
        return res.status(404).json({ error: "Vulnerability not found" });
      }
      res.json(vulnerability);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vulnerability" });
    }
  });

  // Fetch CVE from external database
  app.post("/api/cves/fetch", async (req, res) => {
    try {
      const { cveId } = req.body;
      if (!cveId) {
        return res.status(400).json({ error: "CVE ID is required" });
      }

      // Check if we already have this CVE
      const existing = await storage.getVulnerabilityByCveId(cveId);
      if (existing) {
        return res.json(existing);
      }

      // Fetch from external API
      const cveDetails = await fetchCVEDetails(cveId);
      
      // Store in our database
      const vulnerability = await storage.createVulnerability({
        cveId: cveDetails.cveId,
        description: cveDetails.description,
        severity: cveDetails.severity,
        cvssScore: cveDetails.cvssScore,
        product: cveDetails.product,
        vendor: cveDetails.vendor,
        publishedDate: cveDetails.publishedDate,
        updatedDate: cveDetails.updatedDate,
        references: cveDetails.references,
        exploitAvailable: cveDetails.exploitAvailable ? 1 : 0,
        rawData: cveDetails.rawData
      });

      res.json(vulnerability);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to fetch CVE" });
    }
  });

  // Search external CVE database
  app.post("/api/cves/search", async (req, res) => {
    try {
      const { keyword, severity, startDate, endDate, resultsPerPage, startIndex } = req.body;
      
      const searchQuery = {
        keyword,
        severity,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        resultsPerPage: resultsPerPage || 20,
        startIndex: startIndex || 0
      };

      const results = await searchCVEs(searchQuery);
      
      // Store new CVEs in our database
      const storedCves = [];
      for (const cve of results.cves) {
        const existing = await storage.getVulnerabilityByCveId(cve.cveId);
        if (!existing) {
          const stored = await storage.createVulnerability({
            cveId: cve.cveId,
            description: cve.description,
            severity: cve.severity,
            cvssScore: cve.cvssScore,
            product: cve.product,
            vendor: cve.vendor,
            publishedDate: cve.publishedDate,
            updatedDate: cve.updatedDate,
            references: cve.references,
            exploitAvailable: cve.exploitAvailable ? 1 : 0,
            rawData: cve.rawData
          });
          storedCves.push(stored);
        } else {
          storedCves.push(existing);
        }
      }

      res.json({
        vulnerabilities: storedCves,
        totalResults: results.totalResults
      });
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to search CVEs" });
    }
  });

  // Create AI assessment
  app.post("/api/assessments", async (req, res) => {
    try {
      const assessmentData = insertAssessmentSchema.parse(req.body);
      
      if (!assessmentData.vulnerabilityId) {
        return res.status(400).json({ error: "Vulnerability ID is required" });
      }

      const vulnerability = await storage.getVulnerability(assessmentData.vulnerabilityId);
      if (!vulnerability) {
        return res.status(404).json({ error: "Vulnerability not found" });
      }

      // Create initial assessment
      const assessment = await storage.createAssessment({
        ...assessmentData,
        status: "pending"
      });

      // Run AI analysis asynchronously
      try {
        const aiAnalysis = await assessVulnerabilityRisk({
          cveId: vulnerability.cveId,
          description: vulnerability.description,
          severity: vulnerability.severity,
          cvssScore: vulnerability.cvssScore,
          product: vulnerability.product,
          vendor: vulnerability.vendor
        });

        // Update assessment with AI results
        await storage.updateAssessment(assessment.id, {
          aiAnalysis,
          status: "completed"
        });

        const updatedAssessment = await storage.getAssessment(assessment.id);
        res.json(updatedAssessment);
      } catch (aiError) {
        await storage.updateAssessment(assessment.id, {
          status: "failed"
        });
        throw aiError;
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create assessment" });
    }
  });

  // Get assessment by ID
  app.get("/api/assessments/:id", async (req, res) => {
    try {
      const assessment = await storage.getAssessment(req.params.id);
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.json(assessment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessment" });
    }
  });

  // Get assessments for a vulnerability
  app.get("/api/vulnerabilities/:id/assessments", async (req, res) => {
    try {
      const assessments = await storage.getAssessmentsByVulnerabilityId(req.params.id);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  // Get latest assessments
  app.get("/api/assessments", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const assessments = await storage.getLatestAssessments(limit);
      res.json(assessments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch assessments" });
    }
  });

  // Generate report
  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      
      // Fetch vulnerabilities and assessments for the report
      const vulnerabilities = [];
      const assessments = [];
      
      if (reportData.vulnerabilityIds) {
        for (const id of reportData.vulnerabilityIds) {
          const vuln = await storage.getVulnerability(id);
          if (vuln) vulnerabilities.push(vuln);
        }
      }
      
      if (reportData.assessmentIds) {
        for (const id of reportData.assessmentIds) {
          const assessment = await storage.getAssessment(id);
          if (assessment) assessments.push(assessment);
        }
      }

      // Generate report content using AI
      const reportContent = await generateVulnerabilityReport(vulnerabilities, assessments);
      
      const report = await storage.createReport({
        ...reportData,
        content: {
          markdown: reportContent,
          vulnerabilities: vulnerabilities,
          assessments: assessments,
          generatedBy: "CyberMoriarty AI"
        }
      });

      res.json(report);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate report" });
    }
  });

  // Get reports
  app.get("/api/reports", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await storage.getReports(limit, offset);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  // Get report by ID
  app.get("/api/reports/:id", async (req, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });

  // Exploit Development Routes
  
  // Generate exploit code
  app.post("/api/exploits/generate", async (req, res) => {
    try {
      const { vulnerabilityType, targetPlatform, description } = req.body;
      
      if (!vulnerabilityType || !targetPlatform) {
        return res.status(400).json({ error: "Missing vulnerability type or target platform" });
      }

      const result = await generateExploitCode({
        vulnerabilityType,
        targetPlatform,
        description: description || `Generate exploit for ${vulnerabilityType} on ${targetPlatform}`,
        includeComments: true
      });

      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to generate exploit code" });
    }
  });

  // Validate exploit code
  app.post("/api/exploits/validate", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Missing exploit code" });
      }

      const validation = await validateExploitCode(code);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate exploit code" });
    }
  });

  // Create exploit project
  app.post("/api/exploits/projects", async (req, res) => {
    try {
      const projectData = insertExploitProjectSchema.parse(req.body);
      
      // Validate required ethical approval
      if (!projectData.ethicalApproval) {
        return res.status(400).json({ error: "Ethical approval is required for exploit projects" });
      }

      const project = await storage.createExploitProject(projectData);
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : "Failed to create exploit project" });
    }
  });

  // Get exploit projects
  app.get("/api/exploits/projects", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const result = await storage.getExploitProjects(limit, offset);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exploit projects" });
    }
  });

  // Get exploit project by ID
  app.get("/api/exploits/projects/:id", async (req, res) => {
    try {
      const project = await storage.getExploitProject(req.params.id);
      if (!project) {
        return res.status(404).json({ error: "Exploit project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch exploit project" });
    }
  });

  // Update exploit project
  app.patch("/api/exploits/projects/:id", async (req, res) => {
    try {
      const updates = req.body;
      const project = await storage.updateExploitProject(req.params.id, updates);
      if (!project) {
        return res.status(404).json({ error: "Exploit project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ error: "Failed to update exploit project" });
    }
  });

  // Generate documentation for exploit
  app.post("/api/exploits/documentation", async (req, res) => {
    try {
      const { code, name, vulnerabilityType, targetPlatform } = req.body;
      
      if (!code || !name) {
        return res.status(400).json({ error: "Missing code or project name" });
      }

      const documentation = await generateExploitDocumentation(code, {
        name,
        vulnerabilityType: vulnerabilityType || "Unknown",
        targetPlatform: targetPlatform || "Unknown"
      });

      res.json({ documentation });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate documentation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
