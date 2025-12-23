'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Navbar } from '@/components/Navbar';
import { Card, Button, LoadingSpinner } from '@/components/ui';
import { 
  Upload, 
  FileText, 
  X, 
  Sparkles, 
  BookOpen, 
  ClipboardList,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatFileSize } from '@/utils/helpers';
import { isValidFileType, extractTextFromFile } from '@/lib/extractText';
import { generateFlashcards, generateQuiz, getMockFlashcards, getMockQuiz } from '@/lib/ai';
import { generateId } from '@/utils/helpers';

export default function UploadPage() {
  const router = useRouter();
  const { user, isLoading, setCurrentFlashcards, setCurrentQuiz, addFlashcardSet, addQuiz, addActivity } = useApp();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [error, setError] = useState('');
  const [count, setCount] = useState(10);
  const [useMockData, setUseMockData] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, isLoading, router]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError('');
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && isValidFileType(droppedFile)) {
      setFile(droppedFile);
    } else {
      setError('Please upload a PDF, DOCX, or TXT file');
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const selectedFile = e.target.files?.[0];
    if (selectedFile && isValidFileType(selectedFile)) {
      setFile(selectedFile);
    } else {
      setError('Please upload a PDF, DOCX, or TXT file');
    }
  };

  const removeFile = () => {
    setFile(null);
    setError('');
  };

  const handleGenerate = async (type: 'flashcards' | 'quiz') => {
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      let text = '';
      
      setProcessingStep('Extracting text from document...');
      
      // Use the actual text extraction function
      text = await extractTextFromFile(file);
      
      if (!text || text.trim().length < 50) {
        throw new Error('Could not extract enough text from the document. Please try a different file.');
      }
      
      console.log('Extracted text length:', text.length);
      console.log('Extracted text preview:', text.substring(0, 200));

      if (useMockData) {
        setProcessingStep(`Generating ${type}...`);
        await new Promise(resolve => setTimeout(resolve, 1500));

        if (type === 'flashcards') {
          const flashcards = getMockFlashcards(count);
          const flashcardSet = {
            id: generateId(),
            title: `Flashcards from ${file.name}`,
            flashcards,
            createdAt: new Date(),
            documentName: file.name,
          };
          addFlashcardSet(flashcardSet);
          setCurrentFlashcards(flashcardSet);
          addActivity({
            type: 'upload',
            title: 'Created Flashcards',
            description: `Generated ${flashcards.length} flashcards from ${file.name}`,
          });
          router.push('/flashcards');
        } else {
          const questions = getMockQuiz(count);
          const quiz = {
            id: generateId(),
            title: `Quiz from ${file.name}`,
            questions,
            createdAt: new Date(),
            documentName: file.name,
          };
          addQuiz(quiz);
          setCurrentQuiz(quiz);
          addActivity({
            type: 'upload',
            title: 'Created Quiz',
            description: `Generated ${questions.length} questions from ${file.name}`,
          });
          router.push('/quiz');
        }
      } else {
        setProcessingStep(`Using AI to generate ${type}...`);
        
        if (type === 'flashcards') {
          const flashcards = await generateFlashcards(text, count);
          
          if (flashcards.length === 0) {
            throw new Error('Failed to generate flashcards. Please try again.');
          }
          
          const flashcardSet = {
            id: generateId(),
            title: `Flashcards from ${file.name}`,
            flashcards,
            createdAt: new Date(),
            documentName: file.name,
          };
          addFlashcardSet(flashcardSet);
          setCurrentFlashcards(flashcardSet);
          addActivity({
            type: 'upload',
            title: 'Created Flashcards',
            description: `Generated ${flashcards.length} flashcards from ${file.name}`,
          });
          router.push('/flashcards');
        } else {
          const questions = await generateQuiz(text, count);
          
          if (questions.length === 0) {
            throw new Error('Failed to generate quiz. Please try again.');
          }
          
          const quiz = {
            id: generateId(),
            title: `Quiz from ${file.name}`,
            questions,
            createdAt: new Date(),
            documentName: file.name,
          };
          addQuiz(quiz);
          setCurrentQuiz(quiz);
          addActivity({
            type: 'upload',
            title: 'Created Quiz',
            description: `Generated ${questions.length} questions from ${file.name}`,
          });
          router.push('/quiz');
        }
      }
    } catch (err) {
      console.error('Error generating content:', err);
      setError(err instanceof Error ? err.message : 'Failed to process document. Please try again.');
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Upload Document</h1>
          <p className="text-white/60">
            Upload a PDF, DOCX, or TXT file to generate flashcards or quizzes
          </p>
        </div>

        {/* Upload Area */}
        <Card className="mb-6">
          {!file ? (
            <div
              className={`upload-zone rounded-xl p-12 text-center transition-all ${
                isDragging ? 'drag-over' : ''
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl gradient-bg mx-auto flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <p className="text-lg font-medium text-white mb-2">
                  Drop your file here or click to browse
                </p>
                <p className="text-white/60 text-sm">
                  Supports PDF, DOCX, and TXT files (max 10MB)
                </p>
              </label>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{file.name}</p>
                  <p className="text-sm text-white/60">{formatFileSize(file.size)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <button
                    onClick={removeFile}
                    className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10"
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Options */}
        {file && !isProcessing && (
          <Card className="mb-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Number of items to generate
                </label>
                <input
                  type="number"
                  min="5"
                  max="20"
                  value={count}
                  onChange={(e) => setCount(Math.min(20, Math.max(5, parseInt(e.target.value) || 10)))}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:border-purple-500"
                />
              </div>
              <div className="flex-1">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useMockData}
                    onChange={(e) => setUseMockData(e.target.checked)}
                    className="w-5 h-5 rounded border-white/30 bg-white/5 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-white/80">
                    Use demo data (faster, no API call)
                  </span>
                </label>
              </div>
            </div>
          </Card>
        )}

        {/* Processing State */}
        {isProcessing && (
          <Card className="mb-6">
            <div className="flex flex-col items-center py-8">
              <LoadingSpinner size="lg" />
              <p className="mt-4 text-white font-medium">{processingStep}</p>
              <p className="text-sm text-white/60 mt-1">This may take a moment...</p>
            </div>
          </Card>
        )}

        {/* Generate Buttons */}
        {file && !isProcessing && (
          <div className="grid sm:grid-cols-2 gap-4">
            <Card hover onClick={() => handleGenerate('flashcards')} className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Generate Flashcards</h3>
                  <p className="text-sm text-white/60">Create interactive study cards</p>
                </div>
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
            </Card>

            <Card hover onClick={() => handleGenerate('quiz')} className="cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <ClipboardList className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white">Generate Quiz</h3>
                  <p className="text-sm text-white/60">Create MCQ questions</p>
                </div>
                <Sparkles className="w-6 h-6 text-blue-400" />
              </div>
            </Card>
          </div>
        )}

        {/* Tips */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4">Tips for best results</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              'Use documents with clear, well-structured content',
              'Longer documents generate more diverse questions',
              'Technical content produces focused Q&A pairs',
              'Review generated content for accuracy',
            ].map((tip, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-purple-400 font-medium">{index + 1}</span>
                </div>
                <p className="text-sm text-white/60">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
