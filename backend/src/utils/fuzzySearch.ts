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
  // Configure Fuse.js for fuzzy searching
  const fuse = new Fuse(emissionFactors, {
    keys: ['2017 NAICS Title'],
    threshold: 0.4, // Lower threshold means more strict matching
    includeScore: true
  });

  // Perform the search
  const searchResults = fuse.search(classification);

  // If we have results, return the best match
  if (searchResults.length > 0) {
    return searchResults[0].item;
  }

  return null;
} 