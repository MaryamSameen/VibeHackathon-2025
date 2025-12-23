// Text extraction utilities for PDF, DOCX, and TXT files

export async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await extractFromTxt(file);
  } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await extractFromPdf(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await extractFromDocx(file);
  }
  
  throw new Error('Unsupported file type. Please upload a PDF, DOCX, or TXT file.');
}

async function extractFromTxt(file: File): Promise<string> {
  return await file.text();
}

async function extractFromPdf(file: File): Promise<string> {
  // For client-side, we'll use the API route
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/extract-text', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to extract text from PDF');
  }
  
  const data = await response.json();
  return data.text;
}

async function extractFromDocx(file: File): Promise<string> {
  // For client-side, we'll use the API route
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/extract-text', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to extract text from DOCX');
  }
  
  const data = await response.json();
  return data.text;
}

export function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n+/g, '\n')
    .trim();
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
}

export function isValidFileType(file: File): boolean {
  const validTypes = [
    'text/plain',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  const validExtensions = ['txt', 'pdf', 'docx'];
  const extension = getFileExtension(file.name).toLowerCase();
  
  return validTypes.includes(file.type) || validExtensions.includes(extension);
}
