import { Request, Response, NextFunction } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../middleware/errorHandler';

// Log the API key (first few characters) for debugging
const apiKey = process.env.GEMINI_API_KEY || '';
console.log('Gemini API Key (first 10 chars):', apiKey.substring(0, 10));

if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const classifyBusiness = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name } = req.body;

    if (!name) {
      throw new AppError('Business name is required', 400);
    }

    console.log('Attempting to classify business:', name);
    
    try {
      // Use the correct model name according to the latest Gemini API
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      console.log('Successfully initialized Gemini model');

      const prompt = `Given the business name "${name}", classify it into one of the 1,017 NAICS (North American Industry Classification System) 2017 industry titles. 
      
Please respond with ONLY the exact NAICS title that best matches this business. Do not include any explanation, just the title.
      
For example:
- For "McDonald's" you might respond with "Restaurants and Other Eating Places"
- For "Netflix" you might respond with "Motion Picture and Video Distribution"
- For "Walmart" you might respond with "Supermarkets and Other Grocery (except Convenience) Stores"

If you're unsure, choose the closest match from the NAICS 2017 classification system.`;
      
      console.log('Sending prompt to Gemini API');

      const result = await model.generateContent(prompt);
      console.log('Received response from Gemini API');
      
      const response = await result.response;
      const industry = response.text().trim();
      
      console.log('Classified business as:', industry);
      res.json({ industry });
    } catch (apiError: any) {
      console.error('Gemini API Error:', {
        error: apiError,
        message: apiError.message,
        status: apiError.status,
        details: apiError.errorDetails
      });
      throw new AppError(`Error with Gemini API: ${apiError.message}`, 500);
    }
  } catch (error) {
    console.error('Error in classifyBusiness:', error);
    next(error);
  }
}; 