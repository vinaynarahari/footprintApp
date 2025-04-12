import Fuse from 'fuse.js';

interface EmissionFactor {
  "2017 NAICS Code": number;
  "2017 NAICS Title": string;
  "GHG": string;
  "Unit": string;
  "Supply Chain Emission Factors without Margins": number;
  "Margins of Supply Chain Emission Factors": number;
  "Supply Chain Emission Factors with Margins": number;
  "Reference USEEIO Code": string;
}

export function findClosestEmissionFactor(
  classification: string,
  emissionFactors: EmissionFactor[]
): EmissionFactor | null {
  // Configure Fuse.js for fuzzy searching by title
  const fuseByTitle = new Fuse(emissionFactors, {
    keys: ['2017 NAICS Title'],
    threshold: 0.6, // Higher threshold means more lenient matching
    includeScore: true
  });

  // First try matching by title
  const titleResults = fuseByTitle.search(classification);

  // If we have results from title search, return the best match
  if (titleResults.length > 0) {
    return titleResults[0].item;
  }

  // If no match by title, try matching by NAICS code if the input looks like a code
  const naicsCodeMatch = classification.match(/^\d{6}$/);
  if (naicsCodeMatch) {
    const exactMatch = emissionFactors.find(ef => ef['2017 NAICS Code'].toString() === classification);
    if (exactMatch) {
      return exactMatch;
    }
  }

  // If still no match, try a more lenient search with a higher threshold
  const fuseMoreLenient = new Fuse(emissionFactors, {
    keys: ['2017 NAICS Title'],
    threshold: 0.8, // Even more lenient matching as a last resort
    includeScore: true
  });

  const lenientResults = fuseMoreLenient.search(classification);
  if (lenientResults.length > 0) {
    return lenientResults[0].item;
  }

  return null;
} 