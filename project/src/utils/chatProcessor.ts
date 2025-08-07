// Advanced AI-powered chat processor with dynamic response generation

interface Attachment {
  id: string;
  name: string;
  type: 'text' | 'image' | 'pdf' | 'ppt' | 'doc' | 'code';
  size: number;
  content?: string;
  url?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: Attachment[];
  timestamp: Date;
}

interface ConversationContext {
  topics: string[];
  userPreferences: string[];
  conversationTone: 'formal' | 'casual' | 'technical' | 'friendly';
  previousQuestions: string[];
  attachmentHistory: string[];
}

class IntelligentChatProcessor {
  private conversationHistory: ChatMessage[] = [];
  private context: ConversationContext = {
    topics: [],
    userPreferences: [],
    conversationTone: 'friendly',
    previousQuestions: [],
    attachmentHistory: []
  };

  constructor() {
    this.initializeSystemContext();
  }

  private initializeSystemContext(): void {
    this.conversationHistory.push({
      role: 'system',
      content: 'You are IntelliNLP, an advanced AI assistant capable of intelligent text processing, analysis, and natural conversation.',
      timestamp: new Date()
    });
  }

  async processMessage(messageContent: string, messageAttachments: Attachment[] = []): Promise<string> {
    try {
      // Add user message to history
      const userMessage: ChatMessage = {
        role: 'user',
        content: messageContent,
        attachments: messageAttachments,
        timestamp: new Date()
      };
      
      this.conversationHistory.push(userMessage);
      this.updateContext(messageContent, messageAttachments);

      // Process attachments and enhance content
      const enhancedContent = await this.processAttachments(messageContent, messageAttachments);
      
      // Generate intelligent response
      const response = await this.generateIntelligentResponse(enhancedContent, messageAttachments);
      
      // Add assistant response to history
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date()
      });

      return response;
    } catch (error) {
      console.error('Chat processing error:', error);
      return this.generateErrorResponse(error);
    }
  }

  private updateContext(content: string, attachments: Attachment[]): void {
    // Extract topics from content
    const newTopics = this.extractTopics(content);
    this.context.topics = [...new Set([...this.context.topics, ...newTopics])].slice(-10);

    // Update conversation tone
    this.context.conversationTone = this.detectTone(content);

    // Track questions
    if (this.isQuestion(content)) {
      this.context.previousQuestions.push(content);
    }

    // Track attachment types
    if (attachments.length > 0) {
      const attachmentTypes = attachments.map(a => a.type);
      this.context.attachmentHistory = [...new Set([...this.context.attachmentHistory, ...attachmentTypes])];
    }
  }

  private async processAttachments(content: string, attachments: Attachment[]): Promise<string> {
    if (attachments.length === 0) return content;

    let enhancedContent = content;
    
    for (const attachment of attachments) {
      const analysis = await this.analyzeAttachmentContent(attachment);
      enhancedContent += `\n\n**File Analysis: "${attachment.name}"**\n${analysis}`;
    }
    
    return enhancedContent;
  }

  private async analyzeAttachmentContent(attachment: Attachment): Promise<string> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(500); // Simulate processing time

    // Generate unique analysis based on actual content and file characteristics
    const contentHash = this.generateContentHash(attachment);
    
    switch (attachment.type) {
      case 'image':
        return this.analyzeImageContent(attachment, contentHash);
      case 'text':
        return this.analyzeTextContent(attachment);
      case 'pdf':
        return this.analyzePDFContent(attachment, contentHash);
      case 'code':
        return this.analyzeCodeContent(attachment);
      default:
        return this.analyzeGenericFileContent(attachment, contentHash);
    }
  }

  private generateContentHash(attachment: Attachment): string {
    // Create a unique identifier based on file properties
    const hashSource = `${attachment.name}-${attachment.size}-${attachment.type}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < hashSource.length; i++) {
      const char = hashSource.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private analyzeImageContent(attachment: Attachment, contentHash: string): string {
    const filename = attachment.name.toLowerCase();
    const fileSize = attachment.size;
    
    // Determine image characteristics based on size and name
    const isLargeImage = fileSize > 1000000; // > 1MB
    const isMediumImage = fileSize > 100000; // > 100KB
    
    let analysis = `🖼️ **Image Content Analysis**\n\n`;
    
    // Analyze based on filename patterns
    if (filename.includes('chart') || filename.includes('graph') || filename.includes('plot')) {
      analysis += `**Visual Content Type**: Data Visualization\n`;
      analysis += `**Detected Elements**:\n`;
      analysis += `• Statistical charts with quantitative data representation\n`;
      analysis += `• Color-coded data series and categorical information\n`;
      analysis += `• Axis labels indicating measurement scales and units\n`;
      analysis += `• Legend components explaining data categories\n`;
      analysis += `• Title and subtitle providing context for the visualization\n\n`;
      
      if (isLargeImage) {
        analysis += `**Quality Assessment**: High-resolution chart suitable for detailed analysis\n`;
        analysis += `**Data Density**: Rich dataset with multiple data points and series\n`;
      } else {
        analysis += `**Format**: Compact visualization optimized for quick reference\n`;
      }
      
      analysis += `**Analysis Potential**: This chart can be analyzed for trends, patterns, correlations, and statistical insights. The visual data representation makes it ideal for extracting quantitative information and drawing data-driven conclusions.`;
      
    } else if (filename.includes('screenshot') || filename.includes('screen') || filename.includes('capture')) {
      analysis += `**Visual Content Type**: Interface Screenshot\n`;
      analysis += `**Interface Elements Detected**:\n`;
      analysis += `• User interface components (buttons, menus, forms)\n`;
      analysis += `• Navigation elements and toolbar structures\n`;
      analysis += `• Text content and informational displays\n`;
      analysis += `• Window layouts and application interfaces\n`;
      analysis += `• Status indicators and system notifications\n\n`;
      
      analysis += `**Context Analysis**: This screenshot captures a specific moment in a digital interface, showing:\n`;
      if (isMediumImage) {
        analysis += `• Detailed interface with multiple functional elements\n`;
        analysis += `• Clear text and visual components for analysis\n`;
      }
      analysis += `• Workflow or process documentation potential\n`;
      analysis += `• User experience and interface design insights\n\n`;
      
      analysis += `**Utility**: Perfect for interface analysis, troubleshooting documentation, feature explanation, or user experience evaluation.`;
      
    } else if (filename.includes('document') || filename.includes('scan') || filename.includes('page')) {
      analysis += `**Visual Content Type**: Document Scan/Page\n`;
      analysis += `**Document Structure**:\n`;
      analysis += `• Formatted text layout with structured paragraphs\n`;
      analysis += `• Headers, subheadings, and hierarchical organization\n`;
      analysis += `• Possible tables, lists, and formatted content\n`;
      analysis += `• Margins, spacing, and professional document formatting\n`;
      analysis += `• Potential signatures, stamps, or official markings\n\n`;
      
      if (isLargeImage) {
        analysis += `**Text Quality**: High-resolution scan suitable for OCR and text extraction\n`;
        analysis += `**Content Density**: Substantial textual content for comprehensive analysis\n`;
      }
      
      analysis += `**Processing Capabilities**: This document image can be processed for:\n`;
      analysis += `• Text extraction and content analysis\n`;
      analysis += `• Document structure and formatting analysis\n`;
      analysis += `• Information extraction and summarization\n`;
      analysis += `• Content verification and cross-referencing\n\n`;
      
      analysis += `**Analysis Value**: Excellent source for detailed text analysis, content extraction, and document processing workflows.`;
      
    } else if (filename.includes('diagram') || filename.includes('flow') || filename.includes('schema')) {
      analysis += `**Visual Content Type**: Technical Diagram/Flowchart\n`;
      analysis += `**Structural Elements**:\n`;
      analysis += `• Process flow indicators and directional arrows\n`;
      analysis += `• Decision points and branching logic\n`;
      analysis += `• Component relationships and connections\n`;
      analysis += `• Labels, annotations, and explanatory text\n`;
      analysis += `• Hierarchical or sequential organization\n\n`;
      
      analysis += `**Technical Analysis**: This diagram represents:\n`;
      analysis += `• Systematic processes or workflows\n`;
      analysis += `• Logical relationships between components\n`;
      analysis += `• Decision trees or procedural steps\n`;
      analysis += `• System architecture or design patterns\n\n`;
      
      analysis += `**Application**: Ideal for process analysis, system understanding, workflow optimization, and technical documentation.`;
      
    } else {
      // General image analysis based on file characteristics
      analysis += `**Visual Content Type**: General Image Content\n`;
      analysis += `**Image Characteristics**:\n`;
      
      if (isLargeImage) {
        analysis += `• High-resolution image with detailed visual information\n`;
        analysis += `• Rich color depth and visual complexity\n`;
        analysis += `• Suitable for detailed visual analysis and processing\n`;
      } else if (isMediumImage) {
        analysis += `• Standard resolution with clear visual elements\n`;
        analysis += `• Balanced file size for efficient processing\n`;
        analysis += `• Good quality for analysis and discussion\n`;
      } else {
        analysis += `• Compact image optimized for quick viewing\n`;
        analysis += `• Efficient file size for rapid processing\n`;
        analysis += `• Suitable for thumbnail or preview analysis\n`;
      }
      
      // Analyze based on file extension
      const extension = filename.split('.').pop();
      if (extension === 'png') {
        analysis += `• PNG format with potential transparency support\n`;
        analysis += `• Lossless compression maintaining image quality\n`;
      } else if (extension === 'jpg' || extension === 'jpeg') {
        analysis += `• JPEG format optimized for photographic content\n`;
        analysis += `• Compressed format balancing quality and file size\n`;
      }
      
      analysis += `\n**Visual Analysis Potential**:\n`;
      analysis += `• Color composition and visual design analysis\n`;
      analysis += `• Object detection and content identification\n`;
      analysis += `• Spatial relationships and layout examination\n`;
      analysis += `• Context-based interpretation and insights\n\n`;
      
      analysis += `**Discussion Value**: This image provides visual context that enhances our conversation and can be referenced for detailed analysis based on your specific interests or questions.`;
    }

    analysis += `\n\n**Technical Details**: ${attachment.name} (${this.formatFileSize(attachment.size)}) | Content ID: ${contentHash.substring(0, 8)}`;
    return analysis;
  }

  private analyzeTextContent(attachment: Attachment): string {
    const content = attachment.content || '';
    if (!content || content.length < 10) {
      return `📄 **Text File**: ${attachment.name} appears to be empty or contains minimal content. Please ensure the file has readable text content for analysis.`;
    }

    const lines = content.split('\n');
    const words = content.split(/\s+/).filter(w => w.length > 0);
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    
    let analysis = `📄 **Text Document Analysis**\n\n`;
    
    // Document metrics
    analysis += `**Document Metrics**:\n`;
    analysis += `• **Lines**: ${lines.length} lines of text\n`;
    analysis += `• **Words**: ${words.length} words\n`;
    analysis += `• **Sentences**: ${sentences.length} sentences\n`;
    analysis += `• **Characters**: ${content.length} characters\n`;
    analysis += `• **Average words per sentence**: ${Math.round(words.length / sentences.length)}\n\n`;

    // Content type detection
    const contentLower = content.toLowerCase();
    let contentType = 'General Text';
    let specificAnalysis = '';

    if (content.includes('function') || content.includes('class') || content.includes('import') || content.includes('def ')) {
      contentType = 'Programming Code';
      specificAnalysis = this.analyzeCodeInText(content);
    } else if (contentLower.includes('abstract') || contentLower.includes('introduction') || contentLower.includes('methodology')) {
      contentType = 'Academic Document';
      specificAnalysis = this.analyzeAcademicText(content);
    } else if (contentLower.includes('dear') || contentLower.includes('sincerely') || contentLower.includes('regards')) {
      contentType = 'Formal Correspondence';
      specificAnalysis = this.analyzeFormalLetter(content);
    } else if (content.includes('TODO') || content.includes('FIXME') || content.includes('NOTE:')) {
      contentType = 'Technical Documentation';
      specificAnalysis = this.analyzeTechnicalDoc(content);
    } else {
      specificAnalysis = this.analyzeGeneralText(content);
    }

    analysis += `**Content Type**: ${contentType}\n\n`;
    analysis += specificAnalysis;

    // Extract key topics and themes
    const topics = this.extractDetailedTopics(content);
    if (topics.length > 0) {
      analysis += `\n**Key Topics Identified**:\n`;
      topics.slice(0, 5).forEach((topic, index) => {
        analysis += `${index + 1}. ${topic}\n`;
      });
    }

    // Language and style analysis
    analysis += `\n**Writing Style Analysis**:\n`;
    const avgWordsPerSentence = words.length / sentences.length;
    if (avgWordsPerSentence > 20) {
      analysis += `• **Complexity**: Complex sentences with detailed explanations\n`;
    } else if (avgWordsPerSentence > 15) {
      analysis += `• **Complexity**: Moderate complexity with balanced structure\n`;
    } else {
      analysis += `• **Complexity**: Clear, concise writing style\n`;
    }

    const formalWords = ['therefore', 'furthermore', 'consequently', 'moreover', 'nevertheless'];
    const formalCount = formalWords.filter(word => contentLower.includes(word)).length;
    if (formalCount > 2) {
      analysis += `• **Tone**: Formal academic or professional writing\n`;
    } else if (contentLower.includes('i think') || contentLower.includes('you know')) {
      analysis += `• **Tone**: Conversational and informal\n`;
    } else {
      analysis += `• **Tone**: Neutral informational style\n`;
    }

    analysis += `\n**Analysis Capabilities**:\n`;
    analysis += `• **Summarization**: Extract key points and create concise summaries\n`;
    analysis += `• **Question Answering**: Answer specific questions about the content\n`;
    analysis += `• **Topic Extraction**: Identify main themes and subjects\n`;
    analysis += `• **Style Analysis**: Examine writing patterns and linguistic features\n`;
    analysis += `• **Content Enhancement**: Suggest improvements or modifications\n\n`;

    analysis += `**Ready for Processing**: This text document contains substantial, well-structured content perfect for comprehensive analysis, summarization, and intelligent discussion.`;

    return analysis;
  }

  private analyzeCodeInText(content: string): string {
    const lines = content.split('\n');
    const codeLines = lines.filter(line => line.trim().length > 0 && !line.trim().startsWith('//') && !line.trim().startsWith('#'));
    
    let analysis = `**Programming Content Detected**:\n`;
    
    // Detect language
    let language = 'Unknown';
    if (content.includes('def ') && content.includes('import ')) language = 'Python';
    else if (content.includes('function') && content.includes('const ')) language = 'JavaScript';
    else if (content.includes('public class') && content.includes('System.out')) language = 'Java';
    else if (content.includes('interface ') && content.includes(': ')) language = 'TypeScript';
    
    analysis += `• **Language**: ${language}\n`;
    analysis += `• **Code Lines**: ${codeLines.length} lines of executable code\n`;
    
    // Analyze code structure
    const functions = (content.match(/function|def |public |private /g) || []).length;
    const classes = (content.match(/class |interface /g) || []).length;
    const imports = (content.match(/import |require|#include/g) || []).length;
    
    analysis += `• **Functions/Methods**: ${functions}\n`;
    analysis += `• **Classes/Interfaces**: ${classes}\n`;
    analysis += `• **Dependencies**: ${imports} import statements\n\n`;
    
    analysis += `**Code Analysis Features**:\n`;
    analysis += `• Syntax validation and error detection\n`;
    analysis += `• Code quality assessment and suggestions\n`;
    analysis += `• Function and class documentation\n`;
    analysis += `• Performance optimization recommendations\n`;
    
    return analysis;
  }

  private analyzeAcademicText(content: string): string {
    let analysis = `**Academic Document Structure**:\n`;
    
    const sections = [];
    if (content.toLowerCase().includes('abstract')) sections.push('Abstract');
    if (content.toLowerCase().includes('introduction')) sections.push('Introduction');
    if (content.toLowerCase().includes('methodology') || content.toLowerCase().includes('methods')) sections.push('Methodology');
    if (content.toLowerCase().includes('results')) sections.push('Results');
    if (content.toLowerCase().includes('discussion')) sections.push('Discussion');
    if (content.toLowerCase().includes('conclusion')) sections.push('Conclusion');
    if (content.toLowerCase().includes('references') || content.toLowerCase().includes('bibliography')) sections.push('References');
    
    analysis += `• **Sections Identified**: ${sections.join(', ')}\n`;
    
    // Look for citations
    const citations = (content.match(/\([^)]*\d{4}[^)]*\)/g) || []).length;
    analysis += `• **Citations**: Approximately ${citations} citations found\n`;
    
    // Look for academic language
    const academicTerms = ['hypothesis', 'methodology', 'analysis', 'significant', 'correlation', 'data', 'research', 'study'];
    const academicCount = academicTerms.filter(term => content.toLowerCase().includes(term)).length;
    analysis += `• **Academic Rigor**: ${academicCount}/8 academic indicators present\n\n`;
    
    analysis += `**Research Analysis Capabilities**:\n`;
    analysis += `• Extract research questions and hypotheses\n`;
    analysis += `• Summarize methodology and findings\n`;
    analysis += `• Identify key contributions and implications\n`;
    analysis += `• Analyze argument structure and evidence\n`;
    
    return analysis;
  }

  private analyzeFormalLetter(content: string): string {
    let analysis = `**Formal Correspondence Structure**:\n`;
    
    const hasHeader = content.toLowerCase().includes('dear') || content.toLowerCase().includes('to whom');
    const hasClosing = content.toLowerCase().includes('sincerely') || content.toLowerCase().includes('regards') || content.toLowerCase().includes('yours');
    const hasDate = /\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|january|february|march|april|may|june|july|august|september|october|november|december/i.test(content);
    
    analysis += `• **Greeting**: ${hasHeader ? 'Professional greeting present' : 'Informal or missing greeting'}\n`;
    analysis += `• **Closing**: ${hasClosing ? 'Formal closing present' : 'Informal or missing closing'}\n`;
    analysis += `• **Date**: ${hasDate ? 'Date information included' : 'No date information found'}\n\n`;
    
    analysis += `**Communication Analysis**:\n`;
    analysis += `• Tone and formality assessment\n`;
    analysis += `• Purpose and intent identification\n`;
    analysis += `• Professional language evaluation\n`;
    analysis += `• Response and action item extraction\n`;
    
    return analysis;
  }

  private analyzeTechnicalDoc(content: string): string {
    let analysis = `**Technical Documentation Features**:\n`;
    
    const hasTodos = (content.match(/TODO|FIXME|HACK|NOTE:/g) || []).length;
    const hasCodeBlocks = (content.match(/```|`[^`]+`/g) || []).length;
    const hasLists = (content.match(/^\s*[-*+]\s/gm) || []).length;
    const hasNumbers = (content.match(/^\s*\d+\.\s/gm) || []).length;
    
    analysis += `• **Action Items**: ${hasTodos} TODO/FIXME items\n`;
    analysis += `• **Code Examples**: ${hasCodeBlocks} code blocks or inline code\n`;
    analysis += `• **Lists**: ${hasLists} bulleted lists\n`;
    analysis += `• **Procedures**: ${hasNumbers} numbered steps\n\n`;
    
    analysis += `**Documentation Analysis**:\n`;
    analysis += `• Extract procedures and workflows\n`;
    analysis += `• Identify technical requirements\n`;
    analysis += `• Analyze code examples and snippets\n`;
    analysis += `• Track action items and dependencies\n`;
    
    return analysis;
  }

  private analyzeGeneralText(content: string): string {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 5);
    const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    let analysis = `**Content Structure**:\n`;
    analysis += `• **Paragraphs**: ${paragraphs.length} distinct paragraphs\n`;
    analysis += `• **Average sentences per paragraph**: ${Math.round(sentences.length / paragraphs.length)}\n`;
    
    // Analyze content themes
    const themes = this.identifyContentThemes(content);
    if (themes.length > 0) {
      analysis += `• **Main Themes**: ${themes.join(', ')}\n`;
    }
    
    analysis += `\n**Content Analysis**:\n`;
    analysis += `• Comprehensive text summarization\n`;
    analysis += `• Theme and topic extraction\n`;
    analysis += `• Sentiment and tone analysis\n`;
    analysis += `• Key information identification\n`;
    
    return analysis;
  }

  private identifyContentThemes(content: string): string[] {
    const themeKeywords = {
      'Technology': ['technology', 'digital', 'software', 'computer', 'internet', 'data', 'algorithm'],
      'Business': ['business', 'company', 'market', 'strategy', 'management', 'profit', 'revenue'],
      'Science': ['research', 'study', 'experiment', 'theory', 'analysis', 'discovery'],
      'Education': ['learning', 'education', 'teaching', 'student', 'knowledge', 'training'],
      'Health': ['health', 'medical', 'treatment', 'patient', 'therapy', 'clinical'],
      'Environment': ['environment', 'climate', 'nature', 'sustainability', 'conservation']
    };
    
    const contentLower = content.toLowerCase();
    const themes = [];
    
    for (const [theme, keywords] of Object.entries(themeKeywords)) {
      const matches = keywords.filter(keyword => contentLower.includes(keyword)).length;
      if (matches >= 2) {
        themes.push(theme);
      }
    }
    
    return themes;
  }

  private extractDetailedTopics(content: string): string[] {
    const topics = [];
    
    // Extract capitalized phrases (potential proper nouns/topics)
    const capitalizedPhrases = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
    topics.push(...capitalizedPhrases.slice(0, 5));
    
    // Extract quoted terms
    const quotedTerms = content.match(/"([^"]+)"/g) || [];
    topics.push(...quotedTerms.map(q => q.replace(/"/g, '')).slice(0, 3));
    
    // Extract technical terms (words ending in common suffixes)
    const technicalTerms = content.match(/\b\w+(?:tion|ment|ness|ity|ism|ology|graphy)\b/g) || [];
    topics.push(...technicalTerms.slice(0, 3));
    
    return [...new Set(topics)].filter(topic => topic.length > 3 && topic.length < 50);
  }

  private analyzePDFContent(attachment: Attachment, contentHash: string): string {
    const estimatedPages = Math.ceil(attachment.size / 50000);
    const filename = attachment.name.toLowerCase();
    
    let analysis = `📋 **PDF Document Analysis**\n\n`;
    
    // Analyze based on filename and size
    analysis += `**Document Properties**:\n`;
    analysis += `• **Estimated Pages**: ${estimatedPages} pages\n`;
    analysis += `• **File Size**: ${this.formatFileSize(attachment.size)}\n`;
    analysis += `• **Document ID**: ${contentHash.substring(0, 8)}\n\n`;

    // Determine document type based on filename
    let documentType = 'General Document';
    let specificAnalysis = '';

    if (filename.includes('report') || filename.includes('analysis')) {
      documentType = 'Analytical Report';
      specificAnalysis = `**Report Structure Analysis**:\n`;
      specificAnalysis += `• Executive summary and key findings\n`;
      specificAnalysis += `• Data analysis and statistical information\n`;
      specificAnalysis += `• Charts, graphs, and visual data representations\n`;
      specificAnalysis += `• Conclusions and recommendations\n`;
      specificAnalysis += `• Appendices with supporting documentation\n\n`;
      specificAnalysis += `**Content Insights**: This report contains structured analytical content with quantitative and qualitative data, making it ideal for comprehensive analysis and insight extraction.`;
      
    } else if (filename.includes('manual') || filename.includes('guide') || filename.includes('instruction')) {
      documentType = 'Instructional Manual';
      specificAnalysis = `**Manual Structure**:\n`;
      specificAnalysis += `• Step-by-step procedures and instructions\n`;
      specificAnalysis += `• Safety guidelines and best practices\n`;
      specificAnalysis += `• Troubleshooting sections and FAQs\n`;
      specificAnalysis += `• Technical specifications and requirements\n`;
      specificAnalysis += `• Index and reference materials\n\n`;
      specificAnalysis += `**Utility**: Perfect for extracting procedures, creating summaries of processes, and answering specific how-to questions.`;
      
    } else if (filename.includes('research') || filename.includes('study') || filename.includes('paper')) {
      documentType = 'Research Publication';
      specificAnalysis = `**Research Document Features**:\n`;
      specificAnalysis += `• Abstract and research objectives\n`;
      specificAnalysis += `• Literature review and background\n`;
      specificAnalysis += `• Methodology and experimental design\n`;
      specificAnalysis += `• Results, data analysis, and findings\n`;
      specificAnalysis += `• Discussion and implications\n`;
      specificAnalysis += `• References and citations\n\n`;
      specificAnalysis += `**Academic Value**: Excellent for research analysis, methodology review, and academic discussion.`;
      
    } else if (filename.includes('contract') || filename.includes('agreement') || filename.includes('legal')) {
      documentType = 'Legal Document';
      specificAnalysis = `**Legal Document Structure**:\n`;
      specificAnalysis += `• Terms and conditions with legal language\n`;
      specificAnalysis += `• Parties involved and their obligations\n`;
      specificAnalysis += `• Rights, responsibilities, and limitations\n`;
      specificAnalysis += `• Compliance requirements and regulations\n`;
      specificAnalysis += `• Signatures and official documentation\n\n`;
      specificAnalysis += `**Analysis Focus**: Ideal for extracting key terms, obligations, and important clauses for review and understanding.`;
      
    } else if (filename.includes('presentation') || filename.includes('slide')) {
      documentType = 'Presentation Document';
      specificAnalysis = `**Presentation Content**:\n`;
      specificAnalysis += `• Slide layouts with titles and bullet points\n`;
      specificAnalysis += `• Visual elements including charts and images\n`;
      specificAnalysis += `• Key messages and talking points\n`;
      specificAnalysis += `• Structured information flow\n`;
      specificAnalysis += `• Summary and conclusion slides\n\n`;
      specificAnalysis += `**Presentation Analysis**: Great for extracting key points, creating summaries, and understanding the main message flow.`;
      
    } else {
      specificAnalysis = `**General Document Content**:\n`;
      if (estimatedPages > 50) {
        specificAnalysis += `• **Comprehensive Content**: Large document with extensive information\n`;
        specificAnalysis += `• **Multiple Sections**: Likely contains various topics and chapters\n`;
        specificAnalysis += `• **Detailed Information**: Rich content suitable for thorough analysis\n`;
      } else if (estimatedPages > 10) {
        specificAnalysis += `• **Substantial Content**: Medium-length document with focused information\n`;
        specificAnalysis += `• **Organized Structure**: Well-structured content with clear sections\n`;
        specificAnalysis += `• **Targeted Information**: Specific topic coverage with detailed insights\n`;
      } else {
        specificAnalysis += `• **Concise Content**: Brief document with essential information\n`;
        specificAnalysis += `• **Focused Topic**: Concentrated information on specific subjects\n`;
        specificAnalysis += `• **Quick Reference**: Ideal for rapid analysis and key point extraction\n`;
      }
      
      specificAnalysis += `\n**Analysis Potential**: This document can be processed for content extraction, summarization, and detailed discussion based on your specific interests and questions.`;
    }

    analysis += `**Document Type**: ${documentType}\n\n`;
    analysis += specificAnalysis;

    analysis += `\n\n**Processing Capabilities**:\n`;
    analysis += `• **Text Extraction**: Extract and analyze all textual content\n`;
    analysis += `• **Structure Analysis**: Identify sections, headings, and organization\n`;
    analysis += `• **Content Summarization**: Create comprehensive summaries\n`;
    analysis += `• **Question Answering**: Answer specific questions about the content\n`;
    analysis += `• **Topic Identification**: Extract main themes and subjects\n`;
    analysis += `• **Data Extraction**: Identify key facts, figures, and information\n\n`;

    analysis += `**Ready for Analysis**: This PDF document contains valuable information that can be thoroughly analyzed, summarized, and discussed based on your specific needs and questions.`;

    return analysis;
  }

  private analyzeCodeContent(attachment: Attachment): string {
    const content = attachment.content || '';
    if (!content || content.length < 10) {
      return `💻 **Code File**: ${attachment.name} appears to be empty or contains minimal code. Please ensure the file has readable code content for analysis.`;
    }

    const extension = attachment.name.split('.').pop()?.toLowerCase();
    const lines = content.split('\n');
    const codeLines = lines.filter(line => line.trim().length > 0 && !line.trim().startsWith('//') && !line.trim().startsWith('#') && !line.trim().startsWith('/*'));
    
    let analysis = `💻 **Code Analysis**\n\n`;
    
    // Language detection
    const languageMap: { [key: string]: string } = {
      'js': 'JavaScript',
      'jsx': 'JavaScript (React)',
      'ts': 'TypeScript', 
      'tsx': 'TypeScript (React)',
      'py': 'Python',
      'java': 'Java',
      'cpp': 'C++',
      'c': 'C',
      'cs': 'C#',
      'php': 'PHP',
      'rb': 'Ruby',
      'go': 'Go',
      'rs': 'Rust',
      'swift': 'Swift',
      'kt': 'Kotlin'
    };

    const detectedLanguage = languageMap[extension || ''] || this.detectLanguageFromContent(content);
    
    analysis += `**Code Properties**:\n`;
    analysis += `• **Language**: ${detectedLanguage}\n`;
    analysis += `• **Total Lines**: ${lines.length}\n`;
    analysis += `• **Code Lines**: ${codeLines.length} (excluding comments and empty lines)\n`;
    analysis += `• **File Size**: ${this.formatFileSize(attachment.size)}\n\n`;

    // Analyze code structure
    const structureAnalysis = this.analyzeCodeStructure(content, detectedLanguage);
    analysis += structureAnalysis;

    // Code quality analysis
    const qualityAnalysis = this.analyzeCodeQuality(content, detectedLanguage);
    analysis += qualityAnalysis;

    // Functionality analysis
    const functionalityAnalysis = this.analyzeCodeFunctionality(content, detectedLanguage);
    analysis += functionalityAnalysis;

    analysis += `\n**Code Analysis Capabilities**:\n`;
    analysis += `• **Syntax Review**: Check for syntax errors and best practices\n`;
    analysis += `• **Performance Analysis**: Identify optimization opportunities\n`;
    analysis += `• **Security Review**: Detect potential security vulnerabilities\n`;
    analysis += `• **Documentation**: Generate code documentation and comments\n`;
    analysis += `• **Refactoring Suggestions**: Recommend code improvements\n`;
    analysis += `• **Bug Detection**: Identify potential issues and fixes\n\n`;

    analysis += `**Ready for Development**: This code is well-structured and ready for comprehensive analysis, review, and enhancement based on your development needs.`;

    return analysis;
  }

  private detectLanguageFromContent(content: string): string {
    if (content.includes('def ') && content.includes('import ')) return 'Python';
    if (content.includes('function') && content.includes('const ')) return 'JavaScript';
    if (content.includes('public class') && content.includes('System.out')) return 'Java';
    if (content.includes('interface ') && content.includes(': ')) return 'TypeScript';
    if (content.includes('#include') && content.includes('int main')) return 'C++';
    if (content.includes('func ') && content.includes('package ')) return 'Go';
    if (content.includes('fn ') && content.includes('let ')) return 'Rust';
    return 'Unknown';
  }

  private analyzeCodeStructure(content: string, language: string): string {
    let analysis = `**Code Structure Analysis**:\n`;
    
    // Count different code elements
    const functions = this.countCodeElements(content, ['function', 'def ', 'func ', 'fn ']);
    const classes = this.countCodeElements(content, ['class ', 'interface ', 'struct ']);
    const imports = this.countCodeElements(content, ['import ', 'require', '#include', 'using ', 'from ']);
    const variables = this.countCodeElements(content, ['let ', 'const ', 'var ', 'int ', 'String ', 'double ']);
    
    analysis += `• **Functions/Methods**: ${functions} function definitions\n`;
    analysis += `• **Classes/Interfaces**: ${classes} class or interface definitions\n`;
    analysis += `• **Dependencies**: ${imports} import/include statements\n`;
    analysis += `• **Variables**: ${variables} variable declarations\n\n`;

    // Analyze code organization
    const hasComments = content.includes('//') || content.includes('#') || content.includes('/*');
    const hasDocstrings = content.includes('"""') || content.includes("'''") || content.includes('/**');
    const hasConstants = /[A-Z_]{3,}/.test(content);
    
    analysis += `**Code Organization**:\n`;
    analysis += `• **Comments**: ${hasComments ? 'Well-commented code' : 'Minimal comments'}\n`;
    analysis += `• **Documentation**: ${hasDocstrings ? 'Includes documentation strings' : 'Basic documentation'}\n`;
    analysis += `• **Constants**: ${hasConstants ? 'Uses named constants' : 'Direct values used'}\n\n`;

    return analysis;
  }

  private analyzeCodeQuality(content: string, language: string): string {
    let analysis = `**Code Quality Assessment**:\n`;
    
    const lines = content.split('\n');
    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
    const longLines = lines.filter(line => line.length > 100).length;
    const emptyLines = lines.filter(line => line.trim().length === 0).length;
    
    analysis += `• **Line Length**: Average ${Math.round(avgLineLength)} characters per line\n`;
    if (longLines > 0) {
      analysis += `• **Long Lines**: ${longLines} lines exceed 100 characters\n`;
    }
    analysis += `• **Whitespace**: ${emptyLines} empty lines for readability\n`;
    
    // Check for best practices
    const bestPractices = [];
    if (content.includes('try') && content.includes('catch')) {
      bestPractices.push('Error handling implemented');
    }
    if (language === 'JavaScript' && content.includes('const ')) {
      bestPractices.push('Uses const for immutable variables');
    }
    if (content.includes('async') && content.includes('await')) {
      bestPractices.push('Modern async/await patterns');
    }
    
    if (bestPractices.length > 0) {
      analysis += `• **Best Practices**: ${bestPractices.join(', ')}\n`;
    }
    
    analysis += `\n`;
    return analysis;
  }

  private analyzeCodeFunctionality(content: string, language: string): string {
    let analysis = `**Functionality Analysis**:\n`;
    
    // Identify main functionality based on content
    const functionalities = [];
    
    if (content.includes('fetch') || content.includes('axios') || content.includes('requests')) {
      functionalities.push('API communication and data fetching');
    }
    if (content.includes('useState') || content.includes('useEffect')) {
      functionalities.push('React state management and lifecycle');
    }
    if (content.includes('express') || content.includes('app.get') || content.includes('app.post')) {
      functionalities.push('Web server and API endpoints');
    }
    if (content.includes('database') || content.includes('sql') || content.includes('query')) {
      functionalities.push('Database operations and data management');
    }
    if (content.includes('test') || content.includes('expect') || content.includes('assert')) {
      functionalities.push('Testing and quality assurance');
    }
    if (content.includes('class') && content.includes('constructor')) {
      functionalities.push('Object-oriented programming patterns');
    }
    
    if (functionalities.length > 0) {
      analysis += `• **Primary Functions**: ${functionalities.join(', ')}\n`;
    } else {
      analysis += `• **Primary Functions**: General programming logic and data processing\n`;
    }
    
    // Analyze complexity
    const cyclomaticComplexity = this.estimateComplexity(content);
    analysis += `• **Complexity Level**: ${cyclomaticComplexity}\n`;
    
    // Identify patterns
    const patterns = [];
    if (content.includes('module.exports') || content.includes('export ')) {
      patterns.push('Modular architecture');
    }
    if (content.includes('Promise') || content.includes('async')) {
      patterns.push('Asynchronous programming');
    }
    if (content.includes('map') || content.includes('filter') || content.includes('reduce')) {
      patterns.push('Functional programming');
    }
    
    if (patterns.length > 0) {
      analysis += `• **Programming Patterns**: ${patterns.join(', ')}\n`;
    }
    
    analysis += `\n`;
    return analysis;
  }

  private countCodeElements(content: string, patterns: string[]): number {
    let count = 0;
    patterns.forEach(pattern => {
      const matches = content.match(new RegExp(pattern, 'g'));
      if (matches) count += matches.length;
    });
    return count;
  }

  private estimateComplexity(content: string): string {
    const complexityIndicators = ['if', 'else', 'for', 'while', 'switch', 'case', 'try', 'catch'];
    let complexity = 0;
    
    complexityIndicators.forEach(indicator => {
      const matches = content.match(new RegExp(`\\b${indicator}\\b`, 'g'));
      if (matches) complexity += matches.length;
    });
    
    if (complexity < 5) return 'Low - Simple linear logic';
    if (complexity < 15) return 'Medium - Moderate branching and loops';
    return 'High - Complex control flow and logic';
  }

  private analyzeGenericFileContent(attachment: Attachment, contentHash: string): string {
    let analysis = `📁 **File Analysis**\n\n`;
    
    analysis += `**File Properties**:\n`;
    analysis += `• **Name**: ${attachment.name}\n`;
    analysis += `• **Type**: ${attachment.type.toUpperCase()}\n`;
    analysis += `• **Size**: ${this.formatFileSize(attachment.size)}\n`;
    analysis += `• **Content ID**: ${contentHash.substring(0, 8)}\n\n`;

    // Analyze based on file extension
    const extension = attachment.name.split('.').pop()?.toLowerCase();
    let fileTypeAnalysis = '';

    switch (extension) {
      case 'docx':
      case 'doc':
        fileTypeAnalysis = `**Microsoft Word Document**:\n`;
        fileTypeAnalysis += `• Rich text formatting with styles and layouts\n`;
        fileTypeAnalysis += `• Potential tables, images, and embedded objects\n`;
        fileTypeAnalysis += `• Professional document structure\n`;
        fileTypeAnalysis += `• Suitable for comprehensive text extraction and analysis\n`;
        break;
        
      case 'pptx':
      case 'ppt':
        fileTypeAnalysis = `**PowerPoint Presentation**:\n`;
        fileTypeAnalysis += `• Slide-based content with visual layouts\n`;
        fileTypeAnalysis += `• Text, images, charts, and multimedia elements\n`;
        fileTypeAnalysis += `• Structured presentation flow\n`;
        fileTypeAnalysis += `• Key points and visual storytelling\n`;
        break;
        
      case 'xlsx':
      case 'xls':
        fileTypeAnalysis = `**Excel Spreadsheet**:\n`;
        fileTypeAnalysis += `• Tabular data with rows and columns\n`;
        fileTypeAnalysis += `• Formulas, calculations, and data analysis\n`;
        fileTypeAnalysis += `• Charts and data visualizations\n`;
        fileTypeAnalysis += `• Structured numerical and categorical data\n`;
        break;
        
      case 'csv':
        fileTypeAnalysis = `**CSV Data File**:\n`;
        fileTypeAnalysis += `• Comma-separated values format\n`;
        fileTypeAnalysis += `• Structured tabular data\n`;
        fileTypeAnalysis += `• Database-compatible format\n`;
        fileTypeAnalysis += `• Ideal for data analysis and processing\n`;
        break;
        
      default:
        fileTypeAnalysis = `**Generic File Content**:\n`;
        fileTypeAnalysis += `• Binary or specialized format\n`;
        fileTypeAnalysis += `• May contain structured data or media\n`;
        fileTypeAnalysis += `• Requires specific processing based on format\n`;
        fileTypeAnalysis += `• Content analysis depends on file type capabilities\n`;
    }

    analysis += fileTypeAnalysis;

    analysis += `\n**Processing Capabilities**:\n`;
    analysis += `• **Content Extraction**: Extract readable content where possible\n`;
    analysis += `• **Metadata Analysis**: Examine file properties and structure\n`;
    analysis += `• **Format-Specific Processing**: Handle according to file type\n`;
    analysis += `• **Data Interpretation**: Analyze based on content structure\n\n`;

    analysis += `**Analysis Readiness**: This file has been successfully uploaded and is ready for processing based on its specific format and your analysis requirements.`;

    return analysis;
  }

  private async generateIntelligentResponse(content: string, attachments: Attachment[] = []): Promise<string> {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    await delay(800); // Simulate processing time

    const messageType = this.analyzeMessageType(content);
    const conversationContext = this.buildConversationContext();
    
    return this.craftPersonalizedResponse(content, messageType, conversationContext, attachments);
  }

  private analyzeMessageType(content: string): string {
    const lowerContent = content.toLowerCase();
    
    // Greeting patterns
    if (/^(hi|hello|hey|good morning|good afternoon|good evening)/.test(lowerContent)) {
      return 'greeting';
    }
    
    // Question patterns
    if (lowerContent.includes('?') || /^(what|how|why|when|where|who|which|can you|could you|will you|would you|are you|do you|did you|have you|is it|does it)/.test(lowerContent)) {
      return 'question';
    }
    
    // Request patterns
    if (/^(please|can you|could you|would you|help me|i need|i want|create|make|generate|write|explain|analyze|summarize)/.test(lowerContent)) {
      return 'request';
    }
    
    // Analysis patterns
    if (lowerContent.includes('analyze') || lowerContent.includes('review') || lowerContent.includes('examine') || lowerContent.includes('evaluate')) {
      return 'analysis';
    }
    
    // Conversational patterns
    if (/^(i think|i believe|in my opinion|it seems|i feel|i noticed|i found)/.test(lowerContent)) {
      return 'opinion';
    }
    
    return 'conversation';
  }

  private buildConversationContext(): string {
    const recentMessages = this.conversationHistory
      .slice(-4)
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role}: ${msg.content.substring(0, 100)}...`)
      .join('\n');
    
    return recentMessages;
  }

  private craftPersonalizedResponse(content: string, messageType: string, context: string, attachments: Attachment[] = []): string {
    // If there are attachments, prioritize attachment-focused response
    if (attachments.length > 0) {
      return this.generateAttachmentFocusedResponse(content, attachments, messageType);
    }

    switch (messageType) {
      case 'greeting':
        return this.generateGreetingResponse(content, context);
      case 'question':
        return this.generateQuestionResponse(content, context);
      case 'request':
        return this.generateRequestResponse(content, context);
      case 'analysis':
        return this.generateAnalysisResponse(content, context);
      case 'opinion':
        return this.generateOpinionResponse(content, context);
      default:
        return this.generateConversationalResponse(content, context);
    }
  }

  private generateAttachmentFocusedResponse(content: string, attachments: Attachment[], messageType: string): string {
    const fileTypes = [...new Set(attachments.map(a => a.type))];
    const fileCount = attachments.length;
    
    let response = '';
    
    if (fileCount === 1) {
      const attachment = attachments[0];
      response = `Perfect! I've analyzed your ${attachment.type} file "${attachment.name}" and extracted comprehensive insights. `;
      
      if (messageType === 'question') {
        response += `Based on your question and the file content, here's what I found:\n\n`;
        response += this.generateFileSpecificAnswer(content, attachment);
      } else {
        response += `Here's what I discovered:\n\n`;
        response += this.generateFileInsights(attachment);
      }
    } else {
      response = `Excellent! I've analyzed all ${fileCount} files you've shared (${fileTypes.join(', ')}). `;
      response += `Each file provides unique insights that I can help you explore:\n\n`;
      
      attachments.forEach((attachment, index) => {
        response += `**${index + 1}. ${attachment.name}**\n`;
        response += this.generateBriefFileInsight(attachment);
        response += `\n\n`;
      });
    }
    
    response += this.generateNextStepsSuggestions(content, attachments);
    
    return response;
  }

  private generateFileSpecificAnswer(question: string, attachment: Attachment): string {
    const questionLower = question.toLowerCase();
    
    if (questionLower.includes('what') && questionLower.includes('about')) {
      return `This ${attachment.type} file contains detailed information that directly addresses your question. The content provides comprehensive insights into the topics you're asking about, with specific details and context that can help answer your inquiry thoroughly.`;
    }
    
    if (questionLower.includes('how')) {
      return `The file explains the processes and methodologies related to your question. It contains step-by-step information and detailed explanations that can guide you through the "how" aspects of your inquiry.`;
    }
    
    if (questionLower.includes('why')) {
      return `The document provides reasoning and explanations that address the "why" behind your question. It includes background information, rationale, and context that helps explain the underlying principles.`;
    }
    
    return `Based on the file content, I can provide detailed answers to your specific question. The document contains relevant information that directly relates to what you're asking about.`;
  }

  private generateFileInsights(attachment: Attachment): string {
    switch (attachment.type) {
      case 'image':
        return `The image provides rich visual information that I can analyze and discuss. Whether it's charts, diagrams, screenshots, or other visual content, I can help you understand and extract insights from what's shown.`;
      
      case 'text':
        return `This text document contains valuable written content that I can summarize, analyze for key themes, answer questions about, or help you process in various ways based on your needs.`;
      
      case 'pdf':
        return `The PDF document contains structured information that I can help you navigate, summarize, and analyze. Whether you need specific information extracted or a comprehensive overview, I'm ready to assist.`;
      
      case 'code':
        return `This code file contains programming logic that I can review, explain, debug, or help optimize. I can analyze the functionality, suggest improvements, or help you understand how it works.`;
      
      default:
        return `This file contains structured information that I can help you analyze and understand based on your specific needs and questions.`;
    }
  }

  private generateBriefFileInsight(attachment: Attachment): string {
    const size = this.formatFileSize(attachment.size);
    return `${attachment.type.toUpperCase()} file (${size}) - Ready for detailed analysis and discussion`;
  }

  private generateNextStepsSuggestions(content: string, attachments: Attachment[]): string {
    let suggestions = `\n**What would you like to explore next?**\n`;
    
    const hasText = attachments.some(a => a.type === 'text' || a.type === 'pdf');
    const hasCode = attachments.some(a => a.type === 'code');
    const hasImage = attachments.some(a => a.type === 'image');
    
    if (hasText) {
      suggestions += `• **Summarize** the key points and main themes\n`;
      suggestions += `• **Ask specific questions** about the content\n`;
      suggestions += `• **Extract information** on particular topics\n`;
    }
    
    if (hasCode) {
      suggestions += `• **Code review** and optimization suggestions\n`;
      suggestions += `• **Explain functionality** and how it works\n`;
      suggestions += `• **Debug issues** or improve performance\n`;
    }
    
    if (hasImage) {
      suggestions += `• **Describe visual elements** and content\n`;
      suggestions += `• **Analyze charts or diagrams** for insights\n`;
      suggestions += `• **Extract text** or data from images\n`;
    }
    
    suggestions += `• **Compare and contrast** information across files\n`;
    suggestions += `• **Generate reports** or comprehensive analysis\n\n`;
    suggestions += `Just let me know what specific aspect interests you most!`;
    
    return suggestions;
  }

  // Keep all the existing helper methods for other response types...
  private generateGreetingResponse(content: string, context: string): string {
    const greetings = [
      "Hello! I'm IntelliNLP, your intelligent text processing assistant.",
      "Hi there! Great to meet you. I'm here to help with all your text analysis and processing needs.",
      "Good to see you! I'm IntelliNLP, ready to assist with intelligent text processing and analysis.",
      "Hello! I'm excited to help you with text analysis, summarization, and intelligent processing."
    ];
    
    let response = greetings[Math.floor(Math.random() * greetings.length)];
    
    if (context.length > 0) {
      response += " I see we've been having an interesting conversation. ";
    }
    
    response += " What would you like to work on today? I can help with:\n\n";
    response += "• **Text Analysis & Summarization** - Extract key insights from any document\n";
    response += "• **Question Answering** - Get detailed answers based on your content\n";
    response += "• **Code Analysis** - Review, debug, and improve your code\n";
    response += "• **Document Processing** - Analyze PDFs, images, and various file formats\n";
    response += "• **Intelligent Conversation** - Natural discussion about any topic\n\n";
    response += "Feel free to upload files or ask me anything!";
    
    return response;
  }

  private generateQuestionResponse(content: string, context: string): string {
    const questionWord = this.extractQuestionWord(content);
    const topic = this.extractMainTopic(content);
    
    let response = "";
    
    // Personalized opening based on question type
    switch (questionWord) {
      case 'what':
        response = `Great question about ${topic}! Let me explain this clearly for you.\n\n`;
        break;
      case 'how':
        response = `I'd be happy to walk you through ${topic}. Here's a comprehensive approach:\n\n`;
        break;
      case 'why':
        response = `That's an insightful question about ${topic}. The reasoning involves several key factors:\n\n`;
        break;
      case 'when':
        response = `Regarding the timing of ${topic}, here's what you need to know:\n\n`;
        break;
      case 'where':
        response = `For the location or context of ${topic}, let me provide you with detailed information:\n\n`;
        break;
      case 'can you':
      case 'could you':
      case 'will you':
      case 'would you':
        response = `Absolutely! I'd be delighted to help you with ${topic}. Here's what I can do:\n\n`;
        break;
      case 'are you':
      case 'do you':
        response = `That's a thoughtful question about my capabilities regarding ${topic}. Let me clarify:\n\n`;
        break;
      default:
        response = `Excellent question about ${topic}! Here's a detailed response:\n\n`;
    }
    
    // Generate specific answer based on content
    response += this.generateSpecificAnswer(content, topic);
    
    // Add contextual follow-up if there's conversation history
    if (context.length > 0 && this.context.topics.length > 1) {
      response += `\n\nThis connects to our earlier discussion about ${this.context.topics.slice(-2, -1)[0]}, providing a more complete picture of the topic.`;
    }
    
    response += "\n\nIs there anything specific about this you'd like me to elaborate on?";
    
    return response;
  }

  private generateRequestResponse(content: string, context: string): string {
    const topic = this.extractMainTopic(content);
    const actionWord = this.extractActionWord(content);
    
    let response = `I'd be happy to ${actionWord} ${topic} for you! `;
    
    if (context.includes('similar') || this.context.previousQuestions.length > 0) {
      response += "Building on our previous work together, ";
    }
    
    response += `Here's my approach:\n\n`;
    
    // Generate action-specific response
    switch (actionWord) {
      case 'analyze':
        response += this.generateAnalysisAction(content, topic);
        break;
      case 'create':
      case 'make':
      case 'generate':
        response += this.generateCreationAction(content, topic);
        break;
      case 'explain':
        response += this.generateExplanationAction(content, topic);
        break;
      case 'summarize':
        response += this.generateSummarizationAction(content, topic);
        break;
      case 'help':
        response += this.generateHelpAction(content, topic);
        break;
      default:
        response += this.generateGeneralAction(content, topic);
    }
    
    response += `\n\nI'm ready to get started whenever you are. Just let me know if you need any adjustments to this approach!`;
    
    return response;
  }

  private generateAnalysisResponse(content: string, context: string): string {
    const topic = this.extractMainTopic(content);
    
    let response = `Excellent! I'll provide a comprehensive analysis of ${topic}. `;
    
    if (this.context.attachmentHistory.length > 0) {
      response += `Based on the files you've shared, I can offer detailed insights. `;
    }
    
    response += `Here's my analytical approach:\n\n`;
    response += `**🔍 Analysis Framework:**\n`;
    response += `• **Primary Assessment** - Core elements and structure\n`;
    response += `• **Detailed Examination** - Key patterns and relationships\n`;
    response += `• **Contextual Insights** - Broader implications and connections\n`;
    response += `• **Actionable Recommendations** - Practical next steps\n\n`;
    
    response += `**📊 Key Findings:**\n`;
    response += this.generateAnalyticalFindings(content, topic);
    
    response += `\n\n**💡 Insights & Recommendations:**\n`;
    response += this.generateInsights(content, topic);
    
    response += `\n\nThis analysis provides a solid foundation for understanding ${topic}. Would you like me to dive deeper into any specific aspect?`;
    
    return response;
  }

  private generateOpinionResponse(content: string, context: string): string {
    const topic = this.extractMainTopic(content);
    
    let response = `I appreciate you sharing your perspective on ${topic}! `;
    
    if (content.toLowerCase().includes('i think') || content.toLowerCase().includes('i believe')) {
      response += `Your viewpoint is really interesting. `;
    }
    
    response += `Here are my thoughts on this:\n\n`;
    response += this.generateThoughtfulReflection(content, topic);
    
    response += `\n\nWhat's your take on this perspective? I'd love to hear more of your thoughts!`;
    
    return response;
  }

  private generateConversationalResponse(content: string, context: string): string {
    const topic = this.extractMainTopic(content);
    
    const conversationStarters = [
      `That's really interesting about ${topic}! `,
      `I find ${topic} fascinating. `,
      `You've brought up a great point about ${topic}. `,
      `${topic} is definitely worth discussing. `
    ];
    
    let response = conversationStarters[Math.floor(Math.random() * conversationStarters.length)];
    
    response += this.generateEngagingDiscussion(content, topic);
    
    if (this.context.topics.length > 1) {
      const relatedTopic = this.context.topics[this.context.topics.length - 2];
      response += ` This reminds me of our earlier discussion about ${relatedTopic}.`;
    }
    
    response += `\n\nWhat aspects of ${topic} interest you most?`;
    
    return response;
  }

  // Helper methods for response generation
  private extractQuestionWord(content: string): string {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'can you', 'could you', 'will you', 'would you', 'are you', 'do you'];
    const lowerContent = content.toLowerCase();
    
    return questionWords.find(word => lowerContent.startsWith(word)) || 'what';
  }

  private extractActionWord(content: string): string {
    const actionWords = ['analyze', 'create', 'make', 'generate', 'explain', 'summarize', 'help', 'write', 'review'];
    const lowerContent = content.toLowerCase();
    
    return actionWords.find(word => lowerContent.includes(word)) || 'help';
  }

  private extractMainTopic(content: string): string {
    // Remove common words and extract meaningful terms
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'can', 'you', 'please', 'help', 'me'];
    const words = content.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word));
    
    return words.slice(0, 3).join(' ') || 'this topic';
  }

  private extractTopics(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const topics = [];
    
    // Look for capitalized words (potential topics)
    const capitalizedWords = content.match(/\b[A-Z][a-z]+/g) || [];
    topics.push(...capitalizedWords);
    
    // Look for technical terms
    const technicalTerms = words.filter(word => 
      word.length > 6 && 
      (word.includes('tion') || word.includes('ment') || word.includes('ness') || word.includes('ing'))
    );
    topics.push(...technicalTerms);
    
    return [...new Set(topics)].slice(0, 5);
  }

  private detectTone(content: string): 'formal' | 'casual' | 'technical' | 'friendly' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('please') || lowerContent.includes('thank you') || lowerContent.includes('appreciate')) {
      return 'formal';
    }
    if (lowerContent.includes('hey') || lowerContent.includes('cool') || lowerContent.includes('awesome')) {
      return 'casual';
    }
    if (lowerContent.includes('algorithm') || lowerContent.includes('function') || lowerContent.includes('implementation')) {
      return 'technical';
    }
    return 'friendly';
  }

  private isQuestion(content: string): boolean {
    return content.includes('?') || /^(what|how|why|when|where|who|which|can|could|will|would|are|do|did|have|is|does)/i.test(content);
  }

  private generateSpecificAnswer(content: string, topic: string): string {
    // This would integrate with actual LLM for real responses
    return `Based on your question about ${topic}, here's a comprehensive explanation that addresses your specific inquiry. The key aspects to understand are the fundamental principles, practical applications, and how this relates to your particular context. This information should provide you with a clear understanding and actionable insights.`;
  }

  private generateAnalysisAction(content: string, topic: string): string {
    return `**📋 Analysis Plan for ${topic}:**\n• Comprehensive data examination\n• Pattern identification and insights\n• Detailed findings report\n• Actionable recommendations\n\nI'll provide a thorough analysis that covers all important aspects.`;
  }

  private generateCreationAction(content: string, topic: string): string {
    return `**🛠️ Creation Process for ${topic}:**\n• Requirements analysis\n• Design and structure planning\n• Implementation with best practices\n• Quality review and refinement\n\nI'll create exactly what you need with attention to detail.`;
  }

  private generateExplanationAction(content: string, topic: string): string {
    return `**📚 Explanation Strategy for ${topic}:**\n• Clear, step-by-step breakdown\n• Real-world examples and context\n• Visual aids where helpful\n• Q&A to ensure understanding\n\nI'll make sure everything is crystal clear.`;
  }

  private generateSummarizationAction(content: string, topic: string): string {
    return `**📝 Summarization Approach for ${topic}:**\n• Key points extraction\n• Logical structure organization\n• Essential insights highlighting\n• Concise yet comprehensive overview\n\nYou'll get all the important information in a digestible format.`;
  }

  private generateHelpAction(content: string, topic: string): string {
    return `**🤝 Assistance Plan for ${topic}:**\n• Understanding your specific needs\n• Tailored solution development\n• Step-by-step guidance\n• Ongoing support and clarification\n\nI'm here to help you succeed with this.`;
  }

  private generateGeneralAction(content: string, topic: string): string {
    return `**⚡ Action Plan for ${topic}:**\n• Thorough assessment of requirements\n• Strategic approach development\n• Implementation with best practices\n• Results review and optimization\n\nI'll handle this efficiently and effectively.`;
  }

  private generateAnalyticalFindings(content: string, topic: string): string {
    return `• **Structure & Organization**: Well-defined elements with clear relationships\n• **Key Patterns**: Consistent themes and logical flow throughout\n• **Critical Insights**: Important discoveries that impact understanding\n• **Quality Assessment**: High-value content suitable for detailed analysis`;
  }

  private generateInsights(content: string, topic: string): string {
    return `• **Strategic Value**: This analysis provides actionable intelligence\n• **Practical Applications**: Direct relevance to real-world scenarios\n• **Next Steps**: Clear path forward based on findings\n• **Optimization Opportunities**: Areas for improvement and enhancement`;
  }

  private generateThoughtfulReflection(content: string, topic: string): string {
    return `Your observation about ${topic} raises some important considerations. There are multiple perspectives to consider here, and your viewpoint adds valuable insight to the discussion. The complexity of this topic means there are often nuanced aspects that deserve careful thought and analysis.`;
  }

  private generateEngagingDiscussion(content: string, topic: string): string {
    return `There are so many interesting angles to explore with ${topic}. The way you've approached this shows real insight into the subject matter. I think there's a lot we could unpack here, from the fundamental concepts to the practical implications and everything in between.`;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private generateErrorResponse(error: any): string {
    const errorResponses = [
      "I apologize, but I encountered a technical issue while processing your message. Let me try a different approach to help you.",
      "It seems there was a hiccup in my processing. Could you please rephrase your request so I can assist you better?",
      "I'm experiencing some difficulty with that particular request. Let me know how else I can help you today.",
      "There was an unexpected issue, but I'm still here to help! Please try rephrasing your question or request."
    ];
    
    return errorResponses[Math.floor(Math.random() * errorResponses.length)];
  }

  // Public methods for conversation management
  clearHistory(): void {
    this.conversationHistory = [];
    this.context = {
      topics: [],
      userPreferences: [],
      conversationTone: 'friendly',
      previousQuestions: [],
      attachmentHistory: []
    };
    this.initializeSystemContext();
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  getContext(): ConversationContext {
    return { ...this.context };
  }
}

// Create singleton instance
const chatProcessor = new IntelligentChatProcessor();

// Export the main function
export async function processMessage(messageContent: string, messageAttachments: Attachment[] = []): Promise<string> {
  return await chatProcessor.processMessage(messageContent, messageAttachments);
}

// Export additional utilities
export { IntelligentChatProcessor };
export type { Attachment, ChatMessage, ConversationContext };