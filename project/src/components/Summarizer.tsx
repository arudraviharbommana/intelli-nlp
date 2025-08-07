import React from 'react';
import { FileText, Upload, Download, Loader2, Sparkles, Settings } from 'lucide-react';
import { summarizeText } from '../utils/nlpUtils';
import { FileUpload } from './FileUpload';

interface SummarizerState {
  text: string;
  summary: string;
  summaryType: 'short' | 'detailed';
  method: 'abstractive' | 'extractive';
}

interface SummarizerProps {
  state: SummarizerState;
  updateState: (updates: Partial<SummarizerState>) => void;
}

export function Summarizer({ state, updateState }: SummarizerProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSummarize = async () => {
    if (!state.text.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await summarizeText(state.text, { 
        type: state.summaryType, 
        method: state.method 
      });
      updateState({ summary: result });
    } catch (error) {
      console.error('Summarization failed:', error);
      updateState({ summary: 'Failed to generate summary. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileContent = (content: string) => {
    updateState({ text: content });
  };

  const downloadSummary = () => {
    const blob = new Blob([state.summary], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'summary.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Text Summarization
          </h2>
        </div>
        <p className="text-gray-600 text-lg">Transform lengthy text into concise, meaningful summaries using advanced AI</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Input Text
            </h3>
            
            <div className="space-y-4">
              <FileUpload onFileContent={handleFileContent} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter text to summarize
                </label>
                <textarea
                  value={state.text}
                  onChange={(e) => updateState({ text: e.target.value })}
                  placeholder="Paste your text here or upload a file above..."
                  className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
                <div className="mt-2 text-sm text-gray-500">
                  {state.text.length} characters, ~{Math.ceil(state.text.split(' ').length)} words
                </div>
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-600" />
              Settings
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summarization Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateState({ method: 'abstractive' })}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      state.method === 'abstractive'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Abstractive (AI)
                  </button>
                  <button
                    onClick={() => updateState({ method: 'extractive' })}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      state.method === 'extractive'
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Extractive
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Summary Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateState({ summaryType: 'short' })}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      state.summaryType === 'short'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Short Summary
                  </button>
                  <button
                    onClick={() => updateState({ summaryType: 'detailed' })}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                      state.summaryType === 'detailed'
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Detailed
                  </button>
                </div>
              </div>

              <button
                onClick={handleSummarize}
                disabled={!state.text.trim() || isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Summary
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          {state.summary && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  Summary
                </h3>
                <button
                  onClick={downloadSummary}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {state.summary}
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                Summary generated using {state.method} method • {state.summaryType} format
              </div>
            </div>
          )}

          {!state.summary && !isLoading && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-200/50 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No Summary Yet</h3>
              <p className="text-gray-500">Enter some text and click "Generate Summary" to get started</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}