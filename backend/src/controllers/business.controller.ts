import { Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { findClosestEmissionFactor } from '../utils/fuzzySearch';
import emissionFactors from '../data/GHGEmissionFactors.json';

// Log the API key (first few characters) for debugging
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCMePKfxSCgkDj5xtpHKFXMnlqAFvxFOSs';
console.log('Gemini API Key (first 10 chars):', apiKey.substring(0, 10));

if (!apiKey) {
  console.error('GEMINI_API_KEY is not set in environment variables');
  throw new Error('GEMINI_API_KEY is required');
}

const genAI = new GoogleGenerativeAI(apiKey);

export const classifyBusiness = async (req: Request, res: Response) => {
  try {
    const { businessName } = req.body;
    
    if (!businessName) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Classify the following business into the most appropriate 2017 NAICS industry title. 
    Only respond with the exact NAICS title, nothing else. Business name: "${businessName}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const classification = response.text().trim();

    // Find matching emission factor using fuzzy search
    const emissionFactor = findClosestEmissionFactor(classification, emissionFactors);

    res.json({
      industry: classification,
      emissionFactor: emissionFactor ? {
        industry: emissionFactor["2017 NAICS Title"],
        factor: emissionFactor["Supply Chain Emission Factors with Margins"],
        unit: emissionFactor["Unit"],
        description: `NAICS Code: ${emissionFactor["2017 NAICS Code"]}, GHG: ${emissionFactor["GHG"]}`
      } : null
    });

  } catch (error) {
    console.error('Error classifying business:', error);
    res.status(500).json({ error: 'Failed to classify business' });
  }
}; 