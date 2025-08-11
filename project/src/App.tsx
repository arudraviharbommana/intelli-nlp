import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, User, Bot, Image, FileText, File } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: Attachment[];
  processing?: boolean;
}

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url?: string;
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (type === 'application/pdf') return <FileText className="w-4 h-4" />;
  if (type.includes('code') || type.includes('javascript') || type.includes('typescript')) return <File className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

const COHERE_API_URL = "https://api.cohere.ai/v1/generate";
const COHERE_API_KEY = "64LtQMyWCmRPCiQjKyqpWgzlqIU09tqhSeNgws9e"; // Hardcoded Cohere API key

function App() {
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'chat' | 'quiz' | 'summarizer' | 'code' | 'formal'>('chat');
  const [error, setError] = useState<string | null>(null);

  // Store messages per mode
  const [modeMessages, setModeMessages] = useState<{ [key in typeof mode]: Message[] }>(() => {
    const saved = localStorage.getItem('modeMessages');
    if (saved) {
      const parsed = JSON.parse(saved);
      // Convert timestamps back to Date objects
      Object.keys(parsed).forEach(k => {
        parsed[k] = parsed[k].map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      });
      return parsed;
    }
    return {
      chat: [],
      quiz: [],
      summarizer: [],
      code: [],
      formal: [],
    };
  });

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [modeMessages, mode]);

  useEffect(() => {
    localStorage.setItem('modeMessages', JSON.stringify(modeMessages));
  }, [modeMessages]);

  const messages = modeMessages[mode];
  const setMessagesForMode = (msgs: Message[]) => {
    setModeMessages(prev => ({ ...prev, [mode]: msgs }));
  };

  async function fetchCohereResponse(prompt: string, history: Message[]) {
    let fullPrompt = '';
    if (mode === 'code') {
      fullPrompt = `You are a code analysis assistant. Analyze the following code, check for errors, and provide feedback.\n\n${prompt}`;
    } else {
      const context = history
        .map(msg => `${msg.type === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');
      fullPrompt = context ? `${context}\nUser: ${prompt}` : prompt;
    }
    const response = await fetch(COHERE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt: fullPrompt,
        max_tokens: 300,
      }),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || response.statusText);
    }
    const data = await response.json();
    return data.generations?.[0]?.text || 'No response';
  }

  const modeWelcome: { [key in typeof mode]: { title: string, desc: string } } = {
    chat: {
      title: 'Welcome to Chat Mode',
      desc: 'Ask anything or start a conversation. The agent will respond as a general assistant.'
    },
    quiz: {
      title: 'Welcome to Quiz Generator',
      desc: 'Provide content and the agent will generate quiz questions.'
    },
    summarizer: {
      title: 'Welcome to Summarizer',
      desc: 'Paste text and the agent will summarize it for you.'
    },
    code: {
      title: 'Welcome to Code Analyzer',
      desc: 'Paste code or ask for code analysis, debugging, or improvement.'
    },
    formal: {
      title: 'Welcome to Formal Fellow',
      desc: 'Paste text to transform style and tone professionally.'
    },
  };

  function detectTaskType(prompt: string): 'chat' | 'quiz' | 'summarizer' | 'code' | 'formal' | null {
    const p = prompt.toLowerCase();
    // Detect code by keywords or code-like patterns
    const codePatterns = [
      /def\s+\w+\s*\(/, // Python function
      /class\s+\w+/, // Class definition
      /function\s+\w+\s*\(/, // JS function
      /#include\s+<\w+>/, // C/C++ include
      /import\s+\w+/, // Import statement
      /\/\//, // JS/Java/C++ comment
      /#/ // Python comment
    ];
    if (codePatterns.some(re => re.test(prompt)) || p.match(/\.py|\.js|\.ts|\.cpp|\.c|\.java|\.html|\.css|\.json|\.md/)) return 'code';
    if (p.includes('quiz') || p.includes('question')) return 'quiz';
    if (p.includes('summarize') || p.includes('summary')) return 'summarizer';
    if (p.includes('formal') || p.includes('professional') || p.includes('rewrite')) return 'formal';
    if (p.trim()) return 'chat';
    return null;
  }

  const sendMessage = async () => {
    if (isProcessing || (!inputText.trim() && attachments.length === 0)) return;
    setError(null);
    const newMessage: Message = {
      id: `${Date.now()}`,
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      attachments: [...attachments],
    };
    setMessagesForMode([...messages, newMessage]);
    setInputText('');
    setAttachments([]);
    setIsProcessing(true);
    try {
      // Always process in current mode, no interruptions or suggestions
      const botContent = await fetchCohereResponse(newMessage.content, [...messages, newMessage]);
      const botResponse: Message = {
        id: `${Date.now() + 1}`,
        type: 'assistant',
        content: botContent,
        timestamp: new Date(),
      };
      setMessagesForMode([...messages, newMessage, botResponse]);
    } catch (err: any) {
      setError(err.message);
      setMessagesForMode([...messages, newMessage, {
        id: `${Date.now() + 2}`,
        type: 'assistant',
        content: `Error: ${err.message}`,
        timestamp: new Date(),
      }]);
    }
    setIsProcessing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: `${file.name}-${file.size}`,
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(att => att.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.shiftKey) return;
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleModeChange = (newMode: typeof mode) => {
    setMode(prevMode => {
      if (newMode === 'summarizer') {
        setModeMessages(prev => ({
          ...prev,
          summarizer: []
        }));
      }
      return newMode;
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mode Tabs */}
      <div className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-10 flex justify-center py-2 gap-2">
        {[
          { key: 'chat', label: 'Chat' },
          { key: 'quiz', label: 'Quiz Generator' },
          { key: 'summarizer', label: 'Summarizer' },
          { key: 'code', label: 'Code Analyzer' },
          { key: 'formal', label: 'Formal Fellow' }
        ].map(tab => (
          <button
            key={tab.key}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${mode === tab.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100'}`}
            onClick={() => handleModeChange(tab.key as typeof mode)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-14 w-full flex h-screen bg-gray-50">
        {/* Chat UI */}
        <div className="flex-1 flex flex-col">
          <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
            <div className="flex-1 text-center">
              <h2 className="text-lg font-semibold text-gray-800">
                {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
              </h2>
              <p className="text-sm text-gray-500">
                AI-powered response using Cohere API key (hardcoded)
              </p>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-300 rounded-2xl flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">{modeWelcome[mode].title}</h3>
                <p className="text-gray-600 max-w-md mb-8">{modeWelcome[mode].desc}</p>
              </div>
            ) : (
              messages.map(message => (
                <div key={message.id} className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'assistant' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-3xl ${message.type === 'user' ? 'order-1' : ''}`}>
                    <div className={`p-4 rounded-2xl ${message.type === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-white border border-gray-200 shadow-sm'}`}>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {message.attachments.map(attachment => (
                            <div key={attachment.id} className={`flex items-center gap-2 p-2 rounded-lg ${message.type === 'user' ? 'bg-blue-500' : 'bg-gray-50'}`}>
                              {getFileIcon(attachment.type)}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{attachment.name}</div>
                                <div className="text-xs opacity-75">{formatFileSize(attachment.size)}</div>
                              </div>
                              {attachment.type === 'image' && attachment.url && (
                                <img src={attachment.url} alt={attachment.name} className="w-12 h-12 object-cover rounded" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-2 opacity-75 ${message.type === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {message.type === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isProcessing && (
              <div className="flex gap-4 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-200 shadow-sm p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Processing your request...</span>
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm mb-2">{error}</div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="bg-white border-t border-gray-200 p-4">
            {attachments.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                    {getFileIcon(attachment.type)}
                    <span className="text-sm font-medium">{attachment.name}</span>
                    <button
                      onClick={() => removeAttachment(attachment.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-end gap-3">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".txt,.pdf,.doc,.docx,.ppt,.pptx,.js,.ts,.py,.java,.cpp,.c,.html,.css,.json,.md,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type your request for ${mode}... (Shift+Enter for new line)`}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none min-h-[80px] max-h-64"
                  rows={4}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={(!inputText.trim() && attachments.length === 0) || isProcessing}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500 text-center">
              Your Cohere API key is hardcoded in the source code for all modes.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
