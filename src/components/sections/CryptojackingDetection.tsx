
import React, { useState } from 'react';
import { Shield, ShieldAlert, AlertTriangle, Download, Play, CheckCircle, XCircle, Info, Lock, Eye, Zap, Users, Globe, Cpu } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const CryptojackingDetection = () => {
  const [scanData, setScanData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runScan = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Starting cryptojacking scan...');
      const response = await fetch('http://localhost:5000/api/cryptojacking-check');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Cryptojacking scan completed:', data);
      setScanData(data);
    } catch (error) {
      console.error('Error running cryptojacking scan:', error);
      setError('Failed to run scan. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!scanData) return;
    
    const dataStr = JSON.stringify(scanData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cryptojacking-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'LOW': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel?.toUpperCase()) {
      case 'HIGH': return <ShieldAlert className="w-6 h-6 text-red-400" />;
      case 'MEDIUM': return <AlertTriangle className="w-6 h-6 text-yellow-400" />;
      case 'LOW': return <Shield className="w-6 h-6 text-green-400" />;
      default: return <Shield className="w-6 h-6 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-blue-400" />
          <h1 className="text-4xl font-bold text-white">Cryptojacking Detection</h1>
        </div>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Protect your system from unauthorized cryptocurrency mining. Learn about cryptojacking and scan your system for threats.
        </p>
      </div>

      {/* What is Cryptojacking Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Info className="w-6 h-6 text-blue-400" />
            What is Cryptojacking?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-300 text-lg">
            Cryptojacking is the unauthorized use of someone else's computer to mine cryptocurrency. 
            Hackers secretly install mining software on your device to steal your computing power and electricity.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-5 h-5 text-red-400" />
                <h4 className="font-semibold text-white">High CPU Usage</h4>
              </div>
              <p className="text-sm text-gray-300">
                Mining software consumes significant processing power, slowing down your system.
              </p>
            </div>
            
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <h4 className="font-semibold text-white">Energy Theft</h4>
              </div>
              <p className="text-sm text-gray-300">
                Your electricity bill increases as miners use your power to generate profits for criminals.
              </p>
            </div>
            
            <div className="bg-slate-700/50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-purple-400" />
                <h4 className="font-semibold text-white">Stealthy Operation</h4>
              </div>
              <p className="text-sm text-gray-300">
                Cryptojacking often runs hidden in the background, making it difficult to detect.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it Works & Protection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-orange-400" />
              How Cryptojacking Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-400 text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Infection</h4>
                  <p className="text-sm text-gray-300">Malicious code enters through phishing emails, infected websites, or software vulnerabilities.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-400 text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Installation</h4>
                  <p className="text-sm text-gray-300">Mining software installs itself silently, often disguised as legitimate processes.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-orange-400 text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white">Mining</h4>
                  <p className="text-sm text-gray-300">Your computer's resources are used to solve complex mathematical problems for cryptocurrency rewards.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-green-400" />
              How to Protect Yourself
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white">Regular Monitoring</h4>
                  <p className="text-sm text-gray-300">Monitor CPU usage and running processes regularly for suspicious activity.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white">Keep Software Updated</h4>
                  <p className="text-sm text-gray-300">Install security patches and keep antivirus software up to date.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white">Use Ad Blockers</h4>
                  <p className="text-sm text-gray-300">Block malicious ads and scripts that can inject mining code.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold text-white">Network Monitoring</h4>
                  <p className="text-sm text-gray-300">Monitor network connections for suspicious mining pool communications.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scan Section */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-400" />
            System Scan
          </CardTitle>
          <CardDescription className="text-gray-400">
            Run a comprehensive scan to detect potential cryptojacking threats on your system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button
              onClick={runScan}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Run Cryptojacking Scan
                </>
              )}
            </button>
            
            {scanData && (
              <button
                onClick={downloadReport}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
              >
                <Download className="w-5 h-5" />
                Download Report
              </button>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Scan Failed</span>
              </div>
              <p className="text-red-300 mt-2">{error}</p>
            </div>
          )}

          {scanData && (
            <div className="space-y-6">
              {/* Risk Summary */}
              <div className={`p-6 rounded-lg border ${getRiskColor(scanData.scan_summary?.risk_level || 'UNKNOWN')}`}>
                <div className="flex items-center gap-3 mb-4">
                  {getRiskIcon(scanData.scan_summary?.risk_level || 'UNKNOWN')}
                  <div>
                    <h3 className="text-xl font-semibold">
                      Risk Level: {scanData.scan_summary?.risk_level || 'UNKNOWN'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {scanData.total_flags} potential threats detected
                    </p>
                  </div>
                </div>
                <p className="text-lg font-medium">{scanData.verdict}</p>
              </div>

              {/* Detailed Results */}
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="processes" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-blue-400">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5" />
                      Suspicious Processes ({scanData.suspicious_processes?.length || 0})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {scanData.suspicious_processes?.length > 0 ? (
                      <div className="space-y-3">
                        {scanData.suspicious_processes.map((process: any, index: number) => (
                          <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-white">{process.name}</h4>
                              <span className="text-red-400 text-sm">PID: {process.pid}</span>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">
                              <strong>Command:</strong> {process.cmdline || 'N/A'}
                            </p>
                            <div className="flex justify-between text-sm">
                              <span className="text-yellow-400">CPU: {process.cpu_percent}%</span>
                              <span className="text-red-400">{process.reason}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-green-400">No suspicious processes detected</p>
                    )}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="connections" className="border-slate-700">
                  <AccordionTrigger className="text-white hover:text-blue-400">
                    <div className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Suspicious Connections ({scanData.suspicious_connections?.length || 0})
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    {scanData.suspicious_connections?.length > 0 ? (
                      <div className="space-y-3">
                        {scanData.suspicious_connections.map((conn: any, index: number) => (
                          <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-white font-medium">
                                  {conn.laddr} → {conn.raddr}
                                </p>
                                <p className="text-sm text-gray-300">Status: {conn.status}</p>
                              </div>
                              <span className="text-red-400 text-sm">{conn.reason}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-green-400">No suspicious connections detected</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detection Criteria */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            What We Look For
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-red-400" />
                Suspicious Processes
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• High CPU usage ({'>'}70%)</li>
                <li>• Known mining software names (xmrig, minerd, etc.)</li>
                <li>• Suspicious command line arguments</li>
                <li>• Cryptocurrency-related process names</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                Suspicious Network Activity
              </h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Connections to mining pools (ports 3333, 4444)</li>
                <li>• Communication with known mining domains</li>
                <li>• Unusual network traffic patterns</li>
                <li>• Encrypted connections to suspicious IPs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CryptojackingDetection;
