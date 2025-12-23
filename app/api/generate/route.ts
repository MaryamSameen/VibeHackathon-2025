import { NextRequest, NextResponse } from 'next/server';

const BYTEZ_API_KEY = process.env.BYTEZ_API_KEY || '1617a3a2665138ee6dcf2ec427f7d25f';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, type, count, text } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    const systemPrompt = type === 'flashcards'
      ? 'You are a helpful educational assistant that generates flashcards. Always respond with valid JSON only.'
      : 'You are a helpful educational assistant that generates quiz questions. Always respond with valid JSON only.';

    const userPrompt = type === 'flashcards'
      ? `Based on the following text, generate exactly ${count} flashcards for studying.

TEXT:
${text}

Generate flashcards in the following JSON format ONLY (no markdown, no explanation):
{
  "flashcards": [
    { "question": "Question text here?", "answer": "Clear, concise answer here" }
  ]
}`
      : `Based on the following text, generate exactly ${count} multiple choice questions for a quiz.

TEXT:
${text}

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
}`;

    const apiMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ];

    const response = await fetch('https://api.bytez.com/models/openai/gpt-4o/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BYTEZ_API_KEY}`,
      },
      body: JSON.stringify({
        messages: apiMessages,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bytez API error:', errorText);
      return NextResponse.json(
        { error: 'AI generation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content = data.output?.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json(
        { error: 'No content in AI response' },
        { status: 500 }
      );
    }

    // Parse the JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
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
