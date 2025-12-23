// AI Integration - calls server-side API route for Gemini

import { Flashcard, QuizQuestion } from '@/types';
import { generateId } from '@/utils/helpers';

// Check if mock data should be used
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

// Call the server-side API route for AI generation
async function callAIRoute(text: string, type: 'flashcards' | 'quiz', count: number): Promise<Record<string, unknown>> {
  const response = await fetch('/api/generate-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, type, count }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'AI generation failed');
  }

  return response.json();
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
    console.log('Using mock flashcards (mock mode enabled)');
    return getMockFlashcards(count);
  }

  try {
    console.log('Calling AI API for flashcards...');
    const result = await callAIRoute(text, 'flashcards', count);
    
    if (result.flashcards && Array.isArray(result.flashcards)) {
      const cardsWithIds = (result.flashcards as Array<{ question: string; answer: string }>).map((card) => ({
        id: generateId(),
        question: card.question,
        answer: card.answer,
      }));
      console.log('Generated', cardsWithIds.length, 'flashcards from AI');
      return cardsWithIds;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating flashcards:', error);
    console.log('Falling back to mock flashcards');
    return getMockFlashcards(count);
  }
}

export async function generateQuiz(
  text: string,
  count: number = 10
): Promise<QuizQuestion[]> {
  // If mock data is enabled, return mock quiz immediately
  if (USE_MOCK_DATA) {
    console.log('Using mock quiz (mock mode enabled)');
    return getMockQuiz(count);
  }

  try {
    console.log('Calling AI API for quiz...');
    const result = await callAIRoute(text, 'quiz', count);
    
    if (result.quiz && Array.isArray(result.quiz)) {
      const questionsWithIds = (result.quiz as Array<{
        question: string;
        options: string[];
        correctAnswer: string;
        explanation?: string;
      }>).map((q) => ({
        id: generateId(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
      }));
      console.log('Generated', questionsWithIds.length, 'quiz questions from AI');
      return questionsWithIds;
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating quiz:', error);
    console.log('Falling back to mock quiz');
    return getMockQuiz(count);
  }
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
