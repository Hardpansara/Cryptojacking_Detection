
import React, { useState } from 'react';
import { Upload, FileText, Shield, AlertTriangle, CheckCircle, Download, Hash, Activity } from 'lucide-react';

const FileScanner = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanResult, setScanResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setScanResult(null);
    setError('');
  };

  const handleScanFile = async () => {
    if (!selectedFile) {
      setError('Please select a file to scan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      console.log('Sending file for scanning:', selectedFile.name);
      const response = await fetch('http://localhost:5000/api/scan-file', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Scan result received:', result);
      setScanResult(result);
    } catch (error) {
      console.error('Error scanning file:', error);
      setError('Failed to scan file. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!scanResult) return;

    const reportData = JSON.stringify(scanResult, null, 2);
    const blob = new Blob([reportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${scanResult.filename}_scan_report.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict.toLowerCase()) {
      case 'clean':
        return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'suspicious':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      default:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel?.toLowerCase()) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">File Scanner</h2>
        <p className="text-gray-400">Upload and analyze files for cryptojacking indicators</p>
      </div>

      {/* File Upload Section */}
      <div className="bg-slate-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <Upload size={24} />
          Upload File for Analysis
        </h3>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
            <input
              type="file"
              id="file-input"
              onChange={handleFileSelect}
              className="hidden"
              accept=".exe,.sh,.json,.txt,.py,.js,.bat,.cmd,.ps1,.vbs"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <FileText size={48} className="mx-auto text-slate-400 mb-4" />
              <p className="text-white font-medium mb-2">
                {selectedFile ? selectedFile.name : 'Choose a file to scan'}
              </p>
              <p className="text-gray-400 text-sm">
                Supported: .exe, .sh, .json, .txt, .py, .js, .bat, .cmd, .ps1, .vbs
              </p>
            </label>
          </div>

          {selectedFile && (
            <div className="bg-slate-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">
                    Size: {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={handleScanFile}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <Activity size={18} className="animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <Shield size={18} />
                      Scan File
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle size={20} className="text-red-400" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scan Results Section */}
      {scanResult && (
        <div className="bg-slate-800 rounded-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white flex items-center gap-2">
              <FileText size={24} />
              Scan Results
            </h3>
            <button
              onClick={downloadReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center gap-2"
            >
              <Download size={18} />
              Download Report
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* File Information */}
            <div className="bg-slate-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4">File Information</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Filename:</span>
                  <span className="text-white font-mono">{scanResult.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Size:</span>
                  <span className="text-white">{scanResult.filesize_human}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entropy:</span>
                  <span className="text-white">{scanResult.entropy}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">SHA256:</span>
                  <div className="flex items-center gap-2">
                    <Hash size={16} className="text-gray-400" />
                    <span className="text-white font-mono text-sm">
                      {scanResult.sha256.substring(0, 16)}...
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div className="bg-slate-700 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-white mb-4">Analysis Result</h4>
              <div className="space-y-4">
                <div className={`rounded-lg p-4 border ${getVerdictColor(scanResult.verdict)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    {scanResult.verdict === 'Clean' ? (
                      <CheckCircle size={24} className="text-green-400" />
                    ) : (
                      <AlertTriangle size={24} className="text-red-400" />
                    )}
                    <span className="font-semibold text-lg">{scanResult.verdict}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Risk Level:</span>
                    <span className={`font-semibold ${getRiskLevelColor(scanResult.risk_level)}`}>
                      {scanResult.risk_level}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Details */}
          <div className="bg-slate-700 rounded-lg p-6 mb-6">
            <h4 className="text-lg font-semibold text-white mb-4">Analysis Details</h4>
            <div className="space-y-2">
              {scanResult.analysis?.map((item: string, index: number) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                  <p className="text-gray-300">{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords Found */}
          {scanResult.keywords_matched && scanResult.keywords_matched.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} />
                Suspicious Keywords Found
              </h4>
              <div className="flex flex-wrap gap-2">
                {scanResult.keywords_matched.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className="bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-mono"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Scan Timestamp */}
          <div className="text-center pt-4 border-t border-slate-600">
            <p className="text-gray-400 text-sm">
              Scan completed: {new Date(scanResult.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Information Section */}
      <div className="bg-slate-800 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-white mb-6">How File Scanning Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-400">Detection Methods</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                <span><strong>Entropy Analysis:</strong> Detects packed or encrypted files</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                <span><strong>Keyword Scanning:</strong> Searches for mining-related terms</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                <span><strong>Filename Analysis:</strong> Checks for suspicious naming patterns</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-400 mt-2"></div>
                <span><strong>Hash Generation:</strong> Creates unique file fingerprint</span>
              </li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-400">Suspicious Indicators</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                <span>High entropy values ({'>'}7.5)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                <span>Mining pool addresses (stratum+tcp)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                <span>Cryptocurrency keywords (xmr, monero)</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-400 mt-2"></div>
                <span>Known miner software names</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileScanner;
