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
  if (lower.includes('amazon.')) adapter = marketplaceRegistry.amazon;
  else if (lower.includes('flipkart.')) adapter = marketplaceRegistry.flipkart;
  else if (lower.includes('meesho.')) adapter = marketplaceRegistry.meesho;
  else if (lower.includes('zepto')) adapter = marketplaceRegistry.zepto;
  else if (lower.includes('bigbasket') || lower.includes('bbdaily')) adapter = marketplaceRegistry.bbdaily;
  else if (lower.includes('instamart')) adapter = marketplaceRegistry.instamart;
  else if (lower.includes('myntra.')) adapter = marketplaceRegistry.myntra;
  else if (lower.includes('nykaa.')) adapter = marketplaceRegistry.nykaa;
  // Use adapter-specific extraction if available
  if (adapter && typeof adapter.extractSignature === 'function') {
    const sig = await adapter.extractSignature(url);
    if (sig) return sig;
  }
  // Fallback basic signature
  return {
    sourceSite: 'unknown',
    inputUrl: url,
    canonicalName: 'Unknown Product',
    variant: {},
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
 * Derive variant information such as capacity and colour from a product name.
 */
function parseVariantFromCanonicalName(name: string | undefined): Record<string, string> {
  const variant: Record<string, string> = {};
  if (!name) return variant;
  const capacityMatch = name.match(/\b(\d+\s*(?:GB|TB))\b/i);
  if (capacityMatch) {
    variant.capacity = capacityMatch[1].toUpperCase().replace(/\s+/g, '');
  }
  const colours = ['blue','black','white','green','red','silver','gold','grey','gray','purple','pink','yellow','orange'];
  for (const colour of colours) {
    const re = new RegExp(`\\b${colour}\\b`, 'i');
    if (re.test(name)) {
      variant.color = colour.charAt(0).toUpperCase() + colour.slice(1);
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