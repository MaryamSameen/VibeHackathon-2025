import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let text = '';

    if (fileName.endsWith('.txt')) {
      text = await file.text();
    } else if (fileName.endsWith('.pdf')) {
      // For PDF files, we'll use pdf-parse on the server
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      try {
        // Dynamic import for pdf-parse
        const pdfParse = (await import('pdf-parse')).default;
        const data = await pdfParse(buffer);
        text = data.text;
        
        if (!text || text.trim().length < 10) {
          throw new Error('No text content found in PDF');
        }
      } catch (pdfError) {
        console.error('PDF parsing error:', pdfError);
        return NextResponse.json(
          { error: 'Failed to extract text from PDF. The file may be image-based or corrupted.' },
          { status: 400 }
        );
      }
    } else if (fileName.endsWith('.docx')) {
      // For DOCX files, we'll use mammoth on the server
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      try {
        // Dynamic import for mammoth
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        
        if (!text || text.trim().length < 10) {
          throw new Error('No text content found in DOCX');
        }
      } catch (docxError) {
        console.error('DOCX parsing error:', docxError);
        return NextResponse.json(
          { error: 'Failed to extract text from DOCX. The file may be corrupted.' },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'Unsupported file type' },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: text.trim() });
  } catch (error) {
    console.error('Error extracting text:', error);
    return NextResponse.json(
      { error: 'Failed to extract text from document' },
      { status: 500 }
    );
  }
}
