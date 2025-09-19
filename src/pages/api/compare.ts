// Enhanced price comparison service using marketplace adapter system with AI
import { compareAcrossMarketplaces, CompareResponse } from '@/lib/marketplaces';

export const mockCompareAPI = async (url: string): Promise<CompareResponse> => {
  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error('Please enter a valid product URL');
  }

  console.log('Starting AI-powered price comparison for:', url);
  
  // Use the enhanced marketplace system with AI
  try {
    const result = await compareAcrossMarketplaces(url);
    console.log('AI comparison completed:', result);
    return result;
  } catch (error: any) {
    console.error('Price comparison failed:', error);
    throw new Error(error.message || 'Failed to compare prices. Please try with a different product URL.');
  }
};