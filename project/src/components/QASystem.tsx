import React from 'react';
import { MessageSquare, Upload, Brain, Loader2, Send, Bot, User } from 'lucide-react';
import { answerQuestion } from '../utils/nlpUtils';
import { FileUpload } from './FileUpload';

interface QAHistory {
  question: string;
  answer: string;
  timestamp: Date;
}

interface QAState {
  context: string;
  question: string;
  answer: string;
  history: QAHistory[];
}

interface QASystemProps {
  state: QAState;
  updateState: (updates: Partial<QAState>) => void;
}

export function QASystem({ state, updateState }: QASystemProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleAskQuestion = async () => {
    if (!state.context.trim() || !state.question.trim()) return;
    
    setIsLoading(true);
    try {
      const answer = await answerQuestion(state.question, state.context);
      const newQA: QAHistory = {
        question: state.question,
        answer,
        timestamp: new Date()
      };
      updateState({
        answer,
        history: [newQA, ...state.history],
        question: ''
      });
    } catch (error) {
      console.error('Q&A failed:', error);
      const errorQA: QAHistory = {
        question: state.question,
        answer: 'Sorry, I could not process your question. Please try again.',
        timestamp: new Date()
      };
      updateState({
        answer: 'Sorry, I could not process your question. Please try again.',
        history: [errorQA, ...state.history]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileContent = (content: string) => {
    updateState({ context: content });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
            Q&A System
          </h2>
        </div>
        <p className="text-gray-600 text-lg">Ask questions about any text and get intelligent answers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Context Input */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              Context
            </h3>
            
            <div className="space-y-4">
              <FileUpload onFileContent={handleFileContent} />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter context text
                </label>
                <textarea
                  value={state.context}
                  onChange={(e) => updateState({ context: e.target.value })}
                  placeholder="Provide the context or document content..."
                  className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
                />
                <div className="mt-2 text-sm text-gray-500">
                  {state.context.length} characters
                </div>
              </div>
            </div>
          </div>

          {/* Question Input */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-teal-600" />
              Ask a Question
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your question
                </label>
                <textarea
                  value={state.question}
                  onChange={(e) => updateState({ question: e.target.value })}
                  onKeyPress={handleKeyPress}
                  placeholder="What would you like to know about the context?"
                  className="w-full h-24 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              <button
                onClick={handleAskQuestion}
                disabled={!state.context.trim() || !state.question.trim() || isLoading}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Ask Question
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Q&A History */}
        <div className="lg:col-span-2">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 h-[600px] flex flex-col">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Conversation
            </h3>
            
            <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
              {state.history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">No questions yet</h4>
                  <p className="text-gray-500">Provide context and ask your first question to get started</p>
                </div>
              ) : (
                state.history.map((qa, index) => (
                  <div key={index} className="space-y-3">
                    {/* Question */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 bg-blue-50 rounded-xl p-4 border border-blue-200">
                        <p className="text-gray-800">{qa.question}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {qa.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    {/* Answer */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-4 border border-green-200">
                        <p className="text-gray-800 leading-relaxed">{qa.answer}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}