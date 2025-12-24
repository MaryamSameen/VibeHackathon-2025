import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API Key
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, count, text } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const prompt = type === 'flashcards'
      ? `You are a helpful educational assistant. Based on the following text, generate exactly ${count} flashcards for studying.

TEXT:
${text}

Generate flashcards in the following JSON format ONLY (no markdown, no explanation, no code blocks):
{
  "flashcards": [
    { "question": "Question text here?", "answer": "Clear, concise answer here" }
  ]
}`
      : `You are a helpful educational assistant. Based on the following text, generate exactly ${count} multiple choice questions for a quiz.

TEXT:
${text}

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
}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      return NextResponse.json(
        { error: 'No content in AI response' },
        { status: 500 }
      );
    }

    // Parse the JSON from the response
    const cleanedContent = content.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Invalid JSON in AI response' },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Error in AI generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}
