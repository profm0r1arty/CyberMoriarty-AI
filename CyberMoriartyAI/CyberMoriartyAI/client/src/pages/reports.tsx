import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Plus, Eye, Trash2, Calendar, Filter, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFormat, setFilterFormat] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReportConfig, setNewReportConfig] = useState({
    title: "",
    format: "pdf",
    includeAssessments: true,
    includeVulnerabilities: true,
    dateRange: "all"
  });
  const pageSize = 10;
  const queryClient = useQueryClient();

  // Fetch reports
  const { data: reportData, isLoading } = useQuery({
    queryKey: ["/api/reports", currentPage, searchTerm, filterFormat],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString()
      });
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    }
  });

  // Fetch vulnerabilities and assessments for report creation
  const { data: vulnerabilityData } = useQuery({
    queryKey: ["/api/vulnerabilities/search"],
    queryFn: async () => {
      const params = new URLSearchParams({ limit: "50", offset: "0" });
      const response = await fetch(`/api/vulnerabilities/search?${params}`);
      if (!response.ok) throw new Error("Failed to fetch vulnerabilities");
      return response.json();
    },
    enabled: isCreateDialogOpen
  });

  const { data: assessments } = useQuery({
    queryKey: ["/api/assessments"],
    queryFn: async () => {
      const response = await fetch("/api/assessments?limit=50");
      if (!response.ok) throw new Error("Failed to fetch assessments");
      return response.json();
    },
    enabled: isCreateDialogOpen
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) throw new Error("Failed to create report");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setIsCreateDialogOpen(false);
      setNewReportConfig({
        title: "",
        format: "pdf",
        includeAssessments: true,
        includeVulnerabilities: true,
        dateRange: "all"
      });
      toast({
        title: "Report created",
        description: "New security assessment report has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Report creation failed",
        description: "Failed to generate security report.",
        variant: "destructive",
      });
    }
  });

  const handleCreateReport = () => {
    if (!newReportConfig.title.trim()) {
      toast({
        title: "Title required",
        description: "Please provide a title for the report.",
        variant: "destructive",
      });
      return;
    }

    const reportData = {
      title: newReportConfig.title,
      exportFormat: newReportConfig.format,
      vulnerabilityIds: newReportConfig.includeVulnerabilities 
        ? vulnerabilityData?.vulnerabilities?.slice(0, 10).map((v: any) => v.id) || []
        : [],
      assessmentIds: newReportConfig.includeAssessments 
        ? assessments?.slice(0, 10).map((a: any) => a.id) || []
        : []
    };

    createReportMutation.mutate(reportData);
  };

  const handleDownloadReport = async (reportId: string, title: string) => {
    try {
      // In a real implementation, this would download the actual report file
      toast({
        title: "Download started",
        description: `Downloading report: ${title}`,
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download report.",
        variant: "destructive",
      });
    }
  };

  const getFormatBadgeColor = (format: string) => {
    switch (format?.toLowerCase()) {
      case 'pdf':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'json':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'csv':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredReports = reportData?.reports?.filter((report: any) => {
    const matchesSearch = !searchTerm || 
      report.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = !filterFormat || report.exportFormat === filterFormat;
    return matchesSearch && matchesFormat;
  }) || [];

  return (
    <div className="min-h-screen bg-dark-900 text-dark-50">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Security Reports</h2>
            <p className="text-dark-300 mt-1">Generate, manage and export comprehensive security assessment reports</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90" data-testid="button-create-report">
                <Plus className="mr-2" size={16} />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-800 border-dark-700 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Report</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label className="text-dark-300 mb-2">Report Title</Label>
                  <Input
                    value={newReportConfig.title}
                    onChange={(e) => setNewReportConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="bg-dark-700 border-dark-600 text-white"
                    placeholder="Security Assessment Report"
                    data-testid="input-report-title"
                  />
                </div>

                <div>
                  <Label className="text-dark-300 mb-2">Export Format</Label>
                  <Select 
                    value={newReportConfig.format} 
                    onValueChange={(value) => setNewReportConfig(prev => ({ ...prev, format: value }))}
                  >
                    <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-report-format">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-700 border-dark-600">
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="json">JSON Data</SelectItem>
                      <SelectItem value="csv">CSV Export</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-dark-300 mb-2">Date Range</Label>
                  <Select 
                    value={newReportConfig.dateRange} 
                    onValueChange={(value) => setNewReportConfig(prev => ({ ...prev, dateRange: value }))}
                  >
                    <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-date-range">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-700 border-dark-600">
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="quarter">Past Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReportConfig.includeVulnerabilities}
                      onChange={(e) => setNewReportConfig(prev => ({ ...prev, includeVulnerabilities: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-dark-700 border-dark-600 rounded focus:ring-primary"
                      data-testid="checkbox-include-vulnerabilities"
                    />
                    <span className="text-dark-300 text-sm">Include vulnerability data</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newReportConfig.includeAssessments}
                      onChange={(e) => setNewReportConfig(prev => ({ ...prev, includeAssessments: e.target.checked }))}
                      className="w-4 h-4 text-primary bg-dark-700 border-dark-600 rounded focus:ring-primary"
                      data-testid="checkbox-include-assessments"
                    />
                    <span className="text-dark-300 text-sm">Include AI assessments</span>
                  </label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button
                    onClick={handleCreateReport}
                    disabled={createReportMutation.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    data-testid="button-confirm-create"
                  >
                    {createReportMutation.isPending ? "Creating..." : "Create Report"}
                  </Button>
                  <Button
                    onClick={() => setIsCreateDialogOpen(false)}
                    variant="outline"
                    className="flex-1 border-dark-600 text-dark-300 hover:bg-dark-700"
                    data-testid="button-cancel-create"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="p-6">
        {/* Filters and Search */}
        <Card className="mb-6 bg-dark-800 border-dark-700">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-dark-400" size={16} />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-dark-700 border-dark-600 text-white pl-10"
                  placeholder="Search reports..."
                  data-testid="input-search-reports"
                />
              </div>
              <div className="w-48">
                <Select value={filterFormat} onValueChange={setFilterFormat}>
                  <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-filter-format">
                    <SelectValue placeholder="All Formats" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-700 border-dark-600">
                    <SelectItem value="all">All Formats</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setFilterFormat("");
                }}
                variant="outline"
                className="border-dark-600 text-dark-300 hover:bg-dark-700"
                data-testid="button-clear-filters"
              >
                <Filter className="mr-2" size={16} />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Reports Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-dark-800 border-dark-700">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-dark-600 rounded mb-2"></div>
                    <div className="h-3 bg-dark-600 rounded w-3/4 mb-4"></div>
                    <div className="h-2 bg-dark-600 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredReports.length > 0 ? (
            filteredReports.map((report: any) => (
              <Card key={report.id} className="bg-dark-800 border-dark-700 hover:border-dark-600 transition-colors" data-testid={`report-card-${report.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-white text-lg mb-2 line-clamp-1">{report.title}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={cn("text-xs border", getFormatBadgeColor(report.exportFormat))}>
                          {report.exportFormat?.toUpperCase()}
                        </Badge>
                        <span className="text-dark-400 text-xs flex items-center">
                          <Calendar className="mr-1" size={12} />
                          {report.generatedAt ? new Date(report.generatedAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>
                    <FileText className="text-dark-500 flex-shrink-0" size={24} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-dark-700 rounded">
                        <span className="block text-dark-300">Vulnerabilities</span>
                        <span className="font-medium text-white">
                          {report.vulnerabilityIds?.length || 0}
                        </span>
                      </div>
                      <div className="p-2 bg-dark-700 rounded">
                        <span className="block text-dark-300">Assessments</span>
                        <span className="font-medium text-white">
                          {report.assessmentIds?.length || 0}
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        onClick={() => setSelectedReport(report)}
                        variant="outline"
                        size="sm"
                        className="flex-1 border-dark-600 text-dark-300 hover:bg-dark-700 hover:text-white"
                        data-testid={`button-view-report-${report.id}`}
                      >
                        <Eye className="mr-1" size={14} />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDownloadReport(report.id, report.title)}
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                        data-testid={`button-download-report-${report.id}`}
                      >
                        <Download className="mr-1" size={14} />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="bg-dark-800 border-dark-700">
                <CardContent className="p-12 text-center">
                  <FileText className="mx-auto mb-4 text-dark-500" size={64} />
                  <h3 className="text-xl font-semibold text-white mb-2">No reports found</h3>
                  <p className="text-dark-400 mb-6">
                    {searchTerm || filterFormat 
                      ? "No reports match your search criteria. Try adjusting your filters."
                      : "You haven't created any security reports yet. Create your first report to get started."
                    }
                  </p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="button-create-first-report"
                  >
                    <Plus className="mr-2" size={16} />
                    Create Your First Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Pagination */}
        {reportData && reportData.total > pageSize && (
          <div className="mt-8 flex items-center justify-center space-x-4">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              variant="outline"
              className="border-dark-600 text-dark-300 hover:bg-dark-700 disabled:opacity-50"
              data-testid="button-previous-page"
            >
              Previous
            </Button>
            <span className="text-dark-400">
              Page {currentPage + 1} of {Math.ceil(reportData.total / pageSize)}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={(currentPage + 1) * pageSize >= reportData.total}
              variant="outline"
              className="border-dark-600 text-dark-300 hover:bg-dark-700 disabled:opacity-50"
              data-testid="button-next-page"
            >
              Next
            </Button>
          </div>
        )}
      </main>

      {/* Report Preview Modal */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="bg-dark-800 border-dark-700 max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white flex items-center">
                <FileText className="mr-2" size={20} />
                {selectedReport.title}
              </DialogTitle>
            </DialogHeader>
            <div className="pt-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-dark-700 rounded-lg">
                  <span className="block text-dark-300 text-sm">Format</span>
                  <span className="font-medium text-white">{selectedReport.exportFormat?.toUpperCase()}</span>
                </div>
                <div className="p-3 bg-dark-700 rounded-lg">
                  <span className="block text-dark-300 text-sm">Generated</span>
                  <span className="font-medium text-white">
                    {selectedReport.generatedAt ? new Date(selectedReport.generatedAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <div className="p-3 bg-dark-700 rounded-lg">
                  <span className="block text-dark-300 text-sm">Vulnerabilities</span>
                  <span className="font-medium text-white">{selectedReport.vulnerabilityIds?.length || 0}</span>
                </div>
                <div className="p-3 bg-dark-700 rounded-lg">
                  <span className="block text-dark-300 text-sm">Assessments</span>
                  <span className="font-medium text-white">{selectedReport.assessmentIds?.length || 0}</span>
                </div>
              </div>

              {selectedReport.content && (
                <div className="bg-dark-900 border border-dark-600 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">Report Preview</h4>
                  <div className="bg-dark-700 rounded p-3 text-sm text-dark-300 font-mono max-h-64 overflow-y-auto">
                    {selectedReport.content.markdown ? 
                      selectedReport.content.markdown.substring(0, 500) + "..." :
                      "Report content will be generated when downloaded."
                    }
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-4 border-t border-dark-700">
                <Button
                  onClick={() => handleDownloadReport(selectedReport.id, selectedReport.title)}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="button-download-from-modal"
                >
                  <Download className="mr-2" size={16} />
                  Download Report
                </Button>
                <Button
                  onClick={() => setSelectedReport(null)}
                  variant="outline"
                  className="border-dark-600 text-dark-300 hover:bg-dark-700"
                  data-testid="button-close-modal"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
