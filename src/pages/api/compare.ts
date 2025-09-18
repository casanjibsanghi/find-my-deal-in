// Enhanced price comparison service using marketplace adapter system
import { compareAcrossMarketplaces, CompareResponse } from '@/lib/marketplaces';

export const mockCompareAPI = async (url: string): Promise<CompareResponse> => {
  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  // Use the new marketplace system
  return await compareAcrossMarketplaces(url);
};