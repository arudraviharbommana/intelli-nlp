import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, User, Bot, History, Settings, Plus, Trash2, Edit3, Image, FileText, File, Mic } from 'lucide-react';
import { processMessage } from './utils/chatProcessor';

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
  type: 'text' | 'image' | 'pdf' | 'ppt' | 'doc' | 'code';
  size: number;
  content?: string;
  url?: string;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
}

function App() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId);

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('intellinlp-sessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        setSessions(parsed.map((s: any) => ({
          ...s,
          lastUpdated: new Date(s.lastUpdated),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        })));
      } catch (error) {
        console.error('Failed to load sessions:', error);
      }
    }
  }, []);

  // Sanitize sessions data for localStorage to prevent quota exceeded errors
  const sanitizeSessionsForStorage = (sessions: ChatSession[]): ChatSession[] => {
    return sessions.map(session => ({
      ...session,
      messages: session.messages.map(message => ({
        ...message,
        attachments: message.attachments?.map(attachment => ({
          id: attachment.id,
          name: attachment.name,
          type: attachment.type,
          size: attachment.size,
          // Remove content and url to reduce storage size
          // These will not be available after page reload
        }))
      }))
    }));
  };

  // Save sessions to localStorage with error handling
  useEffect(() => {
    if (sessions.length > 0) {
      try {
        const sanitizedSessions = sanitizeSessionsForStorage(sessions);
        const serializedData = JSON.stringify(sanitizedSessions);
        
        // Check if the data size is reasonable (less than 4MB to be safe)
        const dataSize = new Blob([serializedData]).size;
        if (dataSize > 4 * 1024 * 1024) { // 4MB limit
          console.warn('Session data too large, keeping only recent sessions');
          // Keep only the 10 most recent sessions
          const recentSessions = sanitizedSessions.slice(0, 10);
          localStorage.setItem('intellinlp-sessions', JSON.stringify(recentSessions));
        } else {
          localStorage.setItem('intellinlp-sessions', serializedData);
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === 'QuotaExceededError') {
          console.warn('localStorage quota exceeded, clearing old data and keeping recent sessions');
          try {
            // Clear existing data and keep only the 5 most recent sessions
            const recentSessions = sanitizeSessionsForStorage(sessions.slice(0, 5));
            localStorage.setItem('intellinlp-sessions', JSON.stringify(recentSessions));
          } catch (retryError) {
            console.error('Failed to save even reduced session data:', retryError);
            // Clear all session data as last resort
            localStorage.removeItem('intellinlp-sessions');
          }
        } else {
          console.error('Failed to save sessions:', error);
        }
      }
    }
  }, [sessions]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession?.messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [inputText]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      lastUpdated: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId);
      setCurrentSessionId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? { ...s, title } : s
    ));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      try {
        const attachment: Attachment = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          type: getFileType(file),
          size: file.size
        };
        
        // Process file content properly
        if (file.type.startsWith('image/')) {
          // For images, store as data URL
          const dataUrl = await readFileAsDataURL(file);
          attachment.url = dataUrl;
          attachment.content = `Image file: ${file.name}`;
        } else {
          // For text-based files, read as text with proper encoding
          try {
            const content = await readFileAsText(file);
            attachment.content = content;
          } catch (error) {
            console.error(`Error reading ${file.name}:`, error);
            attachment.content = `Error reading file: ${error.message}`;
          }
        }
        
        setAttachments(prev => [...prev, attachment]);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        alert(`Error processing ${file.name}: ${error.message}`);
      }
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) {
          reject(new Error('Failed to read file content'));
          return;
        }
        resolve(result);
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      
      // Try UTF-8 first, fallback to other encodings if needed
      reader.readAsText(file, 'UTF-8');
    });
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) {
          reject(new Error('Failed to read file as data URL'));
          return;
        }
        resolve(result);
      };
      
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsDataURL(file);
    });
  };

  const getFileType = (file: File): Attachment['type'] => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf') || extension === 'pdf') return 'pdf';
    if (file.type.includes('document') || ['doc', 'docx'].includes(extension || '')) return 'doc';
    if (file.type.includes('presentation') || ['ppt', 'pptx'].includes(extension || '')) return 'ppt';
    if (['js', 'ts', 'py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs'].includes(extension || '')) return 'code';
    
    return 'text';
  };

  const removeAttachment = (attachmentId: string) => {
    setAttachments(prev => prev.filter(a => a.id !== attachmentId));
  };

  const sendMessage = async () => {
    if (!inputText.trim() && attachments.length === 0) return;
    
    // Create or use current session
    let sessionId = currentSessionId;
    if (!sessionId) {
      createNewSession();
      sessionId = Date.now().toString();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    // Add user message
    setSessions(prev => prev.map(s => 
      s.id === sessionId ? {
        ...s,
        messages: [...s.messages, userMessage],
        lastUpdated: new Date(),
        title: s.messages.length === 0 ? generateSessionTitle(inputText) : s.title
      } : s
    ));

    // Clear input
    const messageContent = inputText;
    const messageAttachments = [...attachments];
    setInputText('');
    setAttachments([]);
    setIsProcessing(true);

    try {
      // Process message with AI
      const response = await processMessage(messageContent, messageAttachments);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      // Add assistant response
      setSessions(prev => prev.map(s => 
        s.id === sessionId ? {
          ...s,
          messages: [...s.messages, assistantMessage],
          lastUpdated: new Date()
        } : s
      ));
    } catch (error) {
      console.error('Failed to process message:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again with a different file or check that your file is not corrupted.',
        timestamp: new Date()
      };

      setSessions(prev => prev.map(s => 
        s.id === sessionId ? {
          ...s,
          messages: [...s.messages, errorMessage],
          lastUpdated: new Date()
        } : s
      ));
    } finally {
      setIsProcessing(false);
    }
  };

  const generateSessionTitle = (firstMessage: string): string => {
    const words = firstMessage.trim().split(' ').slice(0, 4);
    return words.join(' ') + (firstMessage.split(' ').length > 4 ? '...' : '');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getFileIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'pdf': return <FileText className="w-4 h-4" />;
      case 'code': return <File className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 bg-gray-900 text-white flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-lg font-bold">IntelliNLP</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 hover:bg-gray-700 rounded"
            >
              ×
            </button>
          </div>
          
          <button
            onClick={createNewSession}
            className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-2">
          <div className="space-y-1">
            {sessions.map(session => (
              <div
                key={session.id}
                className={`group flex items-center gap-2 p-3 rounded-lg cursor-pointer transition-colors ${
                  currentSessionId === session.id ? 'bg-gray-700' : 'hover:bg-gray-800'
                }`}
                onClick={() => setCurrentSessionId(session.id)}
              >
                <History className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{session.title}</div>
                  <div className="text-xs text-gray-400">
                    {session.messages.length} messages
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const newTitle = prompt('Enter new title:', session.title);
                      if (newTitle) updateSessionTitle(session.id, newTitle);
                    }}
                    className="p-1 hover:bg-gray-600 rounded"
                  >
                    <Edit3 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this chat?')) deleteSession(session.id);
                    }}
                    className="p-1 hover:bg-gray-600 rounded text-red-400"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <History className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex-1 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentSession?.title || 'IntelliNLP Assistant'}
            </h2>
            <p className="text-sm text-gray-500">
              AI-powered text analysis and processing
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!currentSession || currentSession.messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to IntelliNLP</h3>
              <p className="text-gray-600 max-w-md">
                I can help you with text summarization, quiz generation, Q&A, code analysis, and formal writing. 
                Upload files or start typing to begin!
              </p>
              <div className="grid grid-cols-2 gap-4 mt-8 max-w-lg">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">Text Analysis</h4>
                  <p className="text-sm text-blue-600">Summarize, analyze, and extract insights from any text</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">Quiz Generation</h4>
                  <p className="text-sm text-green-600">Create intelligent quizzes from your content</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">Code Analysis</h4>
                  <p className="text-sm text-purple-600">Analyze, debug, and improve your code</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">Writing Assistant</h4>
                  <p className="text-sm text-orange-600">Transform text style and tone professionally</p>
                </div>
              </div>
            </div>
          ) : (
            currentSession.messages.map(message => (
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
                placeholder="Type your message... (Shift+Enter for new line)"
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
            IntelliNLP can analyze text, images, code, and documents. Upload files or type your request.
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;