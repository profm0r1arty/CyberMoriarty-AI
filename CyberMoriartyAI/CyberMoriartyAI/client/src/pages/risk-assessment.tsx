import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Brain, Shield, AlertTriangle, TrendingUp, FileText, Play, Pause, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import VulnerabilityModal from "@/components/vulnerability-modal";

export default function RiskAssessment() {
  const [selectedVulnerabilities, setSelectedVulnerabilities] = useState<string[]>([]);
  const [selectedVulnerability, setSelectedVulnerability] = useState<any>(null);
  const [assessmentConfig, setAssessmentConfig] = useState({
    depth: "standard",
    includeExploits: true,
    includeRemediation: true,
    reportFormat: "comprehensive"
  });
  const queryClient = useQueryClient();

  // Fetch vulnerabilities for assessment
  const { data: vulnerabilityData, isLoading: vulnLoading } = useQuery({
    queryKey: ["/api/vulnerabilities/search"],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "50",
        offset: "0"
      });
      const response = await fetch(`/api/vulnerabilities/search?${params}`);
      if (!response.ok) throw new Error("Failed to fetch vulnerabilities");
      return response.json();
    }
  });

  // Fetch recent assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/assessments"],
    queryFn: async () => {
      const response = await fetch("/api/assessments?limit=10");
      if (!response.ok) throw new Error("Failed to fetch assessments");
      return response.json();
    }
  });

  // Create bulk assessment mutation
  const bulkAssessmentMutation = useMutation({
    mutationFn: async (vulnerabilityIds: string[]) => {
      const assessmentPromises = vulnerabilityIds.map(id => 
        fetch("/api/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vulnerabilityId: id, status: "pending" })
        }).then(res => res.json())
      );
      return Promise.all(assessmentPromises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({
        title: "Assessment Started",
        description: `CyberMoriarty AI is analyzing ${selectedVulnerabilities.length} vulnerabilities...`,
      });
      setSelectedVulnerabilities([]);
    },
    onError: () => {
      toast({
        title: "Assessment Failed",
        description: "Failed to start bulk vulnerability assessment.",
        variant: "destructive",
      });
    }
  });

  const handleVulnerabilityToggle = (vulnId: string) => {
    setSelectedVulnerabilities(prev => 
      prev.includes(vulnId) 
        ? prev.filter(id => id !== vulnId)
        : [...prev, vulnId]
    );
  };

  const handleBulkAssessment = () => {
    if (selectedVulnerabilities.length === 0) {
      toast({
        title: "No vulnerabilities selected",
        description: "Please select at least one vulnerability for assessment.",
        variant: "destructive",
      });
      return;
    }
    bulkAssessmentMutation.mutate(selectedVulnerabilities);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'severity-critical';
      case 'high':
        return 'severity-high';
      case 'medium':
        return 'severity-medium';
      case 'low':
        return 'severity-low';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRiskLevelColor = (score: number) => {
    if (score >= 80) return 'text-red-400';
    if (score >= 60) return 'text-orange-400';
    if (score >= 40) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="min-h-screen bg-dark-900 text-dark-50">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Risk Assessment</h2>
            <p className="text-dark-300 mt-1">AI-powered comprehensive vulnerability risk analysis and scoring</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-sm text-dark-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>CyberMoriarty AI Active</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assessment Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Configuration Panel */}
            <Card className="bg-dark-800 border-dark-700">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-white flex items-center">
                  <Shield className="mr-2" size={20} />
                  Assessment Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-dark-300 mb-2">Assessment Depth</Label>
                    <Select 
                      value={assessmentConfig.depth} 
                      onValueChange={(value) => setAssessmentConfig(prev => ({ ...prev, depth: value }))}
                    >
                      <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-depth">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-700 border-dark-600">
                        <SelectItem value="basic">Basic Analysis</SelectItem>
                        <SelectItem value="standard">Standard Assessment</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive Review</SelectItem>
                        <SelectItem value="deep">Deep Threat Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-dark-300 mb-2">Report Format</Label>
                    <Select 
                      value={assessmentConfig.reportFormat} 
                      onValueChange={(value) => setAssessmentConfig(prev => ({ ...prev, reportFormat: value }))}
                    >
                      <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-format">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-700 border-dark-600">
                        <SelectItem value="executive">Executive Summary</SelectItem>
                        <SelectItem value="technical">Technical Report</SelectItem>
                        <SelectItem value="comprehensive">Comprehensive Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assessmentConfig.includeExploits}
                        onChange={(e) => setAssessmentConfig(prev => ({ ...prev, includeExploits: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-dark-700 border-dark-600 rounded focus:ring-primary"
                        data-testid="checkbox-exploits"
                      />
                      <span className="text-dark-300 text-sm">Include exploit analysis</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={assessmentConfig.includeRemediation}
                        onChange={(e) => setAssessmentConfig(prev => ({ ...prev, includeRemediation: e.target.checked }))}
                        className="w-4 h-4 text-primary bg-dark-700 border-dark-600 rounded focus:ring-primary"
                        data-testid="checkbox-remediation"
                      />
                      <span className="text-dark-300 text-sm">Include remediation guidance</span>
                    </label>
                  </div>
                  <Button
                    onClick={handleBulkAssessment}
                    disabled={selectedVulnerabilities.length === 0 || bulkAssessmentMutation.isPending}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-start-assessment"
                  >
                    <Brain className="mr-2" size={16} />
                    {bulkAssessmentMutation.isPending ? "Starting..." : `Assess ${selectedVulnerabilities.length} Selected`}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vulnerability Selection */}
            <Card className="bg-dark-800 border-dark-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white">Select Vulnerabilities for Assessment</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedVulnerabilities([])}
                      className="border-dark-600 text-dark-300 hover:bg-dark-700"
                      data-testid="button-clear-selection"
                    >
                      Clear All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const criticalVulns = vulnerabilityData?.vulnerabilities
                          ?.filter((v: any) => v.severity === 'Critical')
                          ?.map((v: any) => v.id) || [];
                        setSelectedVulnerabilities(criticalVulns);
                      }}
                      className="border-dark-600 text-dark-300 hover:bg-dark-700"
                      data-testid="button-select-critical"
                    >
                      Select Critical
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <div className="divide-y divide-dark-700 max-h-96 overflow-y-auto">
                {vulnLoading ? (
                  <div className="p-8 text-center text-dark-400">Loading vulnerabilities...</div>
                ) : vulnerabilityData?.vulnerabilities?.length > 0 ? (
                  vulnerabilityData.vulnerabilities.map((vulnerability: any) => (
                    <div key={vulnerability.id} className="p-4 hover:bg-dark-700/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedVulnerabilities.includes(vulnerability.id)}
                            onChange={() => handleVulnerabilityToggle(vulnerability.id)}
                            className="w-4 h-4 text-primary bg-dark-700 border-dark-600 rounded focus:ring-primary"
                            data-testid={`checkbox-vuln-${vulnerability.cveId}`}
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <h4 className="font-semibold text-white text-sm">{vulnerability.cveId}</h4>
                              <Badge 
                                variant="outline" 
                                className={cn("text-xs border", getSeverityColor(vulnerability.severity))}
                              >
                                {vulnerability.severity}
                              </Badge>
                              {vulnerability.cvssScore && (
                                <span className="text-dark-400 text-xs">CVSS {vulnerability.cvssScore}</span>
                              )}
                            </div>
                            <p className="text-dark-300 text-xs line-clamp-1">{vulnerability.description}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedVulnerability(vulnerability)}
                          className="text-dark-400 hover:text-white"
                          data-testid={`button-view-${vulnerability.cveId}`}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-dark-400">
                    No vulnerabilities available for assessment.
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Assessment Results Sidebar */}
          <div className="space-y-6">
            {/* Recent Assessments */}
            <Card className="bg-dark-800 border-dark-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Recent Assessments</CardTitle>
              </CardHeader>
              <CardContent>
                {assessmentsLoading ? (
                  <div className="text-center text-dark-400">Loading assessments...</div>
                ) : assessments?.length > 0 ? (
                  <div className="space-y-3">
                    {assessments.slice(0, 5).map((assessment: any) => (
                      <div key={assessment.id} className="p-3 bg-dark-700 rounded-lg" data-testid={`assessment-${assessment.id}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white truncate">
                            Assessment {assessment.id.slice(0, 8)}...
                          </span>
                          <Badge 
                            variant="outline" 
                            className={cn("text-xs",
                              assessment.status === 'completed' ? 'text-green-400 border-green-400' :
                              assessment.status === 'failed' ? 'text-red-400 border-red-400' :
                              'text-yellow-400 border-yellow-400'
                            )}
                          >
                            {assessment.status}
                          </Badge>
                        </div>
                        {assessment.aiAnalysis && (
                          <div className="space-y-1 text-xs">
                            <div className="flex justify-between">
                              <span className="text-dark-300">Risk Score:</span>
                              <span className={cn("font-medium", getRiskLevelColor(assessment.aiAnalysis.riskScore))}>
                                {assessment.aiAnalysis.riskScore}%
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-dark-300">Impact:</span>
                              <span className="text-white">{assessment.aiAnalysis.impactSeverity}</span>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 text-xs text-dark-400">
                          {assessment.createdAt ? new Date(assessment.createdAt).toLocaleString() : 'Recent'}
                        </div>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-dark-600 text-dark-300 hover:bg-dark-700"
                      data-testid="button-view-all-assessments"
                    >
                      View All Assessments
                    </Button>
                  </div>
                ) : (
                  <div className="text-center text-dark-400">
                    <Brain className="mx-auto mb-2 text-dark-500" size={32} />
                    <p className="text-sm">No assessments yet. Start analyzing vulnerabilities.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Statistics */}
            <Card className="bg-dark-800 border-dark-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Assessment Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-2 bg-dark-700 rounded">
                  <span className="text-dark-300 text-sm">Total Assessments</span>
                  <span className="font-bold text-white" data-testid="stat-total-assessments">
                    {assessments?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-dark-700 rounded">
                  <span className="text-dark-300 text-sm">Completed Today</span>
                  <span className="font-bold text-green-400" data-testid="stat-completed-today">
                    {assessments?.filter((a: any) => a.status === 'completed').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-dark-700 rounded">
                  <span className="text-dark-300 text-sm">In Progress</span>
                  <span className="font-bold text-yellow-400" data-testid="stat-in-progress">
                    {assessments?.filter((a: any) => a.status === 'pending').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-2 bg-dark-700 rounded">
                  <span className="text-dark-300 text-sm">High Risk Found</span>
                  <span className="font-bold text-red-400" data-testid="stat-high-risk">
                    {assessments?.filter((a: any) => a.aiAnalysis?.riskScore >= 70).length || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Vulnerability Details Modal */}
      {selectedVulnerability && (
        <VulnerabilityModal
          vulnerability={selectedVulnerability}
          onClose={() => setSelectedVulnerability(null)}
        />
      )}
    </div>
  );
}
