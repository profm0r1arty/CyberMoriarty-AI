import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "" 
});

export interface AIRiskAssessment {
  riskScore: number; // 0-100
  exploitability: number; // 0-100
  impactSeverity: string; // Critical, High, Medium, Low
  recommendation: string;
  remediationAvailable: boolean;
  confidenceScore: number; // 0-1
}

export async function assessVulnerabilityRisk(vulnerability: {
  cveId: string;
  description: string;
  severity: string;
  cvssScore?: number | null;
  product?: string | null;
  vendor?: string | null;
}): Promise<AIRiskAssessment> {
  try {
    const prompt = `Analyze this cybersecurity vulnerability and provide a comprehensive risk assessment:

CVE ID: ${vulnerability.cveId}
Description: ${vulnerability.description}
Severity: ${vulnerability.severity}
CVSS Score: ${vulnerability.cvssScore || 'N/A'}
Product: ${vulnerability.product || 'N/A'}
Vendor: ${vulnerability.vendor || 'N/A'}

Provide a detailed risk assessment including:
1. Overall risk score (0-100)
2. Exploitability score (0-100) 
3. Impact severity classification
4. Specific remediation recommendations
5. Whether remediation is available
6. Your confidence in this assessment (0-1)

Consider factors like:
- Active exploitation in the wild
- Ease of exploitation
- Potential impact on confidentiality, integrity, availability
- Availability of patches or mitigations
- Attack vector complexity
- Authentication requirements

Respond with JSON in this exact format:
{
  "riskScore": number,
  "exploitability": number,
  "impactSeverity": "Critical" | "High" | "Medium" | "Low",
  "recommendation": "detailed recommendation text",
  "remediationAvailable": boolean,
  "confidenceScore": number
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are CyberMoriarty AI, an expert cybersecurity analysis engine specializing in vulnerability risk assessment. Provide accurate, actionable security analysis based on industry standards and threat intelligence."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Lower temperature for more consistent security analysis
    });

    const analysis = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      riskScore: Math.max(0, Math.min(100, analysis.riskScore || 0)),
      exploitability: Math.max(0, Math.min(100, analysis.exploitability || 0)),
      impactSeverity: analysis.impactSeverity || "Medium",
      recommendation: analysis.recommendation || "Further analysis required.",
      remediationAvailable: Boolean(analysis.remediationAvailable),
      confidenceScore: Math.max(0, Math.min(1, analysis.confidenceScore || 0.5))
    };
  } catch (error) {
    throw new Error(`Failed to assess vulnerability risk: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateVulnerabilityReport(vulnerabilities: any[], assessments: any[]): Promise<string> {
  try {
    const prompt = `Generate a comprehensive cybersecurity vulnerability assessment report based on the following data:

Vulnerabilities: ${JSON.stringify(vulnerabilities, null, 2)}
Assessments: ${JSON.stringify(assessments, null, 2)}

Create a professional security report that includes:
1. Executive Summary
2. Risk Overview and Statistics
3. Critical Findings
4. Detailed Vulnerability Analysis
5. Remediation Recommendations
6. Conclusion and Next Steps

Format as markdown for easy conversion to PDF.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are CyberMoriarty AI, generating professional cybersecurity assessment reports for security teams and executives."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.2,
    });

    return response.choices[0].message.content || "Report generation failed.";
  } catch (error) {
    throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
