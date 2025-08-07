import React from 'react';
import { Sparkles, Upload, Download, Loader2, Wand2, FileText, Users, Target } from 'lucide-react';
import { convertToFormal } from '../utils/formalConversionUtils';
import { FileUpload } from './FileUpload';

interface FormalFellowState {
  inputText: string;
  outputText: string;
  conversionType: 'formal' | 'simplified' | 'detailed' | 'speech' | 'academic' | 'professional';
  tone: 'neutral' | 'persuasive' | 'informative' | 'conversational';
  targetAudience: 'general' | 'academic' | 'business' | 'technical';
}

interface FormalFellowProps {
  state: FormalFellowState;
  updateState: (updates: Partial<FormalFellowState>) => void;
}

export function FormalFellow({ state, updateState }: FormalFellowProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConvert = async () => {
    if (!state.inputText.trim()) return;
    
    setIsLoading(true);
    try {
      const result = await convertToFormal(state.inputText, {
        conversionType: state.conversionType,
        tone: state.tone,
        targetAudience: state.targetAudience
      });
      updateState({ outputText: result });
    } catch (error) {
      console.error('Formal conversion failed:', error);
      updateState({ outputText: 'Failed to convert text. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileContent = (content: string) => {
    updateState({ inputText: content });
  };

  const downloadOutput = () => {
    const blob = new Blob([state.outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formal_${state.conversionType}_content.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const conversionTypes = [
    { id: 'formal', label: 'Formal Language', description: 'Convert to professional, formal tone' },
    { id: 'simplified', label: 'Simplified', description: 'Make content easier to understand' },
    { id: 'detailed', label: 'Detailed Explanation', description: 'Expand with comprehensive details' },
    { id: 'speech', label: 'Speech Format', description: 'Convert to presentation/speech style' },
    { id: 'academic', label: 'Academic Style', description: 'Scholarly and research-oriented tone' },
    { id: 'professional', label: 'Professional', description: 'Business-appropriate language' }
  ];

  const tones = [
    { id: 'neutral', label: 'Neutral', description: 'Balanced and objective' },
    { id: 'persuasive', label: 'Persuasive', description: 'Convincing and compelling' },
    { id: 'informative', label: 'Informative', description: 'Educational and explanatory' },
    { id: 'conversational', label: 'Conversational', description: 'Friendly and approachable' }
  ];

  const audiences = [
    { id: 'general', label: 'General Public', description: 'Broad audience appeal' },
    { id: 'academic', label: 'Academic', description: 'Researchers and scholars' },
    { id: 'business', label: 'Business', description: 'Corporate professionals' },
    { id: 'technical', label: 'Technical', description: 'Subject matter experts' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
            Formal Fellow
          </h2>
        </div>
        <p className="text-gray-600 text-lg">Transform your content with intelligent language conversion and enhancement</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-violet-600" />
              Input Content
            </h3>
            
            <div className="space-y-4">
              <FileUpload onFileContent={handleFileContent} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter content to transform
                </label>
                <textarea
                  value={state.inputText}
                  onChange={(e) => updateState({ inputText: e.target.value })}
                  placeholder="Paste your content here or upload a file above. You can also include specific instructions like 'make this more formal for a business presentation' or 'simplify this for general audience'..."
                  className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 resize-none"
                />
                <div className="mt-2 text-sm text-gray-500">
                  {state.inputText.length} characters, ~{Math.ceil(state.inputText.split(' ').length)} words
                </div>
              </div>
            </div>
          </div>

          {/* Output Section */}
          {state.outputText && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-green-600" />
                  Transformed Content
                </h3>
                <button
                  onClick={downloadOutput}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-4 border border-green-200">
                <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {state.outputText}
                </div>
              </div>
              
              <div className="mt-4 text-sm text-gray-500">
                Converted to {state.conversionType} style • {state.tone} tone • {state.targetAudience} audience
              </div>
            </div>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          {/* Conversion Type */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Conversion Type
            </h3>
            
            <div className="space-y-3">
              {conversionTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => updateState({ conversionType: type.id as any })}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    state.conversionType === type.id
                      ? 'bg-violet-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{type.label}</div>
                  <div className={`text-sm ${state.conversionType === type.id ? 'text-violet-100' : 'text-gray-500'}`}>
                    {type.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-600" />
              Tone
            </h3>
            
            <div className="grid grid-cols-2 gap-2">
              {tones.map((tone) => (
                <button
                  key={tone.id}
                  onClick={() => updateState({ tone: tone.id as any })}
                  className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    state.tone === tone.id
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={tone.description}
                >
                  {tone.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target Audience */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-pink-600" />
              Target Audience
            </h3>
            
            <div className="space-y-2">
              {audiences.map((audience) => (
                <button
                  key={audience.id}
                  onClick={() => updateState({ targetAudience: audience.id as any })}
                  className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                    state.targetAudience === audience.id
                      ? 'bg-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="font-medium">{audience.label}</div>
                  <div className={`text-sm ${state.targetAudience === audience.id ? 'text-pink-100' : 'text-gray-500'}`}>
                    {audience.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={!state.inputText.trim() || isLoading}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Transforming Content...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Transform Content
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tips Section */}
      {!state.outputText && !isLoading && (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Smart Conversion Tips
          </h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Include Instructions</h4>
              <p className="text-blue-700 text-sm">
                Add specific instructions in your text like "make this suitable for a board meeting" or "explain this to a 10-year-old"
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Context Matters</h4>
              <p className="text-green-700 text-sm">
                The AI analyzes your content and instructions to determine the best conversion approach automatically
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
              <h4 className="font-semibold text-purple-800 mb-2">Multiple Styles</h4>
              <p className="text-purple-700 text-sm">
                Try different conversion types and tones to find the perfect style for your needs
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">Smart Detection</h4>
              <p className="text-orange-700 text-sm">
                The system automatically detects if you want simplification, formalization, or detailed explanation
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}