import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, TrendingUp, Shield, Activity, Search, Brain, FileText, Download, ChevronRight } from "lucide-react";
import { useState } from "react";
import VulnerabilityCard from "@/components/vulnerability-card";
import VulnerabilityModal from "@/components/vulnerability-modal";
import AIAssessmentPanel from "@/components/ai-assessment-panel";
import { toast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [searchForm, setSearchForm] = useState({
    cveId: "",
    severity: "",
    product: "",
    cvssMin: "",
    cvssMax: ""
  });
  const [selectedVulnerability, setSelectedVulnerability] = useState<any>(null);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats"],
  });

  // Fetch recent vulnerabilities
  const { data: vulnerabilityData, isLoading: vulnLoading, refetch: refetchVulnerabilities } = useQuery({
    queryKey: ["/api/vulnerabilities/search"],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "10",
        offset: "0"
      });
      const response = await fetch(`/api/vulnerabilities/search?${params}`);
      if (!response.ok) throw new Error("Failed to fetch vulnerabilities");
      return response.json();
    }
  });

  // Fetch latest assessments
  const { data: assessments, isLoading: assessmentsLoading } = useQuery({
    queryKey: ["/api/assessments"],
    queryFn: async () => {
      const response = await fetch("/api/assessments?limit=5");
      if (!response.ok) throw new Error("Failed to fetch assessments");
      return response.json();
    }
  });

  const handleSearch = async () => {
    try {
      const searchParams = new URLSearchParams();
      if (searchForm.cveId) searchParams.append("cveId", searchForm.cveId);
      if (searchForm.severity) searchParams.append("severity", searchForm.severity);
      if (searchForm.product) searchParams.append("product", searchForm.product);
      if (searchForm.cvssMin) searchParams.append("cvssMin", searchForm.cvssMin);
      if (searchForm.cvssMax) searchParams.append("cvssMax", searchForm.cvssMax);
      searchParams.append("limit", "20");
      searchParams.append("offset", "0");

      await refetchVulnerabilities();
      toast({
        title: "Search completed",
        description: "Vulnerability database search completed successfully.",
      });
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Failed to search vulnerability database.",
        variant: "destructive",
      });
    }
  };

  const handleCVEFetch = async () => {
    if (!searchForm.cveId) {
      toast({
        title: "CVE ID required",
        description: "Please enter a CVE ID to fetch details.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch("/api/cves/fetch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cveId: searchForm.cveId }),
      });

      if (!response.ok) throw new Error("Failed to fetch CVE");
      
      const vulnerability = await response.json();
      setSelectedVulnerability(vulnerability);
      await refetchVulnerabilities();
      
      toast({
        title: "CVE fetched successfully",
        description: `${vulnerability.cveId} has been added to the database.`,
      });
    } catch (error) {
      toast({
        title: "Failed to fetch CVE",
        description: "Could not retrieve CVE details from external database.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-dark-50">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Security Dashboard</h2>
            <p className="text-dark-300 mt-1">Monitor and assess security vulnerabilities across your infrastructure</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search CVE, vulnerability..."
                className="bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-primary w-80 pl-10"
                data-testid="global-search"
              />
              <Search className="absolute left-3 top-3 text-dark-400" size={16} />
            </div>
            <Button variant="ghost" size="sm" className="relative text-dark-400 hover:text-white" data-testid="notifications">
              <Activity size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-dark-800 border-dark-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">Total Vulnerabilities</p>
                  <p className="text-3xl font-bold text-white mt-2" data-testid="stat-total-vulnerabilities">
                    {statsLoading ? "..." : stats?.totalVulnerabilities || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-500/10 rounded-lg">
                  <AlertTriangle className="text-red-500" size={20} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-red-400 text-sm font-medium">+12% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">Critical Severity</p>
                  <p className="text-3xl font-bold text-white mt-2" data-testid="stat-critical-count">
                    {statsLoading ? "..." : stats?.criticalCount || 0}
                  </p>
                </div>
                <div className="p-3 bg-red-600/10 rounded-lg">
                  <AlertTriangle className="text-red-600" size={20} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-green-400 text-sm font-medium">-5% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">Assessments Run</p>
                  <p className="text-3xl font-bold text-white mt-2" data-testid="stat-assessments">
                    {statsLoading ? "..." : stats?.assessmentsToday || 0}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="text-blue-500" size={20} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-green-400 text-sm font-medium">+23% from last week</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-800 border-dark-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-dark-400 text-sm font-medium">Systems Protected</p>
                  <p className="text-3xl font-bold text-white mt-2" data-testid="stat-systems">
                    {statsLoading ? "..." : stats?.systemsProtected || 0}
                  </p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Shield className="text-green-500" size={20} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-green-400 text-sm font-medium">+8% from last week</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vulnerability Search Panel */}
          <div className="lg:col-span-2">
            <Card className="bg-dark-800 border-dark-700">
              <CardHeader className="border-b border-dark-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-white">Vulnerability Database Search</CardTitle>
                  <Button variant="link" className="text-primary hover:text-primary/80" data-testid="advanced-search">
                    Advanced Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-dark-300 mb-2">CVE ID</Label>
                      <Input
                        placeholder="CVE-2023-12345"
                        value={searchForm.cveId}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, cveId: e.target.value }))}
                        className="bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-primary"
                        data-testid="input-cve-id"
                      />
                    </div>
                    <div>
                      <Label className="text-dark-300 mb-2">Severity</Label>
                      <Select value={searchForm.severity} onValueChange={(value) => setSearchForm(prev => ({ ...prev, severity: value }))}>
                        <SelectTrigger className="bg-dark-700 border-dark-600 text-white focus:border-primary" data-testid="select-severity">
                          <SelectValue placeholder="All Severities" />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-700 border-dark-600">
                          <SelectItem value="all">All Severities</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="Low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-dark-300 mb-2">Product/Vendor</Label>
                      <Input
                        placeholder="e.g., Apache, Microsoft"
                        value={searchForm.product}
                        onChange={(e) => setSearchForm(prev => ({ ...prev, product: e.target.value }))}
                        className="bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-primary"
                        data-testid="input-product"
                      />
                    </div>
                    <div>
                      <Label className="text-dark-300 mb-2">CVSS Score</Label>
                      <div className="flex space-x-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={searchForm.cvssMin}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, cvssMin: e.target.value }))}
                          className="bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-primary"
                          min="0"
                          max="10"
                          step="0.1"
                          data-testid="input-cvss-min"
                        />
                        <Input
                          type="number"
                          placeholder="Max"
                          value={searchForm.cvssMax}
                          onChange={(e) => setSearchForm(prev => ({ ...prev, cvssMax: e.target.value }))}
                          className="bg-dark-700 border-dark-600 text-white placeholder-dark-400 focus:border-primary"
                          min="0"
                          max="10"
                          step="0.1"
                          data-testid="input-cvss-max"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex space-x-2">
                      <Button onClick={handleSearch} className="bg-primary hover:bg-primary/90" data-testid="button-search">
                        <Search className="mr-2" size={16} />
                        Search Database
                      </Button>
                      <Button onClick={handleCVEFetch} variant="outline" className="border-dark-600 text-dark-300 hover:bg-dark-700" data-testid="button-fetch-cve">
                        Fetch CVE
                      </Button>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-dark-400">
                      <span>Database last updated: 2 hours ago</span>
                      <span>•</span>
                      <span>247,394 vulnerabilities indexed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search Results */}
            <Card className="mt-6 bg-dark-800 border-dark-700">
              <CardHeader className="border-b border-dark-700">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white">Recent Vulnerabilities</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-dark-400">Sort by:</span>
                    <Select defaultValue="severity">
                      <SelectTrigger className="bg-dark-700 border-dark-600 text-white w-auto" data-testid="select-sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-700 border-dark-600">
                        <SelectItem value="severity">Severity</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="cvss">CVSS Score</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <div className="divide-y divide-dark-700">
                {vulnLoading ? (
                  <div className="p-8 text-center text-dark-400">Loading vulnerabilities...</div>
                ) : vulnerabilityData?.vulnerabilities?.length > 0 ? (
                  vulnerabilityData.vulnerabilities.map((vulnerability: any) => (
                    <VulnerabilityCard
                      key={vulnerability.id}
                      vulnerability={vulnerability}
                      onViewDetails={setSelectedVulnerability}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center text-dark-400">
                    No vulnerabilities found. Try searching for CVEs or fetch specific CVE IDs.
                  </div>
                )}
              </div>
              {vulnerabilityData?.vulnerabilities?.length > 0 && (
                <div className="p-4 border-t border-dark-700">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-dark-400">
                      Showing {vulnerabilityData.vulnerabilities.length} of {vulnerabilityData.total} vulnerabilities
                    </div>
                    <Button variant="outline" className="border-dark-600 text-dark-300 hover:bg-dark-700" data-testid="button-load-more">
                      Load More
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* AI Assessment Panel */}
          <div className="space-y-6">
            <AIAssessmentPanel assessments={assessments} isLoading={assessmentsLoading} />

            {/* Quick Actions */}
            <Card className="bg-dark-800 border-dark-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 bg-dark-700 hover:bg-dark-600 text-left h-auto"
                  data-testid="action-full-scan"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Search className="text-blue-500" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-white">Full System Scan</p>
                      <p className="text-xs text-dark-400">Comprehensive vulnerability assessment</p>
                    </div>
                  </div>
                  <ChevronRight className="text-dark-400" size={16} />
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 bg-dark-700 hover:bg-dark-600 text-left h-auto"
                  data-testid="action-test-environment"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <Shield className="text-green-500" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-white">Test Environment</p>
                      <p className="text-xs text-dark-400">Safe exploitation testing</p>
                    </div>
                  </div>
                  <ChevronRight className="text-dark-400" size={16} />
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-between p-3 bg-dark-700 hover:bg-dark-600 text-left h-auto"
                  data-testid="action-export-reports"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <Download className="text-purple-500" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-white">Export Reports</p>
                      <p className="text-xs text-dark-400">Download assessment results</p>
                    </div>
                  </div>
                  <ChevronRight className="text-dark-400" size={16} />
                </Button>
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
