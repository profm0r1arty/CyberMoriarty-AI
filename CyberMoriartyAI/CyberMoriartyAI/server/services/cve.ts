export interface CVEDetails {
  cveId: string;
  description: string;
  severity: string;
  cvssScore?: number;
  product?: string;
  vendor?: string;
  publishedDate?: Date;
  updatedDate?: Date;
  references: string[];
  exploitAvailable: boolean;
  rawData: Record<string, any>;
}

export async function fetchCVEDetails(cveId: string): Promise<CVEDetails> {
  try {
    // Use the official NIST NVD API
    const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?cveId=${cveId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch CVE data: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.vulnerabilities || data.vulnerabilities.length === 0) {
      throw new Error(`CVE ${cveId} not found`);
    }

    const cve = data.vulnerabilities[0].cve;
    
    // Extract CVSS score and severity
    let cvssScore: number | undefined;
    let severity = "Unknown";
    
    if (cve.metrics?.cvssMetricV31?.[0]) {
      const cvss = cve.metrics.cvssMetricV31[0];
      cvssScore = cvss.cvssData.baseScore;
      severity = cvss.cvssData.baseSeverity;
    } else if (cve.metrics?.cvssMetricV30?.[0]) {
      const cvss = cve.metrics.cvssMetricV30[0];
      cvssScore = cvss.cvssData.baseScore;
      severity = cvss.cvssData.baseSeverity;
    } else if (cve.metrics?.cvssMetricV2?.[0]) {
      const cvss = cve.metrics.cvssMetricV2[0];
      cvssScore = cvss.cvssData.baseScore;
      // Map CVSS v2 to v3 severity
      if (cvssScore && cvssScore >= 9.0) severity = "CRITICAL";
      else if (cvssScore && cvssScore >= 7.0) severity = "HIGH";
      else if (cvssScore && cvssScore >= 4.0) severity = "MEDIUM";
      else severity = "LOW";
    }

    // Normalize severity
    severity = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();

    // Extract description
    const description = cve.descriptions?.find((d: any) => d.lang === "en")?.value || "No description available";

    // Extract references
    const references = cve.references?.map((ref: any) => ref.url) || [];

    // Extract vendor/product info
    let vendor: string | undefined;
    let product: string | undefined;
    
    if (cve.configurations?.nodes?.[0]?.cpeMatch?.[0]) {
      const cpe = cve.configurations.nodes[0].cpeMatch[0].criteria;
      const cpeParts = cpe.split(':');
      if (cpeParts.length >= 4) {
        vendor = cpeParts[3];
        product = cpeParts[4];
      }
    }

    return {
      cveId,
      description,
      severity,
      cvssScore,
      product,
      vendor,
      publishedDate: cve.published ? new Date(cve.published) : undefined,
      updatedDate: cve.lastModified ? new Date(cve.lastModified) : undefined,
      references,
      exploitAvailable: false, // Would need additional exploit database lookup
      rawData: cve
    };
  } catch (error) {
    throw new Error(`Failed to fetch CVE details: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function searchCVEs(query: {
  keyword?: string;
  severity?: string;
  startDate?: Date;
  endDate?: Date;
  resultsPerPage?: number;
  startIndex?: number;
}): Promise<{ cves: CVEDetails[], totalResults: number }> {
  try {
    const params = new URLSearchParams();
    
    if (query.keyword) {
      params.append('keywordSearch', query.keyword);
    }
    
    if (query.severity) {
      params.append('cvssV3Severity', query.severity.toUpperCase());
    }
    
    if (query.startDate) {
      params.append('pubStartDate', query.startDate.toISOString().split('T')[0] + 'T00:00:00.000');
    }
    
    if (query.endDate) {
      params.append('pubEndDate', query.endDate.toISOString().split('T')[0] + 'T23:59:59.999');
    }
    
    params.append('resultsPerPage', (query.resultsPerPage || 20).toString());
    params.append('startIndex', (query.startIndex || 0).toString());

    const response = await fetch(`https://services.nvd.nist.gov/rest/json/cves/2.0?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to search CVEs: ${response.statusText}`);
    }

    const data = await response.json();
    
    const cves: CVEDetails[] = [];
    
    for (const vuln of data.vulnerabilities || []) {
      const cve = vuln.cve;
      
      // Extract basic info
      let cvssScore: number | undefined;
      let severity = "Unknown";
      
      if (cve.metrics?.cvssMetricV31?.[0]) {
        const cvss = cve.metrics.cvssMetricV31[0];
        cvssScore = cvss.cvssData.baseScore;
        severity = cvss.cvssData.baseSeverity;
      } else if (cve.metrics?.cvssMetricV30?.[0]) {
        const cvss = cve.metrics.cvssMetricV30[0];
        cvssScore = cvss.cvssData.baseScore;
        severity = cvss.cvssData.baseSeverity;
      }

      severity = severity.charAt(0).toUpperCase() + severity.slice(1).toLowerCase();

      const description = cve.descriptions?.find((d: any) => d.lang === "en")?.value || "No description available";
      const references = cve.references?.map((ref: any) => ref.url) || [];

      let vendor: string | undefined;
      let product: string | undefined;
      
      if (cve.configurations?.nodes?.[0]?.cpeMatch?.[0]) {
        const cpe = cve.configurations.nodes[0].cpeMatch[0].criteria;
        const cpeParts = cpe.split(':');
        if (cpeParts.length >= 4) {
          vendor = cpeParts[3];
          product = cpeParts[4];
        }
      }

      cves.push({
        cveId: cve.id,
        description,
        severity,
        cvssScore,
        product,
        vendor,
        publishedDate: cve.published ? new Date(cve.published) : undefined,
        updatedDate: cve.lastModified ? new Date(cve.lastModified) : undefined,
        references,
        exploitAvailable: false,
        rawData: cve
      });
    }

    return {
      cves,
      totalResults: data.totalResults || 0
    };
  } catch (error) {
    throw new Error(`Failed to search CVEs: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
