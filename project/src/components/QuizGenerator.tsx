import React from 'react';
import { BookOpen, Upload, Download, Loader2, Brain, CheckCircle, XCircle } from 'lucide-react';
import { generateQuiz } from '../utils/nlpUtils';
import { FileUpload } from './FileUpload';

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface QuizState {
  text: string;
  questions: QuizQuestion[];
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
  userAnswers: { [key: number]: string };
  showResults: boolean;
}

interface QuizGeneratorProps {
  state: QuizState;
  updateState: (updates: Partial<QuizState>) => void;
}

export function QuizGenerator({ state, updateState }: QuizGeneratorProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleGenerateQuiz = async () => {
    if (!state.text.trim()) return;
    
    setIsLoading(true);
    updateState({ showResults: false, userAnswers: {} });
    
    try {
      const result = await generateQuiz(state.text, { 
        numQuestions: state.numQuestions, 
        difficulty: state.difficulty 
      });
      updateState({ questions: result });
    } catch (error) {
      console.error('Quiz generation failed:', error);
      updateState({ questions: [] });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (questionIndex: number, answer: string) => {
    updateState({
      userAnswers: {
        ...state.userAnswers,
        [questionIndex]: answer
      }
    });
  };

  const handleSubmitQuiz = () => {
    updateState({ showResults: true });
  };

  const calculateScore = () => {
    let correct = 0;
    state.questions.forEach((question, index) => {
      if (state.userAnswers[index] === question.answer) {
        correct++;
      }
    });
    return { correct, total: state.questions.length, percentage: (correct / state.questions.length) * 100 };
  };

  const handleFileContent = (content: string) => {
    updateState({ text: content });
  };

  const downloadQuiz = () => {
    const quizText = state.questions.map((q, i) => 
      `Q${i + 1}: ${q.question}\n` +
      q.options.map((opt, idx) => `   ${String.fromCharCode(65 + idx)}. ${opt}`).join('\n') +
      '\n\n'
    ).join('');
    
    const blob = new Blob([quizText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quiz.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAnswers = () => {
    const answersText = state.questions.map((q, i) => {
      const correctIndex = q.options.indexOf(q.answer);
      return `Q${i + 1}: ${String.fromCharCode(65 + correctIndex)}. ${q.answer}`;
    }).join('\n');
    
    const blob = new Blob([answersText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'answers.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const score = state.showResults ? calculateScore() : null;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Quiz Generator
          </h2>
        </div>
        <p className="text-gray-600 text-lg">Create intelligent quizzes from any text using advanced NLP</p>
      </div>

      {/* Input Section */}
      {!state.questions.length && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                Input Text
              </h3>
              
              <div className="space-y-4">
                <FileUpload onFileContent={handleFileContent} />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter text for quiz generation
                  </label>
                  <textarea
                    value={state.text}
                    onChange={(e) => updateState({ text: e.target.value })}
                    placeholder="Paste educational content here..."
                    className="w-full h-48 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 resize-none"
                  />
                  <div className="mt-2 text-sm text-gray-500">
                    {state.text.length} characters, ~{Math.ceil(state.text.split(' ').length)} words
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-pink-600" />
                Quiz Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions: {state.numQuestions}
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={state.numQuestions}
                    onChange={(e) => updateState({ numQuestions: Number(e.target.value) })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['easy', 'medium', 'hard'] as const).map((level) => (
                      <button
                        key={level}
                        onClick={() => updateState({ difficulty: level })}
                        className={`p-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize ${
                          state.difficulty === level
                            ? 'bg-purple-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={!state.text.trim() || isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <Brain className="w-5 h-5" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Display */}
      {state.questions.length > 0 && (
        <div className="space-y-6">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Generated Quiz</h3>
                <p className="text-gray-600">{state.questions.length} questions • {state.difficulty} difficulty</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={downloadQuiz}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Quiz
                </button>
                <button
                  onClick={downloadAnswers}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200"
                >
                  <Download className="w-4 h-4" />
                  Answers
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {state.questions.map((question, questionIndex) => (
                <div key={questionIndex} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {questionIndex + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">{question.question}</h4>
                      
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const isSelected = state.userAnswers[questionIndex] === option;
                          const isCorrect = option === question.answer;
                          const shouldShowCorrect = state.showResults && isCorrect;
                          const shouldShowIncorrect = state.showResults && isSelected && !isCorrect;
                          
                          return (
                            <button
                              key={optionIndex}
                              onClick={() => handleAnswerSelect(questionIndex, option)}
                              disabled={state.showResults}
                              className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center gap-3 ${
                                shouldShowCorrect
                                  ? 'bg-green-100 border-2 border-green-400 text-green-800'
                                  : shouldShowIncorrect
                                  ? 'bg-red-100 border-2 border-red-400 text-red-800'
                                  : isSelected
                                  ? 'bg-purple-100 border-2 border-purple-400 text-purple-800'
                                  : 'bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              <span className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium">
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span className="flex-1">{option}</span>
                              {state.showResults && isCorrect && <CheckCircle className="w-5 h-5 text-green-600" />}
                              {state.showResults && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-red-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {!state.showResults && Object.keys(state.userAnswers).length === state.questions.length && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleSubmitQuiz}
                  className="bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-8 rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200"
                >
                  Submit Quiz
                </button>
              </div>
            )}

            {state.showResults && score && (
              <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white text-center">
                <h3 className="text-2xl font-bold mb-2">Quiz Results</h3>
                <p className="text-xl">
                  You scored {score.correct} out of {score.total} ({score.percentage.toFixed(1)}%)
                </p>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      updateState({
                        showResults: false,
                        userAnswers: {},
                        questions: []
                      });
                    }}
                    className="bg-white text-purple-600 py-2 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-200"
                  >
                    Generate New Quiz
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}