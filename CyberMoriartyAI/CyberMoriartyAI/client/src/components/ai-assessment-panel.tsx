import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, FileText, FlaskConical, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface AIAssessmentPanelProps {
  assessments?: any[];
  isLoading?: boolean;
}

export default function AIAssessmentPanel({ assessments = [], isLoading }: AIAssessmentPanelProps) {
  const latestAssessment = assessments?.[0];

  return (
    <>
      {/* AI Engine Status */}
      <Card className="bg-dark-800 border-dark-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">CyberMoriarty AI Engine</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse pulse-glow" data-testid="ai-status-indicator"></div>
              <span className="text-sm text-green-400">Active</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-dark-300">Processing Power</span>
            <span className="text-sm text-white font-medium" data-testid="processing-power">87%</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <span className="text-sm text-dark-300">Assessments Today</span>
            <span className="text-sm text-white font-medium" data-testid="assessments-today">
              {isLoading ? "..." : assessments.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-dark-300">Model Version</span>
            <span className="text-sm text-white font-medium">v2.1.4</span>
          </div>
        </CardContent>
      </Card>

      {/* Latest Assessment Results */}
      <Card className="bg-dark-800 border-dark-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Latest AI Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="p-4 text-center text-dark-400">Loading assessments...</div>
          ) : latestAssessment ? (
            <div className="space-y-4">
              <div className="p-4 bg-dark-700 rounded-lg" data-testid="latest-assessment">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white" data-testid="assessment-vulnerability">
                    {latestAssessment.vulnerabilityId || "Assessment"}
                  </span>
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs border",
                      latestAssessment.aiAnalysis?.riskScore >= 80 ? "severity-critical" :
                      latestAssessment.aiAnalysis?.riskScore >= 60 ? "severity-high" :
                      latestAssessment.aiAnalysis?.riskScore >= 40 ? "severity-medium" :
                      "severity-low"
                    )}
                    data-testid="assessment-risk-level"
                  >
                    {latestAssessment.aiAnalysis?.riskScore >= 80 ? "Critical Risk" :
                     latestAssessment.aiAnalysis?.riskScore >= 60 ? "High Risk" :
                     latestAssessment.aiAnalysis?.riskScore >= 40 ? "Medium Risk" :
                     "Low Risk"}
                  </Badge>
                </div>
                
                {latestAssessment.aiAnalysis ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-300">Risk Score</span>
                      <span className={cn("font-medium",
                        latestAssessment.aiAnalysis.riskScore >= 80 ? "text-red-400" :
                        latestAssessment.aiAnalysis.riskScore >= 60 ? "text-orange-400" :
                        latestAssessment.aiAnalysis.riskScore >= 40 ? "text-yellow-400" :
                        "text-green-400"
                      )} data-testid="risk-score">
                        {latestAssessment.aiAnalysis.riskScore}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-300">Exploitability</span>
                      <span className="text-red-400 font-medium" data-testid="exploitability">
                        {latestAssessment.aiAnalysis.exploitability}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-300">Impact Severity</span>
                      <span className="font-medium" data-testid="impact-severity">
                        {latestAssessment.aiAnalysis.impactSeverity}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-300">Remediation</span>
                      <span className={cn("font-medium",
                        latestAssessment.aiAnalysis.remediationAvailable ? "text-green-400" : "text-amber-400"
                      )} data-testid="remediation-status">
                        {latestAssessment.aiAnalysis.remediationAvailable ? "Available" : "Limited"}
                      </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-dark-600">
                      <p className="text-xs text-dark-400" data-testid="ai-recommendation">
                        AI Recommendation: {latestAssessment.aiAnalysis.recommendation}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-dark-400">
                    Status: {latestAssessment.status || "Pending analysis..."}
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  className="flex-1 bg-primary hover:bg-primary/90 text-white"
                  data-testid="button-generate-report"
                >
                  <FileText className="mr-1" size={14} />
                  Generate Report
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 bg-dark-700 hover:bg-dark-600 border-dark-600 text-dark-300 hover:text-white"
                  data-testid="button-test-exploit"
                >
                  <FlaskConical className="mr-1" size={14} />
                  Test Exploit
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-dark-400">
              <Brain className="mx-auto mb-2 text-dark-500" size={32} />
              <p>No assessments yet. Start by analyzing a vulnerability.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
