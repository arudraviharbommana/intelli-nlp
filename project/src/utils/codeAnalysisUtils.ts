// Advanced code analysis utilities with enhanced error detection and correction

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

// Simulate AI processing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced error detection with proper fix generation
function detectErrors(code: string, language: string): CodeAnalysis['errors'] {
  const errors: CodeAnalysis['errors'] = [];
  const lines = code.split('\n');

  if (language === 'javascript') {
    detectJavaScriptErrors(code, lines, errors);
  } else if (language === 'python') {
    detectPythonErrors(code, lines, errors);
  } else if (language === 'java') {
    detectJavaErrors(code, lines, errors);
  } else if (language === 'typescript') {
    detectTypeScriptErrors(code, lines, errors);
  }

  // Remove duplicates and ensure fixes are actually different
  const uniqueErrors = errors.filter((error, index, self) => {
    const isDuplicate = self.findIndex(e => 
      e.line === error.line && 
      e.message === error.message
    ) !== index;
    
    const hasRealFix = error.originalCode.trim() !== error.suggestedFix.trim();
    
    return !isDuplicate && hasRealFix;
  });

  return uniqueErrors.slice(0, 10); // Limit to 10 most important errors
}

// Enhanced JavaScript error detection
function detectJavaScriptErrors(code: string, lines: string[], errors: CodeAnalysis['errors']) {
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;
    
    // Skip comments and empty lines
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

    // 1. Missing semicolons (only for statements that need them)
    if (shouldHaveSemicolon(trimmed) && !trimmed.endsWith(';')) {
      errors.push({
        type: 'Style',
        severity: 'Low',
        line: lineNumber,
        message: 'Missing semicolon at end of statement',
        originalCode: trimmed,
        suggestedFix: trimmed + ';',
        explanation: 'JavaScript statements should end with semicolons for consistency and to avoid automatic semicolon insertion issues.'
      });
    }

    // 2. Use of var instead of let/const
    if (trimmed.includes('var ')) {
      const fixed = trimmed.replace(/\bvar\b/g, 'const');
      if (fixed !== trimmed) {
        errors.push({
          type: 'Best Practice',
          severity: 'Medium',
          line: lineNumber,
          message: 'Use const or let instead of var',
          originalCode: trimmed,
          suggestedFix: fixed,
          explanation: 'const and let have block scope and prevent hoisting issues. Use const for values that won\'t be reassigned.'
        });
      }
    }

    // 3. Loose equality (==) instead of strict equality (===)
    if (trimmed.includes('==') && !trimmed.includes('===') && !trimmed.includes('!==')) {
      const fixed = trimmed.replace(/([^=!])={2}([^=])/g, '$1===$2');
      if (fixed !== trimmed) {
        errors.push({
          type: 'Best Practice',
          severity: 'Medium',
          line: lineNumber,
          message: 'Use strict equality (===) instead of loose equality (==)',
          originalCode: trimmed,
          suggestedFix: fixed,
          explanation: 'Strict equality prevents type coercion issues and makes comparisons more predictable.'
        });
      }
    }

    // 4. Console.log in production code
    if (trimmed.includes('console.log(')) {
      const fixed = trimmed.replace(/console\.log\([^)]*\);?/g, '// TODO: Remove console.log for production');
      errors.push({
        type: 'Style',
        severity: 'Low',
        line: lineNumber,
        message: 'Console.log should be removed in production',
        originalCode: trimmed,
        suggestedFix: fixed,
        explanation: 'Console statements can expose sensitive information and impact performance in production.'
      });
    }

    // 5. Function declarations that could be arrow functions
    const funcMatch = trimmed.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/);
    if (funcMatch && !trimmed.includes('function*')) {
      const funcName = funcMatch[1];
      const params = trimmed.match(/\(([^)]*)\)/)?.[1] || '';
      const fixed = `const ${funcName} = (${params}) => {`;
      errors.push({
        type: 'Style',
        severity: 'Low',
        line: lineNumber,
        message: 'Consider using arrow function for consistency',
        originalCode: trimmed,
        suggestedFix: fixed,
        explanation: 'Arrow functions provide cleaner syntax and lexical this binding.'
      });
    }

    // 6. Undefined variables (basic check)
    if (trimmed.includes('undefined') && !trimmed.includes('typeof') && !trimmed.includes('===')) {
      const fixed = trimmed.replace(/\bundefined\b/g, 'null');
      if (fixed !== trimmed) {
        errors.push({
          type: 'Logic',
          severity: 'Medium',
          line: lineNumber,
          message: 'Consider using null instead of undefined for explicit absence',
          originalCode: trimmed,
          suggestedFix: fixed,
          explanation: 'Using null is more explicit than undefined for intentionally empty values.'
        });
      }
    }

    // 7. Missing error handling for async operations
    if (trimmed.includes('await') && !code.includes('try') && !code.includes('catch')) {
      errors.push({
        type: 'Runtime',
        severity: 'High',
        line: lineNumber,
        message: 'Async operations should include error handling',
        originalCode: trimmed,
        suggestedFix: `try {\n  ${trimmed}\n} catch (error) {\n  console.error('Error:', error);\n}`,
        explanation: 'Async operations can fail and should be wrapped in try-catch blocks.'
      });
    }
  });
}

// Enhanced Python error detection
function detectPythonErrors(code: string, lines: string[], errors: CodeAnalysis['errors']) {
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;
    
    if (!trimmed || trimmed.startsWith('#')) return;

    // 1. Missing colon after control structures
    if (isControlStructure(trimmed) && !trimmed.endsWith(':')) {
      errors.push({
        type: 'Syntax',
        severity: 'Critical',
        line: lineNumber,
        message: 'Missing colon after control structure',
        originalCode: trimmed,
        suggestedFix: trimmed + ':',
        explanation: 'Python control structures (if, for, while, def, class) must end with a colon.'
      });
    }

    // 2. Incorrect indentation
    if (index > 0) {
      const prevLine = lines[index - 1].trim();
      if (prevLine.endsWith(':') && trimmed && !line.startsWith('    ') && !line.startsWith('\t')) {
        errors.push({
          type: 'Syntax',
          severity: 'Critical',
          line: lineNumber,
          message: 'Incorrect indentation after colon',
          originalCode: line,
          suggestedFix: '    ' + trimmed,
          explanation: 'Python requires consistent indentation (4 spaces recommended) after control structures.'
        });
      }
    }

    // 3. Bare except clauses
    if (trimmed === 'except:') {
      errors.push({
        type: 'Best Practice',
        severity: 'Medium',
        line: lineNumber,
        message: 'Avoid bare except clauses',
        originalCode: trimmed,
        suggestedFix: 'except Exception as e:',
        explanation: 'Bare except clauses can catch system exits and keyboard interrupts. Specify exception types.'
      });
    }

    // 4. Print statements (should use logging)
    if (trimmed.startsWith('print(')) {
      const content = trimmed.match(/print\(([^)]+)\)/)?.[1] || '""';
      errors.push({
        type: 'Style',
        severity: 'Low',
        line: lineNumber,
        message: 'Consider using logging instead of print',
        originalCode: trimmed,
        suggestedFix: `logging.info(${content})`,
        explanation: 'Logging provides better control over output levels and destinations than print statements.'
      });
    }

    // 5. Boolean comparisons
    if (trimmed.includes('== True') || trimmed.includes('== False')) {
      const fixed = trimmed.replace(/== True/g, 'is True').replace(/== False/g, 'is False');
      errors.push({
        type: 'Style',
        severity: 'Low',
        line: lineNumber,
        message: 'Use "is" for boolean comparisons',
        originalCode: trimmed,
        suggestedFix: fixed,
        explanation: 'Use "is True" or "is False" for boolean comparisons instead of "==".'
      });
    }

    // 6. Missing imports
    if (trimmed.includes('json.') && !code.includes('import json')) {
      errors.push({
        type: 'Runtime',
        severity: 'High',
        line: lineNumber,
        message: 'Missing import for json module',
        originalCode: trimmed,
        suggestedFix: '# Add at top of file: import json\n' + trimmed,
        explanation: 'The json module must be imported before use.'
      });
    }
  });
}

// Enhanced Java error detection
function detectJavaErrors(code: string, lines: string[], errors: CodeAnalysis['errors']) {
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;
    
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) return;

    // 1. Missing semicolons
    if (needsSemicolon(trimmed) && !trimmed.endsWith(';') && !trimmed.endsWith('{') && !trimmed.endsWith('}')) {
      errors.push({
        type: 'Syntax',
        severity: 'Critical',
        line: lineNumber,
        message: 'Missing semicolon',
        originalCode: trimmed,
        suggestedFix: trimmed + ';',
        explanation: 'Java statements must end with semicolons.'
      });
    }

    // 2. System.out.println usage
    if (trimmed.includes('System.out.println') || trimmed.includes('System.out.print')) {
      const fixed = trimmed.replace(/System\.out\.print(ln)?/g, 'logger.info');
      errors.push({
        type: 'Best Practice',
        severity: 'Medium',
        line: lineNumber,
        message: 'Use logging framework instead of System.out',
        originalCode: trimmed,
        suggestedFix: fixed,
        explanation: 'Use a logging framework like Log4j or SLF4J instead of System.out for better control.'
      });
    }

    // 3. Null comparisons
    if (trimmed.includes('== null') || trimmed.includes('!= null')) {
      const fixed = trimmed
        .replace(/(\w+)\s*==\s*null/g, 'Objects.isNull($1)')
        .replace(/(\w+)\s*!=\s*null/g, 'Objects.nonNull($1)');
      if (fixed !== trimmed) {
        errors.push({
          type: 'Best Practice',
          severity: 'Medium',
          line: lineNumber,
          message: 'Use Objects.isNull() for null checks',
          originalCode: trimmed,
          suggestedFix: fixed,
          explanation: 'Objects.isNull() and Objects.nonNull() provide null-safe comparisons.'
        });
      }
    }

    // 4. Missing access modifiers
    if (trimmed.match(/^\s*(class|interface)\s+\w+/) && !trimmed.includes('public') && !trimmed.includes('private')) {
      errors.push({
        type: 'Style',
        severity: 'Low',
        line: lineNumber,
        message: 'Consider adding access modifier',
        originalCode: trimmed,
        suggestedFix: 'public ' + trimmed,
        explanation: 'Explicitly specify access modifiers for better code clarity.'
      });
    }
  });
}

// Enhanced TypeScript error detection
function detectTypeScriptErrors(code: string, lines: string[], errors: CodeAnalysis['errors']) {
  // First run JavaScript checks
  detectJavaScriptErrors(code, lines, errors);
  
  lines.forEach((line, index) => {
    const trimmed = line.trim();
    const lineNumber = index + 1;
    
    if (!trimmed || trimmed.startsWith('//')) return;

    // 1. Missing type annotations
    if (trimmed.includes('function') && !trimmed.includes(':') && !trimmed.includes('=>')) {
      const funcMatch = trimmed.match(/function\s+(\w+)\s*\(([^)]*)\)/);
      if (funcMatch) {
        const funcName = funcMatch[1];
        const params = funcMatch[2];
        const typedParams = params ? params.split(',').map(p => p.trim() + ': any').join(', ') : '';
        const fixed = trimmed.replace(/function\s+\w+\s*\([^)]*\)/, `function ${funcName}(${typedParams}): void`);
        errors.push({
          type: 'Best Practice',
          severity: 'Medium',
          line: lineNumber,
          message: 'Add type annotations for better type safety',
          originalCode: trimmed,
          suggestedFix: fixed,
          explanation: 'TypeScript benefits from explicit type annotations for better IDE support and error catching.'
        });
      }
    }

    // 2. Using 'any' type
    if (trimmed.includes(': any')) {
      errors.push({
        type: 'Best Practice',
        severity: 'Low',
        line: lineNumber,
        message: 'Avoid using "any" type when possible',
        originalCode: trimmed,
        suggestedFix: trimmed.replace(/:\s*any/g, ': unknown // TODO: Add specific type'),
        explanation: 'Using specific types instead of "any" provides better type safety and IDE support.'
      });
    }
  });
}

// Helper functions
function shouldHaveSemicolon(line: string): boolean {
  const trimmed = line.trim();
  
  // Lines that should have semicolons
  const needsSemi = [
    /^(let|const|var)\s+\w+/, // Variable declarations
    /^return\s+/, // Return statements
    /^throw\s+/, // Throw statements
    /^\w+\s*=/, // Assignments
    /^\w+\([^)]*\)$/, // Function calls
    /^break$/, // Break statements
    /^continue$/, // Continue statements
  ];
  
  // Lines that should NOT have semicolons
  const noSemi = [
    /\{$/, // Opening braces
    /\}$/, // Closing braces
    /^if\s*\(/, // If statements
    /^for\s*\(/, // For loops
    /^while\s*\(/, // While loops
    /^function\s+/, // Function declarations
    /^class\s+/, // Class declarations
    /^\/\//, // Comments
    /^\/\*/, // Block comments
  ];
  
  // Check if line should NOT have semicolon
  if (noSemi.some(pattern => pattern.test(trimmed))) {
    return false;
  }
  
  // Check if line should have semicolon
  return needsSemi.some(pattern => pattern.test(trimmed));
}

function isControlStructure(line: string): boolean {
  const controlPatterns = [
    /^if\s+/, /^elif\s+/, /^else\s*$/,
    /^for\s+/, /^while\s+/,
    /^def\s+/, /^class\s+/,
    /^try\s*$/, /^except/, /^finally\s*$/,
    /^with\s+/
  ];
  
  return controlPatterns.some(pattern => pattern.test(line.trim()));
}

function needsSemicolon(line: string): boolean {
  const trimmed = line.trim();
  
  // Java statements that need semicolons
  const needsSemi = [
    /^(int|String|boolean|double|float|long|char|byte|short)\s+\w+/, // Variable declarations
    /^return\s+/, // Return statements
    /^throw\s+/, // Throw statements
    /^\w+\s*=/, // Assignments
    /^\w+\([^)]*\)$/, // Method calls
    /^break$/, // Break statements
    /^continue$/, // Continue statements
    /^import\s+/, // Import statements
    /^package\s+/, // Package statements
  ];
  
  return needsSemi.some(pattern => pattern.test(trimmed));
}

// Generate corrected code with proper fixes
function generateCorrectedCode(code: string, errors: CodeAnalysis['errors']): string {
  let correctedCode = code;
  const lines = correctedCode.split('\n');

  // Sort errors by line number (descending) to avoid line number shifts
  const sortedErrors = errors
    .filter(error => error.suggestedFix !== error.originalCode)
    .sort((a, b) => b.line - a.line);

  // Apply fixes line by line
  sortedErrors.forEach(error => {
    if (error.line <= lines.length && error.line > 0) {
      const lineIndex = error.line - 1;
      const currentLine = lines[lineIndex];
      
      // Apply the fix if the original code matches
      if (currentLine.trim() === error.originalCode.trim()) {
        if (error.suggestedFix.includes('\n')) {
          // Multi-line fix
          const fixLines = error.suggestedFix.split('\n');
          lines.splice(lineIndex, 1, ...fixLines);
        } else {
          // Single line fix - preserve indentation
          const indentation = currentLine.match(/^\s*/)?.[0] || '';
          lines[lineIndex] = indentation + error.suggestedFix;
        }
      } else if (currentLine.includes(error.originalCode)) {
        // Partial line replacement
        lines[lineIndex] = currentLine.replace(error.originalCode, error.suggestedFix);
      }
    }
  });

  // Add missing imports at the top
  const needsImports = [];
  if (errors.some(e => e.suggestedFix.includes('logging.')) && !code.includes('import logging')) {
    needsImports.push('import logging');
  }
  if (errors.some(e => e.suggestedFix.includes('Objects.')) && !code.includes('import java.util.Objects')) {
    needsImports.push('import java.util.Objects;');
  }
  
  if (needsImports.length > 0) {
    lines.unshift(...needsImports, '');
  }

  return lines.join('\n');
}

// Rest of the utility functions remain the same...
function detectLanguage(code: string): string {
  if (code.includes('def ') || code.includes('import ') || code.includes('print(')) return 'python';
  if (code.includes('public class') || code.includes('System.out.')) return 'java';
  if (code.includes('interface ') && code.includes(': ')) return 'typescript';
  if (code.includes('function ') || code.includes('const ') || code.includes('console.')) return 'javascript';
  if (code.includes('#include') || code.includes('int main')) return 'cpp';
  return 'javascript'; // default
}

function extractImports(code: string, language: string): { name: string; purpose: string; usage: string[] }[] {
  const libraries: { name: string; purpose: string; usage: string[] }[] = [];
  
  const importPatterns = {
    javascript: /(?:import.*from\s+['"`](.*?)['"`]|require\(['"`](.*?)['"`]\))/g,
    python: /(?:import\s+(\w+)|from\s+(\w+))/g,
    java: /import\s+(?:.*\.)?(\w+);/g,
    typescript: /(?:import.*from\s+['"`](.*?)['"`]|require\(['"`](.*?)['"`]\))/g
  };

  const pattern = importPatterns[language as keyof typeof importPatterns];
  if (!pattern) return libraries;

  let match;
  while ((match = pattern.exec(code)) !== null) {
    const libName = match[1] || match[2];
    if (libName && !libraries.find(lib => lib.name === libName)) {
      libraries.push({
        name: libName,
        purpose: getLibraryPurpose(libName, language),
        usage: findLibraryUsage(code, libName)
      });
    }
  }

  return libraries;
}

function getLibraryPurpose(libName: string, language: string): string {
  const purposes: { [key: string]: { [lib: string]: string } } = {
    javascript: {
      'react': 'UI component library for building user interfaces',
      'express': 'Web application framework for Node.js',
      'lodash': 'Utility library for common programming tasks',
      'axios': 'HTTP client for making API requests',
      'fs': 'File system operations module',
      'path': 'File and directory path utilities'
    },
    python: {
      'numpy': 'Numerical computing library',
      'pandas': 'Data manipulation and analysis',
      'requests': 'HTTP library for API requests',
      'json': 'JSON encoder and decoder',
      'os': 'Operating system interface',
      'logging': 'Logging facility for Python'
    },
    java: {
      'ArrayList': 'Dynamic array implementation',
      'HashMap': 'Hash table for key-value pairs',
      'Scanner': 'Input reading utility',
      'Objects': 'Utility methods for objects'
    }
  };

  return purposes[language]?.[libName] || 'External library or module';
}

function findLibraryUsage(code: string, libName: string): string[] {
  const usage: string[] = [];
  const regex = new RegExp(`${libName}\\.[\\w]+`, 'g');
  const matches = code.match(regex) || [];
  return [...new Set(matches)].slice(0, 5);
}

function extractFunctions(code: string, language: string): string[] {
  const functions: string[] = [];
  
  const patterns = {
    javascript: /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:\s*(?:function|\())/g,
    python: /def\s+(\w+)\s*\(/g,
    java: /(?:public|private|protected)?\s*(?:static)?\s*\w+\s+(\w+)\s*\(/g,
    typescript: /(?:function\s+(\w+)|const\s+(\w+)\s*=|(\w+)\s*:\s*(?:function|\())/g
  };

  const pattern = patterns[language as keyof typeof patterns];
  if (!pattern) return functions;

  let match;
  while ((match = pattern.exec(code)) !== null) {
    const funcName = match[1] || match[2] || match[3];
    if (funcName && !functions.includes(funcName)) {
      functions.push(funcName);
    }
  }

  return functions.slice(0, 10);
}

function generateSuggestions(code: string, language: string): CodeAnalysis['suggestions'] {
  const suggestions: CodeAnalysis['suggestions'] = [];

  // Performance suggestions
  if (code.includes('for') && code.includes('.length')) {
    suggestions.push({
      type: 'Performance',
      message: 'Cache array length in loops',
      improvement: 'Store array.length in a variable before the loop to avoid repeated property access.'
    });
  }

  // Security suggestions
  if (language === 'javascript' && code.includes('innerHTML')) {
    suggestions.push({
      type: 'Security',
      message: 'Avoid innerHTML for user input',
      improvement: 'Use textContent or createElement to prevent XSS attacks when handling user input.'
    });
  }

  // Best practice suggestions
  if (language === 'javascript' && !code.includes('use strict')) {
    suggestions.push({
      type: 'Best Practice',
      message: 'Enable strict mode',
      improvement: 'Add "use strict"; at the beginning of your script to catch common errors early.'
    });
  }

  return suggestions;
}

function generateDryRun(code: string, language: string, functions: string[]): CodeAnalysis['dryRun'] {
  const variables: { name: string; value: string; type: string }[] = [];
  
  // Extract variables based on language
  const varPatterns = {
    javascript: /(?:let|const|var)\s+(\w+)\s*=\s*([^;]+)/g,
    python: /(\w+)\s*=\s*([^#\n]+)/g,
    java: /(?:int|String|boolean|double)\s+(\w+)\s*=\s*([^;]+)/g
  };

  const pattern = varPatterns[language as keyof typeof varPatterns];
  if (pattern) {
    let match;
    while ((match = pattern.exec(code)) !== null && variables.length < 5) {
      variables.push({
        name: match[1],
        value: match[2].trim(),
        type: inferType(match[2].trim())
      });
    }
  }

  return {
    scenario: `Executing the main function with sample inputs to demonstrate code behavior`,
    steps: [
      'Initialize variables with their assigned values',
      'Execute main logic following control structures',
      'Process conditional statements and loops',
      'Call functions in execution order',
      'Return results based on code logic'
    ],
    expectedOutput: generateExpectedOutput(code, language),
    variables
  };
}

function inferType(value: string): string {
  if (/^\d+$/.test(value)) return 'number';
  if (/^\d*\.\d+$/.test(value)) return 'float';
  if (/^['"`].*['"`]$/.test(value)) return 'string';
  if (/^(true|false|True|False)$/.test(value)) return 'boolean';
  if (value.startsWith('[')) return 'array';
  if (value.startsWith('{')) return 'object';
  return 'variable';
}

function generateExpectedOutput(code: string, language: string): string {
  const outputPatterns = {
    javascript: /console\.log\([^)]+\)/g,
    python: /print\([^)]+\)/g,
    java: /System\.out\.println?\([^)]+\)/g
  };

  const pattern = outputPatterns[language as keyof typeof outputPatterns];
  if (pattern) {
    const matches = code.match(pattern) || [];
    if (matches.length > 0) {
      return matches.slice(0, 3).map(match => {
        const content = match.match(/\(([^)]+)\)/)?.[1] || '';
        return content.replace(/['"]/g, '');
      }).join('\n');
    }
  }

  return 'Output depends on input values and execution flow.';
}

function generateCodePurpose(code: string, functions: string[], libraries: { name: string }[]): string {
  const codeContent = code.toLowerCase();
  
  if (codeContent.includes('react') || codeContent.includes('component')) {
    return 'A React application component for building interactive user interfaces';
  }
  if (codeContent.includes('express') || codeContent.includes('server')) {
    return 'A web server application for handling HTTP requests and API endpoints';
  }
  if (codeContent.includes('class') && functions.length > 3) {
    return 'An object-oriented program with classes and methods for modeling entities';
  }
  if (functions.length > 5) {
    return 'A modular program with multiple functions for various computational tasks';
  }
  
  return 'A general-purpose program implementing specific logic and functionality';
}

function extractMainFeatures(code: string): string[] {
  const features: string[] = [];
  const codeContent = code.toLowerCase();
  
  if (codeContent.includes('function') || codeContent.includes('def')) {
    features.push('Function definitions and modular code organization');
  }
  if (codeContent.includes('class')) {
    features.push('Object-oriented programming with class definitions');
  }
  if (codeContent.includes('if') || codeContent.includes('else')) {
    features.push('Conditional logic and decision-making structures');
  }
  if (codeContent.includes('for') || codeContent.includes('while')) {
    features.push('Iterative processing with loops');
  }
  if (codeContent.includes('async') || codeContent.includes('await')) {
    features.push('Asynchronous programming and concurrent execution');
  }
  
  return features.length > 0 ? features : ['Basic programming logic'];
}

function extractDataStructures(code: string): string[] {
  const structures: string[] = [];
  const codeContent = code.toLowerCase();
  
  if (code.includes('[') || codeContent.includes('array') || codeContent.includes('list')) {
    structures.push('Arrays/Lists');
  }
  if (code.includes('{') || codeContent.includes('object') || codeContent.includes('dict')) {
    structures.push('Objects/Dictionaries');
  }
  if (codeContent.includes('set')) {
    structures.push('Sets');
  }
  if (codeContent.includes('map') || codeContent.includes('hashmap')) {
    structures.push('Maps/Hash Tables');
  }
  
  return structures.length > 0 ? structures : ['Basic variables'];
}

function extractAlgorithms(code: string): string[] {
  const algorithms: string[] = [];
  const codeContent = code.toLowerCase();
  
  if (codeContent.includes('sort')) {
    algorithms.push('Sorting algorithms');
  }
  if (codeContent.includes('search') || codeContent.includes('find')) {
    algorithms.push('Search algorithms');
  }
  if (codeContent.includes('recursive')) {
    algorithms.push('Recursive algorithms');
  }
  if (codeContent.includes('loop') || codeContent.includes('iterate')) {
    algorithms.push('Iterative algorithms');
  }
  
  return algorithms.length > 0 ? algorithms : ['Sequential processing'];
}

// Main analysis function
export async function analyzeCode(code: string, language: string): Promise<CodeAnalysis> {
  await delay(2000);

  if (code.length < 10) {
    throw new Error('Code is too short to analyze meaningfully.');
  }

  const lines = code.split('\n').filter(line => line.trim().length > 0);
  const linesOfCode = lines.length;
  
  const libraries = extractImports(code, language);
  const functions = extractFunctions(code, language);
  const errors = detectErrors(code, language);
  const suggestions = generateSuggestions(code, language);
  
  const complexity: 'Low' | 'Medium' | 'High' = 
    linesOfCode < 50 ? 'Low' : 
    linesOfCode < 200 ? 'Medium' : 'High';

  const purpose = generateCodePurpose(code, functions, libraries);
  const mainFeatures = extractMainFeatures(code);
  const dryRun = generateDryRun(code, language, functions);
  const correctedCode = generateCorrectedCode(code, errors);

  return {
    overview: {
      language: language.charAt(0).toUpperCase() + language.slice(1),
      purpose,
      complexity,
      linesOfCode
    },
    functionality: {
      mainFeatures,
      keyFunctions: functions,
      dataStructures: extractDataStructures(code),
      algorithms: extractAlgorithms(code)
    },
    libraries,
    dryRun,
    errors,
    suggestions,
    correctedCode
  };
}