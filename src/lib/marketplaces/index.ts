import { ProductSignature, OfferResult, CompareResponse, MarketplaceAdapter, MarketplaceRegistry } from './types';
import { AmazonAdapter } from './amazon';
import { FlipkartAdapter } from './flipkart';
import { MeeshoAdapter } from './meesho';
import { ZeptoAdapter } from './zepto';
import { BBDailyAdapter } from './bbdaily';
import { InstamartAdapter } from './instamart';
import { MyntraAdapter } from './myntra';
import { NykaaAdapter } from './nykaa';

// Create marketplace registry mapping to adapter instances
const marketplaceRegistry: MarketplaceRegistry = {
  amazon: new AmazonAdapter(),
  flipkart: new FlipkartAdapter(),
  meesho: new MeeshoAdapter(),
  zepto: new ZeptoAdapter(),
  bbdaily: new BBDailyAdapter(),
  instamart: new InstamartAdapter(),
  myntra: new MyntraAdapter(),
  nykaa: new NykaaAdapter(),
};

// Export types for external use
export type { ProductSignature, OfferResult, CompareResponse } from './types';

/**
 * Extract a basic product signature from a URL by determining the source marketplace.
 * Each marketplace adapter may override this method with its own extraction logic.
 */
export const extractProductSignature = async (url: string): Promise<ProductSignature | null> => {
  const lower = url.toLowerCase();
  let adapter: MarketplaceAdapter | null = null;
  let sourceSite = 'unknown';
  
  if (lower.includes('amazon.')) {
    adapter = marketplaceRegistry.amazon;
    sourceSite = 'amazon';
  } else if (lower.includes('flipkart.')) {
    adapter = marketplaceRegistry.flipkart;
    sourceSite = 'flipkart';
  } else if (lower.includes('meesho.')) {
    adapter = marketplaceRegistry.meesho;
    sourceSite = 'meesho';
  } else if (lower.includes('zepto')) {
    adapter = marketplaceRegistry.zepto;
    sourceSite = 'zepto';
  } else if (lower.includes('bigbasket') || lower.includes('bbdaily')) {
    adapter = marketplaceRegistry.bbdaily;
    sourceSite = 'bbdaily';
  } else if (lower.includes('instamart')) {
    adapter = marketplaceRegistry.instamart;
    sourceSite = 'instamart';
  } else if (lower.includes('myntra.')) {
    adapter = marketplaceRegistry.myntra;
    sourceSite = 'myntra';
  } else if (lower.includes('nykaa.')) {
    adapter = marketplaceRegistry.nykaa;
    sourceSite = 'nykaa';
  }
  
  // Use adapter-specific extraction if available
  if (adapter && typeof adapter.extractSignature === 'function') {
    const sig = await adapter.extractSignature(url);
    if (sig) return sig;
  }
  
  // Enhanced fallback signature extraction
  const canonicalName = deriveCanonicalNameFromUrl(url) || extractProductNameFromUrl(url) || 'Unknown Product';
  const brand = extractBrandFromName(canonicalName);
  const asin = parseAsinFromUrl(url);
  const variant = parseVariantFromCanonicalName(canonicalName);
  
  return {
    sourceSite,
    inputUrl: url,
    canonicalName,
    brand,
    asin,
    variant,
  };
};

/**
 * Derive a human-friendly product name from a URL path. This implementation
 * tries to extract the slug preceding known separators such as /dp/ or /gp/product/
 * on marketplaces like Amazon. If no slug is found, the last path segment is used
 * with hyphens and underscores converted to spaces.
 */
function deriveCanonicalNameFromUrl(url: string): string | undefined {
  try {
    const { pathname } = new URL(url);
    const segments = pathname.split('/').filter(Boolean);
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i].toLowerCase();
      if (['dp', 'product', 'gp', 'p'].includes(seg)) {
        if (i > 0) {
          const slug = segments[i - 1];
          return decodeURIComponent(slug).replace(/[-_]/g, ' ');
        }
      }
    }
    if (segments.length > 0) {
      const slug = segments[segments.length - 1];
      return decodeURIComponent(slug).replace(/[-_]/g, ' ');
    }
  } catch {
    // ignore malformed URLs
  }
  return undefined;
}

/**
 * Attempt to parse an ASIN from a product URL. Amazon product links often
 * include the ASIN after /dp/ or /product/ segments.
 */
function parseAsinFromUrl(url: string): string | undefined {
  try {
    const segments = new URL(url).pathname.split('/').filter(Boolean);
    for (let i = 0; i < segments.length - 1; i++) {
      const seg = segments[i].toLowerCase();
      if (seg === 'dp' || seg === 'product') {
        const candidate = segments[i + 1];
        if (/^[a-z0-9]{8,14}$/i.test(candidate)) {
          return candidate.toUpperCase();
        }
      }
    }
  } catch {
    // ignore
  }
  return undefined;
}

/**
 * Extract a brand name from the product name - typically the first meaningful word
 */
function extractBrandFromName(name: string): string | undefined {
  if (!name) return undefined;
  
  const words = name.split(' ').filter(word => word.length > 2);
  const knownBrands = [
    'apple', 'samsung', 'oneplus', 'xiaomi', 'oppo', 'vivo', 'realme', 'nokia', 'motorola',
    'dell', 'hp', 'lenovo', 'asus', 'acer', 'macbook', 'iphone', 'ipad',
    'nike', 'adidas', 'puma', 'reebok', 'levis', 'zara', 'h&m', 'uniqlo',
    'sony', 'bose', 'jbl', 'boat', 'noise', 'sennheiser',
    'loreal', 'olay', 'nivea', 'lakme', 'maybelline', 'revlon'
  ];
  
  for (const word of words) {
    const lowerWord = word.toLowerCase();
    if (knownBrands.includes(lowerWord)) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
  }
  
  // If no known brand found, return first word as potential brand
  return words[0]?.charAt(0).toUpperCase() + words[0]?.slice(1).toLowerCase();
}

/**
 * Extract product name from URL path segments
 */
function extractProductNameFromUrl(url: string): string | undefined {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // For search URLs, try to extract from query parameters
    if (pathname.includes('/search') || pathname.includes('/s')) {
      const params = new URLSearchParams(urlObj.search);
      const query = params.get('q') || params.get('query') || params.get('k');
      if (query) {
        return decodeURIComponent(query).replace(/[+\-_]/g, ' ').trim();
      }
    }
    
    // Extract from path segments
    const segments = pathname.split('/').filter(Boolean);
    for (const segment of segments) {
      if (segment.length > 10 && segment.includes('-')) {
        return decodeURIComponent(segment).replace(/[-_]/g, ' ').trim();
      }
    }
    
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Derive variant information such as capacity and colour from a product name.
 */
function parseVariantFromCanonicalName(name: string | undefined): Record<string, string> {
  const variant: Record<string, string> = {};
  if (!name) return variant;
  
  // Storage capacity
  const capacityMatch = name.match(/\b(\d+\s*(?:GB|TB|MB))\b/i);
  if (capacityMatch) {
    variant.capacity = capacityMatch[1].toUpperCase().replace(/\s+/g, '');
  }
  
  // RAM
  const ramMatch = name.match(/\b(\d+\s*GB\s*RAM)\b/i);
  if (ramMatch) {
    variant.ram = ramMatch[1].toUpperCase().replace(/\s+/g, '');
  }
  
  // Screen size
  const sizeMatch = name.match(/\b(\d+(?:\.\d+)?\s*(?:inch|in))\b/i);
  if (sizeMatch) {
    variant.size = sizeMatch[1].toLowerCase().replace(/\s+/g, '');
  }
  
  // Colors with more variations
  const colors = [
    'black', 'white', 'silver', 'gold', 'rose gold', 'space gray', 'space grey',
    'blue', 'navy blue', 'sky blue', 'midnight blue', 'pacific blue',
    'red', 'crimson', 'cherry', 'green', 'forest green', 'midnight green',
    'purple', 'violet', 'pink', 'coral', 'yellow', 'orange', 'brown',
    'titanium', 'graphite', 'starlight', 'alpine green', 'sierra blue'
  ];
  
  for (const color of colors) {
    const regex = new RegExp(`\\b${color.replace(/\s+/g, '\\s+')}\\b`, 'i');
    if (regex.test(name)) {
      variant.color = color.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
      break;
    }
  }
  
  // Size for clothing
  const clothingSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'];
  for (const size of clothingSizes) {
    const regex = new RegExp(`\\b${size}\\b`, 'i');
    if (regex.test(name)) {
      variant.size = size.toUpperCase();
      break;
    }
  }
  
  return variant;
}

/**
 * Main price comparison function. Given an input product URL, this function
 * extracts a product signature, enriches it with additional derived data,
 * queries each marketplace adapter for possible offers, and returns the
 * aggregated comparison result.
 */
export const compareAcrossMarketplaces = async (inputUrl: string): Promise<CompareResponse> => {
  const startTime = Date.now();
  // Extract product signature from input URL
  let signature = await extractProductSignature(inputUrl);
  if (!signature) {
    throw new Error('Unable to extract product information from URL');
  }
  // If no canonical name was extracted, derive one from the URL slug
  if (!signature.canonicalName || signature.canonicalName.toLowerCase() === 'unknown product') {
    const derived = deriveCanonicalNameFromUrl(inputUrl);
    signature.canonicalName = derived || signature.canonicalName;
  }
  // If missing ASIN and this looks like an Amazon URL, attempt to parse it
  if (!signature.asin && signature.sourceSite?.includes('amazon')) {
    const asin = parseAsinFromUrl(inputUrl);
    if (asin) signature.asin = asin;
  }
  // Derive basic variant details from canonicalName if none provided
  if (!signature.variant || Object.keys(signature.variant).length === 0) {
    signature.variant = parseVariantFromCanonicalName(signature.canonicalName);
  }
  // Guess a brand from the first word of the canonical name, if brand missing
  if (!signature.brand && signature.canonicalName) {
    const first = signature.canonicalName.split(' ')[0];
    if (first) signature.brand = first;
  }
  const results: OfferResult[] = [];
  const allMarketplaces = Object.values(marketplaceRegistry);
  // Search across all marketplaces in parallel
  const searchPromises = allMarketplaces.map(async (marketplace) => {
    try {
      // Discover URLs for this marketplace
      const urls = await marketplace.discoverUrls(signature);
      // Fetch offers from discovered URLs
      const offerPromises = urls.map((url) => marketplace.fetchOffer(url, signature));
      const offers = await Promise.all(offerPromises);
      // Filter out null results and add to results
      offers.forEach((offer) => {
        if (offer) {
          // Calculate match confidence
          offer.matchConfidence = marketplace.matchConfidence(offer, signature);
          // Only include results with decent confidence
          if (offer.matchConfidence >= 0.6) {
            results.push(offer);
          }
        }
      });
    } catch (error) {
      console.error(`Error searching ${marketplace.displayName}:`, error);
    }
  });
  await Promise.all(searchPromises);
  // Sort results by effective price
  results.sort((a, b) => a.effectivePrice - b.effectivePrice);
  // Find best buy
  let bestBuy: CompareResponse['bestBuy'] = undefined;
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
    savedToSheet: false,
    sheetRowIds: [],
    totalMarketplacesChecked: allMarketplaces.length,
    searchDurationMs: endTime - startTime,
  };
};