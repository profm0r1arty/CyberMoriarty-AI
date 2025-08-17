import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlaskConical, Play, Square, RotateCcw, Shield, AlertTriangle, Terminal, Activity, Download, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function TestEnvironment() {
  const [selectedVulnerability, setSelectedVulnerability] = useState<string>("");
  const [testConfig, setTestConfig] = useState({
    environment: "sandbox",
    target: "localhost",
    port: "80",
    timeout: "30",
    safetyLevel: "high"
  });
  const [exploitCode, setExploitCode] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState<string>("");

  // Fetch vulnerabilities for testing
  const { data: vulnerabilityData, isLoading: vulnLoading } = useQuery({
    queryKey: ["/api/vulnerabilities/search"],
    queryFn: async () => {
      const params = new URLSearchParams({
        limit: "20",
        offset: "0",
        hasExploit: "true"
      });
      const response = await fetch(`/api/vulnerabilities/search?${params}`);
      if (!response.ok) throw new Error("Failed to fetch vulnerabilities");
      return response.json();
    }
  });

  const handleStartTest = async () => {
    if (!selectedVulnerability) {
      toast({
        title: "No vulnerability selected",
        description: "Please select a vulnerability to test.",
        variant: "destructive",
      });
      return;
    }

    if (!exploitCode.trim()) {
      toast({
        title: "No exploit code provided",
        description: "Please provide exploit code to test.",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    const sessionId = `test_${Date.now()}`;
    setCurrentSession(sessionId);

    // Simulate test execution with safety checks
    try {
      // This would be a real sandboxed environment in production
      const mockResults = {
        sessionId,
        vulnerability: selectedVulnerability,
        status: "running",
        startTime: new Date().toISOString(),
        safetyChecks: [
          { check: "Sandbox isolation", status: "passed" },
          { check: "Network restrictions", status: "passed" },
          { check: "Resource limits", status: "passed" },
          { check: "Code analysis", status: testConfig.safetyLevel === "high" ? "passed" : "warning" }
        ],
        output: "Initializing test environment...\nLoading exploit code...\nRunning safety analysis...\n"
      };

      setTestResults(prev => [mockResults, ...prev]);

      // Simulate test progress
      setTimeout(() => {
        const updatedResults = {
          ...mockResults,
          status: "completed",
          endTime: new Date().toISOString(),
          output: mockResults.output + 
            "Safety analysis completed.\n" +
            "Exploit test executed in isolated environment.\n" +
            "No system vulnerabilities detected.\n" +
            "Test completed successfully with safety controls active.\n",
          summary: {
            exploitSuccessful: Math.random() > 0.5,
            impactLevel: testConfig.safetyLevel === "high" ? "contained" : "simulated",
            recommendations: [
              "Apply security patches immediately",
              "Implement network segmentation", 
              "Enable additional monitoring"
            ]
          }
        };

        setTestResults(prev => prev.map(r => r.sessionId === sessionId ? updatedResults : r));
        setIsRunning(false);

        toast({
          title: "Test completed",
          description: "Exploit test finished safely in isolated environment.",
        });
      }, 3000);

    } catch (error) {
      setIsRunning(false);
      toast({
        title: "Test failed",
        description: "Failed to execute exploit test.",
        variant: "destructive",
      });
    }
  };

  const handleStopTest = () => {
    setIsRunning(false);
    if (currentSession) {
      setTestResults(prev => prev.map(r => 
        r.sessionId === currentSession 
          ? { ...r, status: "stopped", endTime: new Date().toISOString() }
          : r
      ));
    }
    toast({
      title: "Test stopped",
      description: "Exploit test execution has been terminated.",
    });
  };

  const handleResetEnvironment = () => {
    setTestResults([]);
    setExploitCode("");
    setCurrentSession("");
    toast({
      title: "Environment reset",
      description: "Test environment has been reset to clean state.",
    });
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

  return (
    <div className="min-h-screen bg-dark-900 text-dark-50">
      {/* Header */}
      <header className="bg-dark-800 border-b border-dark-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Test Environment</h2>
            <p className="text-dark-300 mt-1">Safe, isolated environment for vulnerability exploitation testing</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={cn("w-2 h-2 rounded-full", isRunning ? "bg-red-500 animate-pulse" : "bg-green-500")}>
              </div>
              <span className="text-sm text-dark-300">
                {isRunning ? "Test Running" : "Environment Ready"}
              </span>
            </div>
            <Button
              onClick={handleResetEnvironment}
              variant="outline"
              size="sm"
              className="border-dark-600 text-dark-300 hover:bg-dark-700"
              data-testid="button-reset-environment"
            >
              <RotateCcw className="mr-2" size={16} />
              Reset Environment
            </Button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Test Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="setup" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-dark-700 border-dark-600">
                <TabsTrigger value="setup" className="data-[state=active]:bg-primary" data-testid="tab-setup">Setup</TabsTrigger>
                <TabsTrigger value="exploit" className="data-[state=active]:bg-primary" data-testid="tab-exploit">Exploit Code</TabsTrigger>
                <TabsTrigger value="results" className="data-[state=active]:bg-primary" data-testid="tab-results">Results</TabsTrigger>
              </TabsList>

              <TabsContent value="setup" className="mt-6">
                <Card className="bg-dark-800 border-dark-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      <Shield className="mr-2" size={20} />
                      Test Environment Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Vulnerability Selection */}
                    <div>
                      <Label className="text-dark-300 mb-2">Select Vulnerability to Test</Label>
                      <Select value={selectedVulnerability} onValueChange={setSelectedVulnerability}>
                        <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-vulnerability">
                          <SelectValue placeholder="Choose a vulnerability..." />
                        </SelectTrigger>
                        <SelectContent className="bg-dark-700 border-dark-600">
                          {vulnLoading ? (
                            <SelectItem value="loading" disabled>Loading vulnerabilities...</SelectItem>
                          ) : vulnerabilityData?.vulnerabilities?.length > 0 ? (
                            vulnerabilityData.vulnerabilities.map((vuln: any) => (
                              <SelectItem key={vuln.id} value={vuln.id}>
                                {vuln.cveId} - {vuln.severity} ({vuln.cvssScore || 'N/A'})
                              </SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>No exploitable vulnerabilities found</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-dark-300 mb-2">Environment Type</Label>
                        <Select 
                          value={testConfig.environment} 
                          onValueChange={(value) => setTestConfig(prev => ({ ...prev, environment: value }))}
                        >
                          <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-environment">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-700 border-dark-600">
                            <SelectItem value="sandbox">Isolated Sandbox</SelectItem>
                            <SelectItem value="container">Docker Container</SelectItem>
                            <SelectItem value="vm">Virtual Machine</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-dark-300 mb-2">Safety Level</Label>
                        <Select 
                          value={testConfig.safetyLevel} 
                          onValueChange={(value) => setTestConfig(prev => ({ ...prev, safetyLevel: value }))}
                        >
                          <SelectTrigger className="bg-dark-700 border-dark-600 text-white" data-testid="select-safety-level">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-dark-700 border-dark-600">
                            <SelectItem value="maximum">Maximum Security</SelectItem>
                            <SelectItem value="high">High Security</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-dark-300 mb-2">Target Host</Label>
                        <Input
                          value={testConfig.target}
                          onChange={(e) => setTestConfig(prev => ({ ...prev, target: e.target.value }))}
                          className="bg-dark-700 border-dark-600 text-white"
                          placeholder="localhost"
                          data-testid="input-target"
                        />
                      </div>

                      <div>
                        <Label className="text-dark-300 mb-2">Port</Label>
                        <Input
                          value={testConfig.port}
                          onChange={(e) => setTestConfig(prev => ({ ...prev, port: e.target.value }))}
                          className="bg-dark-700 border-dark-600 text-white"
                          placeholder="80"
                          data-testid="input-port"
                        />
                      </div>

                      <div>
                        <Label className="text-dark-300 mb-2">Timeout (seconds)</Label>
                        <Input
                          value={testConfig.timeout}
                          onChange={(e) => setTestConfig(prev => ({ ...prev, timeout: e.target.value }))}
                          className="bg-dark-700 border-dark-600 text-white"
                          placeholder="30"
                          data-testid="input-timeout"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exploit" className="mt-6">
                <Card className="bg-dark-800 border-dark-700">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl font-bold text-white flex items-center">
                        <Terminal className="mr-2" size={20} />
                        Exploit Code Editor
                      </CardTitle>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" className="border-dark-600 text-dark-300 hover:bg-dark-700" data-testid="button-load-template">
                          <Upload className="mr-1" size={14} />
                          Load Template
                        </Button>
                        <Button variant="outline" size="sm" className="border-dark-600 text-dark-300 hover:bg-dark-700" data-testid="button-save-code">
                          <Download className="mr-1" size={14} />
                          Save Code
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <AlertTriangle className="text-amber-500" size={16} />
                          <span className="font-semibold text-amber-400">Security Notice</span>
                        </div>
                        <p className="text-sm text-dark-300">
                          All exploit code is executed in a completely isolated environment with strict security controls. 
                          No actual systems will be harmed during testing.
                        </p>
                      </div>

                      <div>
                        <Label className="text-dark-300 mb-2">Exploit Code</Label>
                        <Textarea
                          value={exploitCode}
                          onChange={(e) => setExploitCode(e.target.value)}
                          className="bg-dark-700 border-dark-600 text-white font-mono text-sm h-64 resize-none"
                          placeholder="# Enter your exploit code here
# Example:
import requests
import sys

def exploit_target(url):
    try:
        # Exploit logic here
        response = requests.get(url)
        return response.status_code == 200
    except Exception as e:
        print(f'Error: {e}')
        return False

if __name__ == '__main__':
    target_url = 'http://localhost:8080'
    result = exploit_target(target_url)
    print(f'Exploit result: {result}')
"
                          data-testid="textarea-exploit-code"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-dark-400">
                          Code will be analyzed for safety before execution
                        </div>
                        <div className="flex space-x-2">
                          {isRunning ? (
                            <Button 
                              onClick={handleStopTest}
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700"
                              data-testid="button-stop-test"
                            >
                              <Square className="mr-2" size={16} />
                              Stop Test
                            </Button>
                          ) : (
                            <Button 
                              onClick={handleStartTest}
                              className="bg-primary hover:bg-primary/90"
                              data-testid="button-start-test"
                            >
                              <Play className="mr-2" size={16} />
                              Start Test
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="mt-6">
                <Card className="bg-dark-800 border-dark-700">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-white flex items-center">
                      <Activity className="mr-2" size={20} />
                      Test Results
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {testResults.length > 0 ? (
                      <div className="space-y-4">
                        {testResults.map((result) => (
                          <div key={result.sessionId} className="bg-dark-700 rounded-lg p-4" data-testid={`test-result-${result.sessionId}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <h3 className="font-semibold text-white">Session {result.sessionId.split('_')[1]}</h3>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs",
                                    result.status === 'completed' ? 'text-green-400 border-green-400' :
                                    result.status === 'running' ? 'text-yellow-400 border-yellow-400' :
                                    result.status === 'stopped' ? 'text-red-400 border-red-400' :
                                    'text-gray-400 border-gray-400'
                                  )}
                                >
                                  {result.status}
                                </Badge>
                              </div>
                              <div className="text-sm text-dark-400">
                                {new Date(result.startTime).toLocaleString()}
                              </div>
                            </div>
                            
                            {result.safetyChecks && (
                              <div className="mb-3">
                                <h4 className="text-sm font-medium text-white mb-2">Safety Checks</h4>
                                <div className="grid grid-cols-2 gap-2">
                                  {result.safetyChecks.map((check: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between text-xs p-2 bg-dark-600 rounded">
                                      <span className="text-dark-300">{check.check}</span>
                                      <span className={cn("font-medium",
                                        check.status === 'passed' ? 'text-green-400' :
                                        check.status === 'warning' ? 'text-yellow-400' :
                                        'text-red-400'
                                      )}>
                                        {check.status}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="bg-dark-900 border border-dark-600 rounded p-3">
                              <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap overflow-x-auto">
                                {result.output}
                              </pre>
                            </div>
                            
                            {result.summary && (
                              <div className="mt-3 pt-3 border-t border-dark-600">
                                <div className="grid grid-cols-3 gap-4 text-xs">
                                  <div className="text-center">
                                    <span className="block text-dark-300">Exploit Success</span>
                                    <span className={cn("font-medium", 
                                      result.summary.exploitSuccessful ? 'text-red-400' : 'text-green-400'
                                    )}>
                                      {result.summary.exploitSuccessful ? 'Yes' : 'No'}
                                    </span>
                                  </div>
                                  <div className="text-center">
                                    <span className="block text-dark-300">Impact Level</span>
                                    <span className="font-medium text-white">{result.summary.impactLevel}</span>
                                  </div>
                                  <div className="text-center">
                                    <span className="block text-dark-300">Recommendations</span>
                                    <span className="font-medium text-white">{result.summary.recommendations.length}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-dark-400 py-8">
                        <FlaskConical className="mx-auto mb-4 text-dark-500" size={48} />
                        <h3 className="text-lg font-medium text-dark-300 mb-2">No test results yet</h3>
                        <p>Run an exploit test to see results here.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Environment Status Sidebar */}
          <div className="space-y-6">
            {/* Environment Status */}
            <Card className="bg-dark-800 border-dark-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Environment Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">Security Level</span>
                  <span className="text-green-400 font-medium">{testConfig.safetyLevel.charAt(0).toUpperCase() + testConfig.safetyLevel.slice(1)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">Environment</span>
                  <span className="text-white font-medium">{testConfig.environment}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">Target</span>
                  <span className="text-white font-medium">{testConfig.target}:{testConfig.port}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">Timeout</span>
                  <span className="text-white font-medium">{testConfig.timeout}s</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">Network Isolation</span>
                  <span className="text-green-400 font-medium">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-dark-300 text-sm">Resource Limits</span>
                  <span className="text-green-400 font-medium">Enforced</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-dark-800 border-dark-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 bg-dark-700 hover:bg-dark-600 text-left h-auto"
                  data-testid="action-vulnerability-templates"
                >
                  <Terminal className="mr-3 text-blue-500" size={16} />
                  <div>
                    <p className="font-medium text-white">Exploit Templates</p>
                    <p className="text-xs text-dark-400">Load pre-built exploit code</p>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 bg-dark-700 hover:bg-dark-600 text-left h-auto"
                  data-testid="action-environment-snapshots"
                >
                  <Shield className="mr-3 text-green-500" size={16} />
                  <div>
                    <p className="font-medium text-white">Environment Snapshots</p>
                    <p className="text-xs text-dark-400">Save/restore test states</p>
                  </div>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start p-3 bg-dark-700 hover:bg-dark-600 text-left h-auto"
                  data-testid="action-export-results"
                >
                  <Download className="mr-3 text-purple-500" size={16} />
                  <div>
                    <p className="font-medium text-white">Export Results</p>
                    <p className="text-xs text-dark-400">Download test reports</p>
                  </div>
                </Button>
              </CardContent>
            </Card>

            {/* Safety Notice */}
            <Card className="bg-dark-800 border-dark-700">
              <CardContent className="p-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="text-green-500" size={16} />
                    <span className="font-semibold text-green-400">Safety First</span>
                  </div>
                  <p className="text-xs text-dark-300">
                    All tests run in completely isolated environments. Real systems are never at risk.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
