// Mock API service for price comparison
// In a real implementation, this would be a backend service

interface ProductSignature {
  sourceSite: string;
  inputUrl: string;
  canonicalName: string;
  model?: string;
  asin?: string;
  gtin?: string;
  variant: Record<string, string>;
}

interface ProductResult {
  marketplace: string;
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
}

interface CompareResponse {
  signature: ProductSignature;
  results: ProductResult[];
  bestBuy?: {
    marketplace: string;
    link: string;
    effectivePrice: number;
    rationale: string[];
  };
  savedToSheet: boolean;
  sheetRowIds?: string[];
}

// Simulated marketplace data for demo
const simulateMarketplaceResults = (inputUrl: string): ProductResult[] => {
  const basePrice = 45000; // Base price for demo
  const variation = () => Math.floor(Math.random() * 5000) - 2500; // ±2500 variation

  return [
    {
      marketplace: 'Amazon',
      productUrl: 'https://amazon.in/dp/example',
      productTitle: 'iPhone 14 128GB Blue',
      variant: '128GB, Blue',
      listedPrice: basePrice + variation(),
      shippingFee: 0,
      effectivePrice: basePrice + variation(),
      currency: 'INR',
      inStock: true,
      offerNotes: ['10% instant discount', 'No cost EMI available'],
      deliveryEta: '2-3 days',
      matchConfidence: 0.95,
      lastCheckedISO: new Date().toISOString(),
    },
    {
      marketplace: 'Flipkart',
      productUrl: 'https://flipkart.com/example',
      productTitle: 'Apple iPhone 14 (Blue, 128 GB)',
      variant: '128GB, Blue',
      listedPrice: basePrice + variation(),
      shippingFee: 0,
      effectivePrice: basePrice + variation(),
      currency: 'INR',
      inStock: true,
      offerNotes: ['Bank offer: ₹2000 off', 'Exchange up to ₹15000'],
      deliveryEta: '3-4 days',
      matchConfidence: 0.92,
      lastCheckedISO: new Date().toISOString(),
    },
    {
      marketplace: 'Croma',
      productUrl: 'https://croma.com/example',
      productTitle: 'Apple iPhone 14 128GB Blue',
      variant: '128GB, Blue',
      listedPrice: basePrice + variation(),
      shippingFee: 100,
      effectivePrice: basePrice + variation() + 100,
      currency: 'INR',
      inStock: true,
      offerNotes: ['Extended warranty available'],
      deliveryEta: '5-7 days',
      matchConfidence: 0.90,
      lastCheckedISO: new Date().toISOString(),
    },
    {
      marketplace: 'Reliance Digital',
      productUrl: 'https://reliancedigital.in/example',
      productTitle: 'Apple iPhone 14 128GB - Blue',
      variant: '128GB, Blue',
      listedPrice: basePrice + variation(),
      shippingFee: 0,
      effectivePrice: basePrice + variation(),
      currency: 'INR',
      inStock: true,
      offerNotes: ['Store pickup available', 'Extended warranty'],
      deliveryEta: '4-6 days',
      matchConfidence: 0.88,
      lastCheckedISO: new Date().toISOString(),
    },
  ];
};

export const mockCompareAPI = async (url: string): Promise<CompareResponse> => {
  // Validate URL format
  try {
    new URL(url);
  } catch {
    throw new Error('Invalid URL format');
  }

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // In a real implementation, this would:
  // 1. Extract product signature from the input URL
  // 2. Search across all marketplaces
  // 3. Compare prices and find best buy
  // 4. Log results to Google Sheets

  const signature: ProductSignature = {
    sourceSite: 'amazon.in',
    inputUrl: url,
    canonicalName: 'iPhone 14 128GB Blue',
    model: 'MPVJ3HN/A',
    asin: 'B08N5WRWNW',
    variant: { color: 'Blue', capacity: '128GB' },
  };

  const results = simulateMarketplaceResults(url);
  
  // Find best buy (lowest effective price)
  const bestResult = results.reduce((best, current) => 
    current.effectivePrice < best.effectivePrice ? current : best
  );

  const bestBuy = {
    marketplace: bestResult.marketplace,
    link: bestResult.productUrl,
    effectivePrice: bestResult.effectivePrice,
    rationale: ['Lowest price', 'In stock'],
  };

  return {
    signature,
    results,
    bestBuy,
    savedToSheet: true,
    sheetRowIds: ['row_' + Date.now()],
  };
};