// Advanced formal language conversion utilities with intelligent prompt analysis

interface ConversionOptions {
  conversionType: 'formal' | 'simplified' | 'detailed' | 'speech' | 'academic' | 'professional';
  tone: 'neutral' | 'persuasive' | 'informative' | 'conversational';
  targetAudience: 'general' | 'academic' | 'business' | 'technical';
}

interface PromptAnalysis {
  detectedIntent: string;
  specificInstructions: string[];
  contentType: string;
  urgencyLevel: 'low' | 'medium' | 'high';
  complexityLevel: 'simple' | 'moderate' | 'complex';
  suggestedConversion: ConversionOptions;
}

// Simulate AI processing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Analyze user prompt for intelligent conversion
function analyzePrompt(text: string): PromptAnalysis {
  const textLower = text.toLowerCase();
  
  // Detect specific instructions in the text
  const instructionPatterns = {
    formal: /\b(formal|professional|business|corporate|official|proper|polite)\b/gi,
    simplified: /\b(simple|easy|basic|explain|understand|clear|plain|layman)\b/gi,
    detailed: /\b(detailed|comprehensive|thorough|complete|elaborate|expand|in-depth)\b/gi,
    speech: /\b(speech|presentation|talk|address|lecture|speaking|audience)\b/gi,
    academic: /\b(academic|scholarly|research|scientific|thesis|paper|study)\b/gi,
    professional: /\b(professional|workplace|office|meeting|report|memo)\b/gi
  };

  const tonePatterns = {
    persuasive: /\b(convince|persuade|argue|compelling|motivate|influence)\b/gi,
    informative: /\b(inform|explain|educate|teach|describe|clarify)\b/gi,
    conversational: /\b(casual|friendly|chat|talk|discuss|conversation)\b/gi,
    neutral: /\b(neutral|objective|balanced|factual|unbiased)\b/gi
  };

  const audiencePatterns = {
    academic: /\b(professor|researcher|scholar|university|college|academic)\b/gi,
    business: /\b(business|corporate|executive|manager|client|stakeholder)\b/gi,
    technical: /\b(technical|engineer|developer|expert|specialist|professional)\b/gi,
    general: /\b(everyone|general|public|people|audience|readers)\b/gi
  };

  // Detect conversion type
  let detectedConversion: ConversionOptions['conversionType'] = 'formal';
  let maxScore = 0;
  
  Object.entries(instructionPatterns).forEach(([type, pattern]) => {
    const matches = (text.match(pattern) || []).length;
    if (matches > maxScore) {
      maxScore = matches;
      detectedConversion = type as ConversionOptions['conversionType'];
    }
  });

  // Detect tone
  let detectedTone: ConversionOptions['tone'] = 'neutral';
  maxScore = 0;
  
  Object.entries(tonePatterns).forEach(([tone, pattern]) => {
    const matches = (text.match(pattern) || []).length;
    if (matches > maxScore) {
      maxScore = matches;
      detectedTone = tone as ConversionOptions['tone'];
    }
  });

  // Detect audience
  let detectedAudience: ConversionOptions['targetAudience'] = 'general';
  maxScore = 0;
  
  Object.entries(audiencePatterns).forEach(([audience, pattern]) => {
    const matches = (text.match(pattern) || []).length;
    if (matches > maxScore) {
      maxScore = matches;
      detectedAudience = audience as ConversionOptions['targetAudience'];
    }
  });

  // Extract specific instructions
  const specificInstructions: string[] = [];
  
  // Look for instruction phrases
  const instructionPhrases = [
    /make (?:this|it) (?:more )?(\w+)/gi,
    /convert (?:this|it) (?:to|into) (\w+)/gi,
    /write (?:this|it) (?:in|as) (\w+)/gi,
    /transform (?:this|it) (?:to|into) (\w+)/gi,
    /explain (?:this|it) (?:in|as|for) (\w+)/gi
  ];

  instructionPhrases.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        specificInstructions.push(match[1]);
      }
    }
  });

  // Detect content type
  let contentType = 'general';
  if (textLower.includes('email') || textLower.includes('message')) contentType = 'communication';
  else if (textLower.includes('report') || textLower.includes('document')) contentType = 'document';
  else if (textLower.includes('presentation') || textLower.includes('speech')) contentType = 'presentation';
  else if (textLower.includes('article') || textLower.includes('blog')) contentType = 'article';

  // Detect urgency and complexity
  const urgencyKeywords = ['urgent', 'asap', 'quickly', 'immediately', 'rush'];
  const complexityKeywords = ['complex', 'complicated', 'advanced', 'sophisticated', 'intricate'];
  
  const urgencyLevel = urgencyKeywords.some(word => textLower.includes(word)) ? 'high' : 'medium';
  const complexityLevel = complexityKeywords.some(word => textLower.includes(word)) ? 'complex' : 
                         text.split(' ').length > 100 ? 'moderate' : 'simple';

  return {
    detectedIntent: `Convert to ${detectedConversion} style with ${detectedTone} tone for ${detectedAudience} audience`,
    specificInstructions,
    contentType,
    urgencyLevel,
    complexityLevel,
    suggestedConversion: {
      conversionType: detectedConversion,
      tone: detectedTone,
      targetAudience: detectedAudience
    }
  };
}

// Extract the main content from text (removing instructions)
function extractMainContent(text: string): string {
  // Remove common instruction phrases
  const instructionPatterns = [
    /(?:please\s+)?(?:make|convert|transform|write|explain|turn)\s+(?:this|it|the following)?\s*(?:more|into|to|as|in)?\s*\w+[.,]?\s*/gi,
    /(?:can you|could you|please)\s+\w+[^.!?]*[.!?]\s*/gi,
    /(?:i want|i need|i would like)\s+[^.!?]*[.!?]\s*/gi
  ];

  let cleanedText = text;
  instructionPatterns.forEach(pattern => {
    cleanedText = cleanedText.replace(pattern, '');
  });

  return cleanedText.trim();
}

// Convert to formal language
function convertToFormalLanguage(text: string, options: ConversionOptions): string {
  const { conversionType, tone, targetAudience } = options;
  
  // Base formal conversion
  let converted = text
    // Replace contractions
    .replace(/won't/gi, 'will not')
    .replace(/can't/gi, 'cannot')
    .replace(/don't/gi, 'do not')
    .replace(/doesn't/gi, 'does not')
    .replace(/isn't/gi, 'is not')
    .replace(/aren't/gi, 'are not')
    .replace(/wasn't/gi, 'was not')
    .replace(/weren't/gi, 'were not')
    .replace(/haven't/gi, 'have not')
    .replace(/hasn't/gi, 'has not')
    .replace(/hadn't/gi, 'had not')
    .replace(/wouldn't/gi, 'would not')
    .replace(/shouldn't/gi, 'should not')
    .replace(/couldn't/gi, 'could not')
    .replace(/mustn't/gi, 'must not')
    .replace(/needn't/gi, 'need not')
    .replace(/I'm/gi, 'I am')
    .replace(/you're/gi, 'you are')
    .replace(/we're/gi, 'we are')
    .replace(/they're/gi, 'they are')
    .replace(/it's/gi, 'it is')
    .replace(/that's/gi, 'that is')
    .replace(/there's/gi, 'there is')
    .replace(/here's/gi, 'here is')
    .replace(/what's/gi, 'what is')
    .replace(/where's/gi, 'where is')
    .replace(/who's/gi, 'who is')
    .replace(/how's/gi, 'how is')
    .replace(/I'll/gi, 'I will')
    .replace(/you'll/gi, 'you will')
    .replace(/we'll/gi, 'we will')
    .replace(/they'll/gi, 'they will')
    .replace(/I've/gi, 'I have')
    .replace(/you've/gi, 'you have')
    .replace(/we've/gi, 'we have')
    .replace(/they've/gi, 'they have')
    .replace(/I'd/gi, 'I would')
    .replace(/you'd/gi, 'you would')
    .replace(/we'd/gi, 'we would')
    .replace(/they'd/gi, 'they would')
    
    // Replace informal words with formal equivalents
    .replace(/\bkinda\b/gi, 'somewhat')
    .replace(/\bsorta\b/gi, 'somewhat')
    .replace(/\bgonna\b/gi, 'going to')
    .replace(/\bwanna\b/gi, 'want to')
    .replace(/\bgotta\b/gi, 'have to')
    .replace(/\byeah\b/gi, 'yes')
    .replace(/\byep\b/gi, 'yes')
    .replace(/\bnope\b/gi, 'no')
    .replace(/\bokay\b/gi, 'acceptable')
    .replace(/\bOK\b/gi, 'acceptable')
    .replace(/\bawesome\b/gi, 'excellent')
    .replace(/\bcool\b/gi, 'satisfactory')
    .replace(/\bstuff\b/gi, 'items')
    .replace(/\bthings\b/gi, 'matters')
    .replace(/\bguys\b/gi, 'individuals')
    .replace(/\bkids\b/gi, 'children')
    .replace(/\bbig\b/gi, 'significant')
    .replace(/\bsmall\b/gi, 'minimal')
    .replace(/\bget\b/gi, 'obtain')
    .replace(/\bmake\b/gi, 'create')
    .replace(/\bshow\b/gi, 'demonstrate')
    .replace(/\btell\b/gi, 'inform')
    .replace(/\bask\b/gi, 'inquire')
    .replace(/\bhelp\b/gi, 'assist')
    .replace(/\bfix\b/gi, 'resolve')
    .replace(/\bstart\b/gi, 'commence')
    .replace(/\bstop\b/gi, 'cease')
    .replace(/\bend\b/gi, 'conclude')
    .replace(/\bfind\b/gi, 'locate')
    .replace(/\buse\b/gi, 'utilize')
    .replace(/\btry\b/gi, 'attempt')
    .replace(/\bkeep\b/gi, 'maintain')
    .replace(/\bgive\b/gi, 'provide')
    .replace(/\btake\b/gi, 'acquire');

  // Apply conversion type specific transformations
  switch (conversionType) {
    case 'formal':
      converted = enhanceFormalLanguage(converted, targetAudience);
      break;
    case 'simplified':
      converted = simplifyLanguage(converted, targetAudience);
      break;
    case 'detailed':
      converted = addDetailedExplanations(converted, targetAudience);
      break;
    case 'speech':
      converted = convertToSpeechFormat(converted, targetAudience);
      break;
    case 'academic':
      converted = convertToAcademicStyle(converted, targetAudience);
      break;
    case 'professional':
      converted = convertToProfessionalStyle(converted, targetAudience);
      break;
  }

  // Apply tone adjustments
  converted = applyTone(converted, tone);

  return converted;
}

// Enhance formal language
function enhanceFormalLanguage(text: string, audience: string): string {
  let enhanced = text;

  // Add formal sentence starters
  const sentences = enhanced.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const formalSentences = sentences.map((sentence, index) => {
    const trimmed = sentence.trim();
    if (!trimmed) return '';

    // Add formal transitions
    if (index > 0) {
      const transitions = ['Furthermore,', 'Additionally,', 'Moreover,', 'Consequently,', 'Subsequently,'];
      if (Math.random() > 0.7) {
        return `${transitions[index % transitions.length]} ${trimmed.toLowerCase()}`;
      }
    }

    // Capitalize first letter
    return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
  });

  enhanced = formalSentences.join('. ') + '.';

  // Add formal phrases based on audience
  if (audience === 'business') {
    enhanced = enhanced.replace(/\bI think\b/gi, 'It is my professional opinion that');
    enhanced = enhanced.replace(/\bWe should\b/gi, 'It would be advisable to');
  } else if (audience === 'academic') {
    enhanced = enhanced.replace(/\bI think\b/gi, 'It can be argued that');
    enhanced = enhanced.replace(/\bThis shows\b/gi, 'This demonstrates');
  }

  return enhanced;
}

// Simplify language
function simplifyLanguage(text: string, audience: string): string {
  let simplified = text
    // Replace complex words with simpler alternatives
    .replace(/\butilize\b/gi, 'use')
    .replace(/\bdemonstrate\b/gi, 'show')
    .replace(/\bfacilitate\b/gi, 'help')
    .replace(/\bcommence\b/gi, 'start')
    .replace(/\bconclude\b/gi, 'end')
    .replace(/\bacquire\b/gi, 'get')
    .replace(/\bmaintain\b/gi, 'keep')
    .replace(/\bprovide\b/gi, 'give')
    .replace(/\binquire\b/gi, 'ask')
    .replace(/\bassist\b/gi, 'help')
    .replace(/\bresolve\b/gi, 'fix')
    .replace(/\blocate\b/gi, 'find')
    .replace(/\battempt\b/gi, 'try')
    .replace(/\bsignificant\b/gi, 'important')
    .replace(/\bminimal\b/gi, 'small')
    .replace(/\bsubsequently\b/gi, 'then')
    .replace(/\bfurthermore\b/gi, 'also')
    .replace(/\badditionally\b/gi, 'also')
    .replace(/\bmoreover\b/gi, 'also')
    .replace(/\bconsequently\b/gi, 'so')
    .replace(/\btherefore\b/gi, 'so')
    .replace(/\bhowever\b/gi, 'but')
    .replace(/\bnevertheless\b/gi, 'but');

  // Break down complex sentences
  const sentences = simplified.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const simplifiedSentences = sentences.map(sentence => {
    const words = sentence.trim().split(' ');
    if (words.length > 20) {
      // Try to break into smaller sentences
      const midPoint = Math.floor(words.length / 2);
      const firstHalf = words.slice(0, midPoint).join(' ');
      const secondHalf = words.slice(midPoint).join(' ');
      return `${firstHalf}. ${secondHalf.charAt(0).toUpperCase()}${secondHalf.slice(1)}`;
    }
    return sentence.trim();
  });

  return simplifiedSentences.join('. ') + '.';
}

// Add detailed explanations
function addDetailedExplanations(text: string, audience: string): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const detailedSentences = sentences.map((sentence, index) => {
    let enhanced = sentence.trim();
    
    // Add explanatory phrases
    if (enhanced.includes('important') || enhanced.includes('significant')) {
      enhanced += ', which plays a crucial role in the overall understanding of this concept';
    }
    
    if (enhanced.includes('method') || enhanced.includes('approach')) {
      enhanced += ', involving systematic procedures and careful consideration of various factors';
    }
    
    if (enhanced.includes('result') || enhanced.includes('outcome')) {
      enhanced += ', demonstrating the effectiveness and practical implications of the discussed principles';
    }

    // Add context based on audience
    if (audience === 'technical' && (enhanced.includes('system') || enhanced.includes('process'))) {
      enhanced += ', incorporating advanced methodologies and technical specifications';
    }

    return enhanced;
  });

  // Add comprehensive introduction and conclusion
  let detailed = detailedSentences.join('. ') + '.';
  
  if (audience === 'academic') {
    detailed = `This comprehensive analysis examines the following key aspects: ${detailed} In conclusion, these elements collectively contribute to a thorough understanding of the subject matter.`;
  } else if (audience === 'business') {
    detailed = `The following detailed overview provides essential insights for strategic decision-making: ${detailed} These considerations are fundamental for successful implementation and optimal outcomes.`;
  }

  return detailed;
}

// Convert to speech format
function convertToSpeechFormat(text: string, audience: string): string {
  let speech = text;

  // Add speech markers and pauses
  speech = speech.replace(/\. /g, '. [PAUSE] ');
  speech = speech.replace(/\, /g, ', [SHORT PAUSE] ');

  // Add engaging openings
  const openings = [
    'Ladies and gentlemen,',
    'Distinguished audience,',
    'Esteemed colleagues,',
    'Dear friends and colleagues,'
  ];

  const opening = audience === 'academic' ? 'Distinguished colleagues and researchers,' :
                 audience === 'business' ? 'Esteemed business leaders and stakeholders,' :
                 'Ladies and gentlemen,';

  // Add speech structure
  speech = `${opening} [PAUSE] Today, I would like to discuss ${speech} [PAUSE] Thank you for your attention.`;

  // Add emphasis markers
  speech = speech.replace(/\bimportant\b/gi, '[EMPHASIS] important [/EMPHASIS]');
  speech = speech.replace(/\bsignificant\b/gi, '[EMPHASIS] significant [/EMPHASIS]');
  speech = speech.replace(/\bcrucial\b/gi, '[EMPHASIS] crucial [/EMPHASIS]');

  return speech.replace(/\[PAUSE\]/g, '').replace(/\[SHORT PAUSE\]/g, '').replace(/\[EMPHASIS\]/g, '').replace(/\[\/EMPHASIS\]/g, '');
}

// Convert to academic style
function convertToAcademicStyle(text: string, audience: string): string {
  let academic = text;

  // Add academic language patterns
  academic = academic.replace(/\bThis shows\b/gi, 'This empirical evidence demonstrates');
  academic = academic.replace(/\bWe can see\b/gi, 'It can be observed');
  academic = academic.replace(/\bIt is clear\b/gi, 'The evidence suggests');
  academic = academic.replace(/\bI think\b/gi, 'It can be hypothesized');
  academic = academic.replace(/\bIn my opinion\b/gi, 'Based on the available evidence');

  // Add citations placeholders
  const sentences = academic.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const citedSentences = sentences.map((sentence, index) => {
    const trimmed = sentence.trim();
    if (index % 3 === 0 && trimmed.length > 20) {
      return `${trimmed} (Author, Year)`;
    }
    return trimmed;
  });

  academic = citedSentences.join('. ') + '.';

  // Add academic structure
  academic = `Abstract: This paper examines the key concepts presented in the following analysis. ${academic} The findings contribute to the broader understanding of the field and suggest areas for future research.`;

  return academic;
}

// Convert to professional style
function convertToProfessionalStyle(text: string, audience: string): string {
  let professional = text;

  // Add professional language
  professional = professional.replace(/\bI want\b/gi, 'I would like to propose');
  professional = professional.replace(/\bWe need\b/gi, 'It is recommended that we');
  professional = professional.replace(/\bThis is good\b/gi, 'This approach demonstrates merit');
  professional = professional.replace(/\bThis is bad\b/gi, 'This approach presents challenges');

  // Add professional structure
  if (audience === 'business') {
    professional = `Executive Summary: ${professional.split('.')[0]}. Key Points: ${professional} Recommendations: Based on this analysis, it is advisable to proceed with careful consideration of the outlined factors.`;
  }

  return professional;
}

// Apply tone adjustments
function applyTone(text: string, tone: string): string {
  let toned = text;

  switch (tone) {
    case 'persuasive':
      toned = toned.replace(/\bshould\b/gi, 'must');
      toned = toned.replace(/\bcould\b/gi, 'should');
      toned = toned.replace(/\bmight\b/gi, 'will');
      toned = `It is imperative to understand that ${toned} The evidence clearly supports this position.`;
      break;
      
    case 'informative':
      toned = `The following information provides essential insights: ${toned} This knowledge serves as a foundation for further understanding.`;
      break;
      
    case 'conversational':
      toned = toned.replace(/\bIt is important to note\b/gi, 'You should know');
      toned = toned.replace(/\bFurthermore\b/gi, 'Also');
      toned = toned.replace(/\bAdditionally\b/gi, 'Plus');
      break;
      
    case 'neutral':
      // Keep neutral tone as is
      break;
  }

  return toned;
}

// Main conversion function
export async function convertToFormal(text: string, options: ConversionOptions): Promise<string> {
  await delay(1500);

  if (text.length < 10) {
    return "Text is too short to convert meaningfully. Please provide more content.";
  }

  // Analyze the prompt for intelligent conversion
  const analysis = analyzePrompt(text);
  
  // Extract main content (remove instruction phrases)
  const mainContent = extractMainContent(text);
  
  if (mainContent.length < 10) {
    return "Please provide the content you'd like to convert along with your instructions.";
  }

  // Use detected preferences if they seem more appropriate
  const finalOptions = {
    ...options,
    // Override with detected preferences if they're more specific
    ...(analysis.specificInstructions.length > 0 ? analysis.suggestedConversion : {})
  };

  // Convert the content
  const converted = convertToFormalLanguage(mainContent, finalOptions);

  // Add a note about the conversion if specific instructions were detected
  if (analysis.specificInstructions.length > 0) {
    return `${converted}\n\n---\nNote: Converted based on detected instructions: ${analysis.specificInstructions.join(', ')}`;
  }

  return converted;
}