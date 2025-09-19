export interface ProductSignature {
  sourceSite: string;
  inputUrl: string;
  canonicalName: string;
  model?: string;
  asin?: string;
  gtin?: string;
  mpn?: string;
  brand?: string;
  category?: string;
  originalPrice?: number;
  currency?: string;
  variant: {
    color?: string;
    capacity?: string;
    size?: string;
    year?: string;
    ram?: string;
    [key: string]: string | undefined;
  };
}

export interface OfferResult {
  marketplace: string;
  marketplaceSlug: string;
  productUrl: string;
  productTitle: string;
  variant?: string;
  listedPrice: number;
  shippingFee: number;
  effectivePrice: number;
  currency: 'INR';
  inStock: boolean;
  offerNotes: string[];
  deliveryEta?: string;
  matchConfidence: number;
  lastCheckedISO: string;
  categories?: string[];
}

export interface MarketplaceAdapter {
  site: string;
  displayName: string;
  baseUrl: string;
  logo?: string;
  color: string;
  
  // Discover product URLs for this marketplace
  discoverUrls(signature: ProductSignature): Promise<string[]>;
  
  // Fetch offer from a specific URL
  fetchOffer(url: string, signature: ProductSignature): Promise<OfferResult | null>;
  
  // Calculate match confidence between scraped data and signature
  matchConfidence(offerData: OfferResult, signature: ProductSignature): number;
  
  // Extract product signature from this marketplace's URL
  extractSignature?(url: string): Promise<ProductSignature | null>;
}

export interface MarketplaceRegistry {
  [key: string]: MarketplaceAdapter;
}

export interface CompareResponse {
  signature: ProductSignature;
  results: OfferResult[];
  bestBuy?: {
    marketplace: string;
    link: string;
    effectivePrice: number;
    rationale: string[];
  };
  savedToSheet: boolean;
  sheetRowIds?: string[];
  totalMarketplacesChecked: number;
  searchDurationMs: number;
}