import React from 'react';
import { Code, Upload, Download, Loader2, Bug, CheckCircle, AlertTriangle, FileCode, Lightbulb, Play, Zap, Shield, Target } from 'lucide-react';
import { analyzeCode } from '../utils/codeAnalysisUtils';
import { CodeFileUpload } from './CodeFileUpload';

interface CodeAnalysis {
  overview: {
    language: string;
    purpose: string;
    complexity: 'Low' | 'Medium' | 'High';
    linesOfCode: number;
  };
  functionality: {
    mainFeatures: string[];
    keyFunctions: string[];
    dataStructures: string[];
    algorithms: string[];
  };
  libraries: {
    name: string;
    purpose: string;
    usage: string[];
  }[];
  dryRun: {
    scenario: string;
    steps: string[];
    expectedOutput: string;
    variables: { name: string; value: string; type: string }[];
  };
  errors: {
    type: 'Syntax' | 'Logic' | 'Runtime' | 'Style' | 'Security';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    line: number;
    message: string;
    originalCode: string;
    suggestedFix: string;
    explanation: string;
  }[];
  suggestions: {
    type: 'Performance' | 'Best Practice' | 'Security' | 'Readability';
    message: string;
    improvement: string;
  }[];
  correctedCode?: string;
}

interface CodeAnalyzerState {
  code: string;
  language: string;
  analysis: CodeAnalysis | null;
  correctedCode: string;
  fileName: string;
}

interface CodeAnalyzerProps {
  state: CodeAnalyzerState;
  updateState: (updates: Partial<CodeAnalyzerState>) => void;
}

export function CodeAnalyzer({ state, updateState }: CodeAnalyzerProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAnalyzeCode = async () => {
    if (!state.code.trim()) return;
    
    setIsLoading(true);
    try {
      const analysis = await analyzeCode(state.code, state.language);
      updateState({ analysis, correctedCode: analysis.correctedCode || state.code });
    } catch (error) {
      console.error('Code analysis failed:', error);
      updateState({ analysis: null });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileContent = (content: string, fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const languageMap: { [key: string]: string } = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'php': 'php',
      'rb': 'ruby',
      'go': 'go',
      'rs': 'rust',
      'swift': 'swift',
      'kt': 'kotlin'
    };
    
    const detectedLanguage = languageMap[extension || ''] || 'javascript';
    updateState({ 
      code: content, 
      fileName,
      language: detectedLanguage,
      analysis: null,
      correctedCode: ''
    });
  };

  const downloadCorrectedCode = () => {
    if (!state.correctedCode) return;
    
    const blob = new Blob([state.correctedCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = state.fileName ? `corrected_${state.fileName}` : `corrected_code.${state.language === 'javascript' ? 'js' : state.language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAnalysisReport = () => {
    if (!state.analysis) return;
    
    const report = generateAnalysisReport(state.analysis);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'code_analysis_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateAnalysisReport = (analysis: CodeAnalysis): string => {
    return `
CODE ANALYSIS REPORT
===================

OVERVIEW
--------
Language: ${analysis.overview.language}
Purpose: ${analysis.overview.purpose}
Complexity: ${analysis.overview.complexity}
Lines of Code: ${analysis.overview.linesOfCode}

FUNCTIONALITY
-------------
Main Features:
${analysis.functionality.mainFeatures.map(f => `• ${f}`).join('\n')}

Key Functions:
${analysis.functionality.keyFunctions.map(f => `• ${f}`).join('\n')}

LIBRARIES USED
--------------
${analysis.libraries.map(lib => `
${lib.name}:
  Purpose: ${lib.purpose}
  Usage: ${lib.usage.join(', ')}
`).join('\n')}

ERRORS FOUND
------------
${analysis.errors.map((error, i) => `
Error ${i + 1}: ${error.type} (${error.severity})
Line ${error.line}: ${error.message}
Original: ${error.originalCode}
Fix: ${error.suggestedFix}
Explanation: ${error.explanation}
`).join('\n')}

SUGGESTIONS
-----------
${analysis.suggestions.map(s => `• ${s.type}: ${s.message}`).join('\n')}
    `.trim();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      {/* Header Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Code className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
              Code Analyzer
            </h2>
            <p className="text-lg text-gray-600 mt-1">Advanced code analysis with intelligent error detection</p>
          </div>
        </div>
        <div className="max-w-3xl mx-auto">
          <p className="text-gray-700 text-lg leading-relaxed">
            Upload your code or paste it directly to get comprehensive analysis including functionality breakdown, 
            error detection with fixes, performance suggestions, and downloadable corrected code.
          </p>
        </div>
      </div>

      {/* Input Section */}
      {!state.analysis && (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Code Input */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/60 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Upload className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Input Code</h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-50/80 rounded-2xl p-6 border border-gray-200">
                  <CodeFileUpload onFileContent={handleFileContent} />
                </div>
                
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Enter code to analyze
                  </label>
                  <textarea
                    value={state.code}
                    onChange={(e) => updateState({ code: e.target.value })}
                    placeholder="Paste your code here or upload a file above..."
                    className="w-full h-80 p-6 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 resize-none font-mono text-sm bg-gray-50/50 backdrop-blur-sm"
                  />
                  <div className="flex items-center justify-between mt-4 text-sm text-gray-600 bg-gray-100/80 rounded-xl p-4">
                    <span>{state.code.length} characters</span>
                    <span>{state.code.split('\n').length} lines</span>
                    <span>~{Math.ceil(state.code.split(' ').filter(w => w.length > 0).length)} words</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Panel */}
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/60 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <FileCode className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Settings</h3>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700">
                    Programming Language
                  </label>
                  <select
                    value={state.language}
                    onChange={(e) => updateState({ language: e.target.value })}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-300 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                    <option value="csharp">C#</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="swift">Swift</option>
                    <option value="kotlin">Kotlin</option>
                  </select>
                </div>

                {state.fileName && (
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                    <div className="flex items-center gap-3">
                      <FileCode className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-blue-800">File Uploaded</div>
                        <div className="text-sm text-blue-600">{state.fileName}</div>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAnalyzeCode}
                  disabled={!state.code.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-orange-700 hover:via-red-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      Analyzing Code...
                    </>
                  ) : (
                    <>
                      <Zap className="w-6 h-6" />
                      Analyze Code
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-6 border-2 border-blue-200/50">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-blue-800">Quick Tips</h4>
              </div>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>• Upload files or paste code directly</li>
                <li>• Supports 13+ programming languages</li>
                <li>• Get detailed error analysis & fixes</li>
                <li>• Download corrected code instantly</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {state.analysis && (
        <div className="space-y-10">
          {/* Overview Cards */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/60">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                  <Code className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900">Analysis Results</h3>
                  <p className="text-gray-600">Comprehensive code analysis and insights</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={downloadAnalysisReport}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                >
                  <Download className="w-4 h-4" />
                  Report
                </button>
                {state.correctedCode && (
                  <button
                    onClick={downloadCorrectedCode}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Download className="w-4 h-4" />
                    Fixed Code
                  </button>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="text-sm font-medium opacity-90">Language</div>
                <div className="text-2xl font-bold mt-1">{state.analysis.overview.language}</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="text-sm font-medium opacity-90">Complexity</div>
                <div className="text-2xl font-bold mt-1">{state.analysis.overview.complexity}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-violet-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="text-sm font-medium opacity-90">Lines of Code</div>
                <div className="text-2xl font-bold mt-1">{state.analysis.overview.linesOfCode}</div>
              </div>
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-2xl text-white shadow-lg">
                <div className="text-sm font-medium opacity-90">Issues Found</div>
                <div className="text-2xl font-bold mt-1">{state.analysis.errors.length}</div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-gray-200">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                Code Purpose
              </h4>
              <p className="text-gray-700 leading-relaxed">{state.analysis.overview.purpose}</p>
            </div>
          </div>

          {/* Functionality Analysis */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/60">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Functionality Analysis</h3>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-lg mb-4">Main Features</h4>
                <div className="space-y-3">
                  {state.analysis.functionality.mainFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-lg mb-4">Key Functions</h4>
                <div className="space-y-3">
                  {state.analysis.functionality.keyFunctions.map((func, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <Code className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 font-mono text-sm">{func}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Libraries */}
          {state.analysis.libraries.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/60">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <FileCode className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Libraries & Dependencies</h3>
              </div>
              
              <div className="grid gap-6">
                {state.analysis.libraries.map((lib, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 border-2 border-purple-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                      <h4 className="font-bold text-purple-800 text-lg">{lib.name}</h4>
                    </div>
                    <p className="text-purple-700 mb-4 leading-relaxed">{lib.purpose}</p>
                    <div className="text-sm text-purple-600">
                      <strong>Usage:</strong> {lib.usage.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dry Run */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/60">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Play className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Execution Simulation</h3>
            </div>
            
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
                <h4 className="font-bold text-green-800 mb-3 text-lg">Scenario</h4>
                <p className="text-green-700 leading-relaxed">{state.analysis.dryRun.scenario}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-gray-800 mb-4 text-lg">Execution Steps</h4>
                  <div className="space-y-4">
                    {state.analysis.dryRun.steps.map((step, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-700 leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-gray-800 mb-4 text-lg">Variables</h4>
                  <div className="space-y-3">
                    {state.analysis.dryRun.variables.map((variable, index) => (
                      <div key={index} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-sm font-bold text-gray-800">{variable.name}</span>
                          <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded-full">{variable.type}</span>
                        </div>
                        <div className="font-mono text-sm text-blue-600 bg-blue-50 p-2 rounded">{variable.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200">
                <h4 className="font-bold text-blue-800 mb-3 text-lg">Expected Output</h4>
                <pre className="text-blue-700 font-mono text-sm whitespace-pre-wrap bg-blue-100/50 p-4 rounded-xl">{state.analysis.dryRun.expectedOutput}</pre>
              </div>
            </div>
          </div>

          {/* Errors */}
          {state.analysis.errors.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/60">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Issues & Fixes</h3>
              </div>
              
              <div className="space-y-6">
                {state.analysis.errors.map((error, index) => (
                  <div key={index} className="bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className={`w-6 h-6 ${
                        error.severity === 'Critical' ? 'text-red-600' :
                        error.severity === 'High' ? 'text-orange-600' :
                        error.severity === 'Medium' ? 'text-yellow-600' : 'text-blue-600'
                      }`} />
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        error.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                        error.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                        error.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {error.type} - {error.severity}
                      </span>
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">Line {error.line}</span>
                    </div>
                    
                    <h4 className="font-bold text-gray-800 mb-3 text-lg">{error.message}</h4>
                    <p className="text-gray-700 mb-6 leading-relaxed">{error.explanation}</p>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          Original Code
                        </h5>
                        <pre className="bg-red-100 border-2 border-red-300 rounded-xl p-4 text-sm font-mono text-red-800 overflow-x-auto">
                          {error.originalCode}
                        </pre>
                      </div>
                      <div>
                        <h5 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                          Suggested Fix
                        </h5>
                        <pre className="bg-green-100 border-2 border-green-300 rounded-xl p-4 text-sm font-mono text-green-800 overflow-x-auto">
                          {error.suggestedFix}
                        </pre>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {state.analysis.suggestions.length > 0 && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-200/60">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Improvement Suggestions</h3>
              </div>
              
              <div className="grid gap-6">
                {state.analysis.suggestions.map((suggestion, index) => (
                  <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        suggestion.type === 'Performance' ? 'bg-blue-100 text-blue-800' :
                        suggestion.type === 'Security' ? 'bg-red-100 text-red-800' :
                        suggestion.type === 'Best Practice' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {suggestion.type}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-800 mb-3 text-lg">{suggestion.message}</h4>
                    <p className="text-gray-700 leading-relaxed">{suggestion.improvement}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center gap-6 pt-8">
            <button
              onClick={() => updateState({ analysis: null, correctedCode: '' })}
              className="bg-gradient-to-r from-gray-600 to-gray-700 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Analyze New Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}