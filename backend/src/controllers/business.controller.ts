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

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to process a single business with retries
const processBusinessWithRetry = async (businessName: string, retries = 3, delayMs = 30000) => {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const prompt = `Classify the following business into the most appropriate 2017 NAICS industry title. 
      Only respond with the exact NAICS title, nothing else. Business name: "${businessName}"`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const classification = response.text().trim();

      const emissionFactor = findClosestEmissionFactor(classification, emissionFactors);

      return {
        businessName,
        industry: classification,
        emissionFactor: emissionFactor ? {
          industry: emissionFactor["2017 NAICS Title"],
          factor: emissionFactor["Supply Chain Emission Factors with Margins"],
          unit: emissionFactor["Unit"],
        } : null
      };
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed for ${businessName}:`, error);
      
      if (error.status === 429 && attempt < retries) {
        const retryDelay = error.errorDetails?.find((d: any) => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo')?.retryDelay || delayMs;
        console.log(`Rate limited. Waiting ${retryDelay} before retry...`);
        await delay(parseInt(retryDelay) * 1000);
        continue;
      }
      
      return {
        businessName,
        industry: "Unknown",
        emissionFactor: null
      };
    }
  }
  
  return {
    businessName,
    industry: "Unknown",
    emissionFactor: null
  };
};

export const classifyBusiness = async (req: Request, res: Response) => {
  try {
    const { businessName } = req.body;
    
    if (!businessName) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    // Initialize the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-exp-03-25" });

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
      } : null
    });

  } catch (error) {
    console.error('Error classifying business:', error);
    res.status(500).json({ error: 'Failed to classify business' });
  }
};

export const classifyBusinessBatch = async (req: Request, res: Response) => {
  try {
    const { businessNames } = req.body;
    
    if (!businessNames || !Array.isArray(businessNames)) {
      return res.status(400).json({ error: 'Business names array is required' });
    }

    // Process in smaller batches with longer delays
    const BATCH_SIZE = 3;
    const BATCH_DELAY = 5000; // 5 seconds between batches
    const results = [];

    for (let i = 0; i < businessNames.length; i += BATCH_SIZE) {
      const batch = businessNames.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(businessNames.length/BATCH_SIZE)}`);
      
      const batchResults = await Promise.all(
        batch.map(businessName => processBusinessWithRetry(businessName))
      );
      
      results.push(...batchResults);
      
      // Add delay between batches if not the last batch
      if (i + BATCH_SIZE < businessNames.length) {
        await delay(BATCH_DELAY);
      }
    }

    res.json(results);
  } catch (error) {
    console.error('Error in batch classification:', error);
    res.status(500).json({ error: 'Failed to classify businesses' });
  }
}; 