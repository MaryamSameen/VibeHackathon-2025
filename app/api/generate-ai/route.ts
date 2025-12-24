import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Key
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Call Gemini API
async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured');
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  if (!text) {
    throw new Error('Empty response from Gemini');
  }
  
  return text;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, type, count } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const cleanText = text.slice(0, 15000); // Token limit safeguard for Gemini
    console.log('Generating', type, 'with text length:', cleanText.length);

    let prompt = '';

    if (type === 'flashcards') {
      prompt = `You are an expert educator. Based on the following text, generate exactly ${count} flashcards for studying.

TEXT:
${cleanText}

Generate flashcards in the following JSON format ONLY (no markdown, no explanation, no code blocks):
{
  "flashcards": [
    { "question": "Question text here?", "answer": "Clear, concise answer here" }
  ]
}

Requirements:
- Questions should test key concepts
- Answers should be clear and educational
- Cover different topics from the text
- Output ONLY valid JSON, nothing else`;
    } else {
      prompt = `You are an expert educator. Based on the following text, generate exactly ${count} multiple choice questions for a quiz.

TEXT:
${cleanText}

Generate quiz questions in the following JSON format ONLY (no markdown, no explanation, no code blocks):
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
- Output ONLY valid JSON, nothing else`;
    }

    console.log('Sending request to Gemini...');
    
    const textResponse = await callGemini(prompt);

    console.log('Gemini response received');

    // Clean response - remove markdown code blocks if present
    const cleanedResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

    // Parse JSON
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', cleanedResponse);
      return NextResponse.json(
        { error: 'AI produced invalid response' },
        { status: 500 }
      );
    }

    try {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, cleanedResponse);
      return NextResponse.json(
        { error: 'AI produced invalid JSON' },
        { status: 500 }
      );
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error:', errorMessage);
    return NextResponse.json(
      { error: errorMessage || 'Failed to generate content' },
      { status: 500 }
    );
  }
}
