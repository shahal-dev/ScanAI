import Tesseract from "tesseract.js";

export async function extractTextFromImage(imageData: string): Promise<string> {
  try {
    const result = await Tesseract.recognize(
      imageData,
      'eng',
      { logger: m => console.log(m) }
    );
    
    return result.data.text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to extract text from image');
  }
}
