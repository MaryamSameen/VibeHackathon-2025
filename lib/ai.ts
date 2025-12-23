// AI Integration using Google Generative AI SDK with Gemini

import { GoogleGenerativeAI } from '@google/generative-ai';
import { Flashcard, QuizQuestion } from '@/types';
import { chunkText, generateId } from '@/utils/helpers';

// Get API keys from environment variable
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyBHKzU0pZ0BtKTvQSP4geU0y81yQBZ18VY';

// Check if mock data should be used (only if no API key is available)
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || !GEMINI_API_KEY;

// Initialize Gemini
const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

async function callGeminiSDK(prompt: string): Promise<string> {
  if (!genAI) {
    throw new Error('NO_GEMINI_API_KEY');
  }

  try {
    // Use gemini-1.5-flash which is more stable
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('Sending request to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('No content in Gemini response');
    }
    
    console.log('Gemini response received');
    return text;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Gemini SDK error:', errorMessage);
    throw error;
  }
}

// Unified AI call
async function callAI(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('No API key available');
  }
  
  return await callGeminiSDK(prompt);
}

// Check if we should use mock data
export function shouldUseMockData(): boolean {
  return USE_MOCK_DATA;
}

export async function generateFlashcards(
  text: string,
  count: number = 10
): Promise<Flashcard[]> {
  // If mock data is enabled, return mock flashcards immediately
  if (USE_MOCK_DATA) {
    console.log('Using mock flashcards (API key not configured)');
    return getMockFlashcards(count);
  }

  const chunks = chunkText(text, 3000);
  const allFlashcards: Flashcard[] = [];
  const cardsPerChunk = Math.ceil(count / chunks.length);

  for (const chunk of chunks) {
    if (allFlashcards.length >= count) break;

    const prompt = `You are an expert educator. Based on the following text, generate exactly ${cardsPerChunk} flashcards for studying.

TEXT:
${chunk}

Generate flashcards in the following JSON format ONLY (no markdown, no explanation):
{
  "flashcards": [
    { "question": "Question text here?", "answer": "Clear, concise answer here" }
  ]
}

Requirements:
- Questions should test key concepts
- Answers should be clear and educational
- Cover different topics from the text
- Make questions progressively more challenging`;

    try {
      const fullPrompt = `You are a helpful educational assistant that generates flashcards. Always respond with valid JSON only.

${prompt}`;
      const response = await callAI(fullPrompt);

      // Clean response - remove markdown code blocks
      let cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.flashcards && Array.isArray(parsed.flashcards)) {
          const cardsWithIds = parsed.flashcards.map((card: { question: string; answer: string }) => ({
            id: generateId(),
            question: card.question,
            answer: card.answer,
          }));
          allFlashcards.push(...cardsWithIds);
        }
      }
    } catch (error) {
      console.error('Error generating flashcards for chunk:', error);
      // Fallback to mock data on API error
      console.log('Falling back to mock flashcards');
      return getMockFlashcards(count);
    }
  }

  return allFlashcards.length > 0 ? allFlashcards.slice(0, count) : getMockFlashcards(count);
}

export async function generateQuiz(
  text: string,
  count: number = 10
): Promise<QuizQuestion[]> {
  // If mock data is enabled, return mock quiz immediately
  if (USE_MOCK_DATA) {
    console.log('Using mock quiz (API key not configured)');
    return getMockQuiz(count);
  }

  const chunks = chunkText(text, 3000);
  const allQuestions: QuizQuestion[] = [];
  const questionsPerChunk = Math.ceil(count / chunks.length);

  for (const chunk of chunks) {
    if (allQuestions.length >= count) break;

    const prompt = `You are an expert educator. Based on the following text, generate exactly ${questionsPerChunk} multiple choice questions for a quiz.

TEXT:
${chunk}

Generate quiz questions in the following JSON format ONLY (no markdown, no explanation):
{
  "quiz": [
    {
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option B",
      "explanation": "Brief explanation why this is correct"
    }
  ]
}

Requirements:
- Each question must have exactly 4 options
- Only ONE option should be correct
- The correctAnswer must match one of the options exactly
- Questions should test understanding, not just memorization
- Include helpful explanations
- Make questions progressively more challenging`;

    try {
      const fullPrompt = `You are a helpful educational assistant that generates quiz questions. Always respond with valid JSON only.

${prompt}`;
      const response = await callAI(fullPrompt);

      // Clean response - remove markdown code blocks
      let cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.quiz && Array.isArray(parsed.quiz)) {
          const questionsWithIds = parsed.quiz.map((q: { 
            question: string; 
            options: string[]; 
            correctAnswer: string; 
            explanation?: string 
          }) => ({
            id: generateId(),
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
          }));
          allQuestions.push(...questionsWithIds);
        }
      }
    } catch (error) {
      console.error('Error generating quiz for chunk:', error);
      // Fallback to mock data on API error
      console.log('Falling back to mock quiz');
      return getMockQuiz(count);
    }
  }

  return allQuestions.length > 0 ? allQuestions.slice(0, count) : getMockQuiz(count);
}

// Fallback mock data for demo/testing
export function getMockFlashcards(count: number = 10): Flashcard[] {
  const mockCards: Flashcard[] = [
    { id: '1', question: 'What is machine learning?', answer: 'A subset of AI that enables systems to learn from data and improve from experience without being explicitly programmed.' },
    { id: '2', question: 'What is the difference between supervised and unsupervised learning?', answer: 'Supervised learning uses labeled data to train models, while unsupervised learning finds patterns in unlabeled data.' },
    { id: '3', question: 'What is a neural network?', answer: 'A computing system inspired by biological neural networks, consisting of interconnected nodes that process information.' },
    { id: '4', question: 'What is deep learning?', answer: 'A subset of machine learning that uses multi-layered neural networks to learn complex patterns from large amounts of data.' },
    { id: '5', question: 'What is overfitting?', answer: 'When a model learns the training data too well, including noise, resulting in poor performance on new, unseen data.' },
    { id: '6', question: 'What is a training dataset?', answer: 'A collection of labeled examples used to teach a machine learning model to make predictions.' },
    { id: '7', question: 'What is gradient descent?', answer: 'An optimization algorithm used to minimize the loss function by iteratively adjusting model parameters.' },
    { id: '8', question: 'What is a loss function?', answer: 'A function that measures how well a model predictions match the actual values; the goal is to minimize this.' },
    { id: '9', question: 'What is cross-validation?', answer: 'A technique to evaluate model performance by dividing data into subsets for training and testing multiple times.' },
    { id: '10', question: 'What is feature engineering?', answer: 'The process of selecting, transforming, and creating input features to improve model performance.' },
  ];
  return mockCards.slice(0, count);
}

export function getMockQuiz(count: number = 10): QuizQuestion[] {
  const mockQuestions: QuizQuestion[] = [
    {
      id: '1',
      question: 'Which of the following best describes machine learning?',
      options: [
        'A programming language for AI',
        'A subset of AI that enables systems to learn from data',
        'A database management system',
        'A type of computer hardware'
      ],
      correctAnswer: 'A subset of AI that enables systems to learn from data',
      explanation: 'Machine learning is a branch of artificial intelligence that focuses on building systems that learn from data.'
    },
    {
      id: '2',
      question: 'What type of learning uses labeled data?',
      options: [
        'Unsupervised learning',
        'Reinforcement learning',
        'Supervised learning',
        'Transfer learning'
      ],
      correctAnswer: 'Supervised learning',
      explanation: 'Supervised learning algorithms learn from labeled training data to make predictions on new data.'
    },
    {
      id: '3',
      question: 'What is the purpose of a validation dataset?',
      options: [
        'To train the model',
        'To tune hyperparameters and prevent overfitting',
        'To store the final model',
        'To visualize the data'
      ],
      correctAnswer: 'To tune hyperparameters and prevent overfitting',
      explanation: 'Validation data helps optimize model parameters without using the test set.'
    },
    {
      id: '4',
      question: 'Which algorithm is commonly used for classification tasks?',
      options: [
        'Linear Regression',
        'K-Means Clustering',
        'Random Forest',
        'Principal Component Analysis'
      ],
      correctAnswer: 'Random Forest',
      explanation: 'Random Forest is an ensemble method commonly used for classification problems.'
    },
    {
      id: '5',
      question: 'What does CNN stand for in deep learning?',
      options: [
        'Computer Neural Network',
        'Convolutional Neural Network',
        'Connected Node Network',
        'Centralized Neuron Network'
      ],
      correctAnswer: 'Convolutional Neural Network',
      explanation: 'CNNs are specialized neural networks designed for processing structured grid data like images.'
    },
    {
      id: '6',
      question: 'What is the main purpose of dropout in neural networks?',
      options: [
        'To speed up training',
        'To reduce overfitting',
        'To increase model complexity',
        'To improve accuracy on training data'
      ],
      correctAnswer: 'To reduce overfitting',
      explanation: 'Dropout randomly disables neurons during training to prevent the model from becoming too dependent on specific neurons.'
    },
    {
      id: '7',
      question: 'Which metric is most appropriate for imbalanced classification?',
      options: [
        'Accuracy',
        'F1 Score',
        'Training Loss',
        'Learning Rate'
      ],
      correctAnswer: 'F1 Score',
      explanation: 'F1 Score balances precision and recall, making it better suited for imbalanced datasets.'
    },
    {
      id: '8',
      question: 'What is transfer learning?',
      options: [
        'Moving data between databases',
        'Using a pre-trained model for a new task',
        'Transferring files over a network',
        'Converting data formats'
      ],
      correctAnswer: 'Using a pre-trained model for a new task',
      explanation: 'Transfer learning leverages knowledge from one domain to improve learning in another domain.'
    },
    {
      id: '9',
      question: 'What is the vanishing gradient problem?',
      options: [
        'Gradients become too large during training',
        'Gradients become too small during backpropagation',
        'The model becomes invisible',
        'Loss function disappears'
      ],
      correctAnswer: 'Gradients become too small during backpropagation',
      explanation: 'In deep networks, gradients can become extremely small, making it difficult to update early layers.'
    },
    {
      id: '10',
      question: 'Which activation function is most commonly used in hidden layers?',
      options: [
        'Sigmoid',
        'Softmax',
        'ReLU',
        'Linear'
      ],
      correctAnswer: 'ReLU',
      explanation: 'ReLU (Rectified Linear Unit) is preferred because it helps mitigate the vanishing gradient problem.'
    },
  ];
  return mockQuestions.slice(0, count);
}
