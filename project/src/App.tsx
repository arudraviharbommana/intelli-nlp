import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, User, Bot } from 'lucide-react';

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
  switch (type) {
    case 'image': return <Image className="w-4 h-4" />;
    case 'pdf': return <FileText className="w-4 h-4" />;
    case 'code': return <File className="w-4 h-4" />;
    default: return <File className="w-4 h-4" />;
  }
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'chat' | 'quiz' | 'summarizer' | 'code' | 'formal'>('chat');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  async function fetchCohereResponse(prompt: string) {
    const response = await fetch(COHERE_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${COHERE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'command',
        prompt,
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
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    setAttachments([]);
    setIsProcessing(true);
    try {
      const prompt = `${mode.toUpperCase()} MODE: ${newMessage.content}`;
      const botContent = await fetchCohereResponse(prompt);
      const botResponse: Message = {
        id: `${Date.now() + 1}`,
        type: 'assistant',
        content: botContent,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    } catch (err: any) {
      setError(err.message);
      setMessages(prev => [...prev, {
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
    if (e.key === 'Enter' && e.shiftKey) {
      // Allow new line
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage();
    }
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
            onClick={() => setMode(tab.key as typeof mode)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-14 w-full flex h-screen bg-gray-50">
        {/* Shared chat UI for all modes */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
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
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to IntelliNLP</h3>
                <p className="text-gray-600 max-w-md">
                  Type your request and get a generated response for any mode.
                </p>
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
                    <div className={`p-4 rounded-2xl ${
                      message.type === 'user' 
                        ? 'bg-blue-600 text-white ml-auto' 
                        : 'bg-white border border-gray-200 shadow-sm'
                    }`}>
                      {/* Attachments */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mb-3 space-y-2">
                          {message.attachments.map(attachment => (
                            <div key={attachment.id} className={`flex items-center gap-2 p-2 rounded-lg ${
                              message.type === 'user' ? 'bg-blue-500' : 'bg-gray-50'
                            }`}>
                              {getFileIcon(attachment.type)}
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{attachment.name}</div>
                                <div className="text-xs opacity-75">{formatFileSize(attachment.size)}</div>
                              </div>
                              {attachment.type === 'image' && attachment.url && (
                                <img 
                                  src={attachment.url} 
                                  alt={attachment.name}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Message Content */}
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-2 opacity-75 ${
                        message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
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
          {/* Input Area */}
          <div className="bg-white border-t border-gray-200 p-4">
            {/* Attachments Preview */}
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
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-48"
                  rows={1}
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