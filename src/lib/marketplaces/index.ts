import { MarketplaceRegistry, MarketplaceAdapter, ProductSignature, OfferResult, CompareResponse } from './types';
import { AmazonAdapter } from './amazon';
import { FlipkartAdapter } from './flipkart';
import { MeeshoAdapter } from './meesho';
import { ZeptoAdapter } from './zepto';
import { BBDailyAdapter } from './bbdaily';
import { InstamartAdapter } from './instamart';
import { MyntraAdapter } from './myntra';
import { NykaaAdapter } from './nykaa';

// Export types for external use
export type { MarketplaceAdapter, ProductSignature, OfferResult, CompareResponse } from './types';

// Create marketplace registry
export const marketplaces: MarketplaceRegistry = {
  amazon: new AmazonAdapter(),
  flipkart: new FlipkartAdapter(),
  meesho: new MeeshoAdapter(),
  zepto: new ZeptoAdapter(),
  bbdaily: new BBDailyAdapter(),
  instamart: new InstamartAdapter(),
  myntra: new MyntraAdapter(),
  nykaa: new NykaaAdapter(),
};

// Get all marketplace adapters
export const getAllMarketplaces = (): MarketplaceAdapter[] => {
  return Object.values(marketplaces);
};

// Get marketplace by slug
export const getMarketplace = (slug: string): MarketplaceAdapter | null => {
  return marketplaces[slug] || null;
};

// Extract product signature from any supported marketplace URL
export const extractProductSignature = async (url: string): Promise<ProductSignature | null> => {
  // Try to determine source marketplace from URL
  const urlLower = url.toLowerCase();
  
  let sourceMarketplace: MarketplaceAdapter | null = null;
  
  if (urlLower.includes('amazon.in')) sourceMarketplace = marketplaces.amazon;
  else if (urlLower.includes('flipkart.com')) sourceMarketplace = marketplaces.flipkart;
  else if (urlLower.includes('meesho.com')) sourceMarketplace = marketplaces.meesho;
  else if (urlLower.includes('zeptonow.com')) sourceMarketplace = marketplaces.zepto;
  else if (urlLower.includes('bigbasket.com')) sourceMarketplace = marketplaces.bbdaily;
  else if (urlLower.includes('swiggy.com/instamart')) sourceMarketplace = marketplaces.instamart;
  else if (urlLower.includes('myntra.com')) sourceMarketplace = marketplaces.myntra;
  else if (urlLower.includes('nykaa.com')) sourceMarketplace = marketplaces.nykaa;
  
  if (sourceMarketplace && sourceMarketplace.extractSignature) {
    return await sourceMarketplace.extractSignature(url);
  }
  
  // Fallback: create a basic signature
  return {
    sourceSite: 'unknown',
    inputUrl: url,
    canonicalName: 'Unknown Product', // Would extract from page title in real implementation
    variant: {},
  };
};

// Main price comparison function
export const compareAcrossMarketplaces = async (inputUrl: string): Promise<CompareResponse> => {
  const startTime = Date.now();
  
  // Extract product signature from input URL
  let signature = await extractProductSignature(inputUrl);
  
  if (!signature) {
    throw new Error('Unable to extract product information from URL');
  }
  
  // Enhanced signature for demo purposes
  signature = {
    ...signature,
    canonicalName: 'iPhone 14 128GB Blue', // Mock for demo
    model: 'MPVJ3HN/A',
    asin: 'B08N5WRWNW',
    brand: 'Apple',
    variant: { color: 'Blue', capacity: '128GB' },
  };
  
  const results: OfferResult[] = [];
  const allMarketplaces = getAllMarketplaces();
  
  // Search across all marketplaces in parallel
  const searchPromises = allMarketplaces.map(async (marketplace) => {
    try {
      // Discover URLs for this marketplace
      const urls = await marketplace.discoverUrls(signature);
      
      // Fetch offers from discovered URLs
      const offerPromises = urls.map(url => marketplace.fetchOffer(url, signature));
      const offers = await Promise.all(offerPromises);
      
      // Filter out null results and add to results
      offers.forEach(offer => {
        if (offer) {
          // Recalculate match confidence
          offer.matchConfidence = marketplace.matchConfidence(offer, signature);
          
          // Only include results with decent confidence
          if (offer.matchConfidence >= 0.6) {
            results.push(offer);
          }
        }
      });
    } catch (error) {
      console.error(`Error searching ${marketplace.displayName}:`, error);
      // Continue with other marketplaces
    }
  });
  
  await Promise.all(searchPromises);
  
  // Sort results by effective price
  results.sort((a, b) => a.effectivePrice - b.effectivePrice);
  
  // Find best buy
  let bestBuy = undefined;
  if (results.length > 0) {
    const best = results[0];
    bestBuy = {
      marketplace: best.marketplace,
      link: best.productUrl,
      effectivePrice: best.effectivePrice,
      rationale: [
        'Lowest price',
        best.inStock ? 'In stock' : 'Limited stock',
        `${Math.round(best.matchConfidence * 100)}% match confidence`,
      ].filter(Boolean),
    };
  }
  
  const endTime = Date.now();
  
  return {
    signature,
    results,
    bestBuy,
    savedToSheet: true, // Mock for demo
    sheetRowIds: [`row_${Date.now()}`],
    totalMarketplacesChecked: allMarketplaces.length,
    searchDurationMs: endTime - startTime,
  };
};

// Get marketplace display info for UI
export const getMarketplaceDisplayInfo = () => {
  return getAllMarketplaces().map(mp => ({
    slug: mp.site,
    displayName: mp.displayName,
    color: mp.color,
    baseUrl: mp.baseUrl,
  }));
};