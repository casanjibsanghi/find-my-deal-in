import { MarketplaceAdapter, ProductSignature, OfferResult } from './types';

export class AmazonAdapter implements MarketplaceAdapter {
  site = 'amazon';
  displayName = 'Amazon';
  baseUrl = 'https://www.amazon.in';
  color = '#FF9900';

  async discoverUrls(signature: ProductSignature): Promise<string[]> {
    const urls: string[] = [];
    
    // Direct ASIN URL if available
    if (signature.asin) {
      urls.push(`${this.baseUrl}/dp/${signature.asin}`);
    }
    
    // Search-based discovery would go here in real implementation
    // For now, return mock URLs
    if (signature.canonicalName) {
      urls.push(`${this.baseUrl}/s?k=${encodeURIComponent(signature.canonicalName)}`);
    }
    
    return urls.slice(0, 3); // Limit to top 3 results
  }

  async fetchOffer(url: string, signature: ProductSignature): Promise<OfferResult | null> {
    // In real implementation, this would scrape the actual Amazon page
    // For demo, return simulated data
    
    const basePrice = this.generateRealisticPrice(signature);
    const variation = Math.floor(Math.random() * 2000) - 1000; // ±1000 variation
    
    return {
      marketplace: this.displayName,
      marketplaceSlug: this.site,
      productUrl: url,
      productTitle: `${signature.canonicalName} - Amazon`,
      variant: this.formatVariant(signature.variant),
      listedPrice: basePrice + variation,
      shippingFee: Math.random() > 0.7 ? 99 : 0, // 30% chance of shipping fee
      effectivePrice: basePrice + variation + (Math.random() > 0.7 ? 99 : 0),
      currency: 'INR',
      inStock: Math.random() > 0.1, // 90% chance in stock
      offerNotes: this.generateOfferNotes(),
      deliveryEta: this.generateETA(),
      matchConfidence: signature.asin ? 0.95 : 0.85,
      lastCheckedISO: new Date().toISOString(),
      categories: ['Electronics', 'Mobile Phones'],
    };
  }

  matchConfidence(offerData: OfferResult, signature: ProductSignature): number {
    let confidence = 0.0;
    
    // ASIN match is highest confidence
    if (signature.asin && offerData.productUrl.includes(signature.asin)) {
      confidence = 0.95;
    }
    // Model number match
    else if (signature.model && offerData.productTitle.toLowerCase().includes(signature.model.toLowerCase())) {
      confidence = 0.85;
    }
    // Title fuzzy match
    else {
      const titleWords = signature.canonicalName.toLowerCase().split(' ');
      const offerWords = offerData.productTitle.toLowerCase().split(' ');
      const matchingWords = titleWords.filter(word => 
        offerWords.some(offerWord => offerWord.includes(word) || word.includes(offerWord))
      );
      confidence = Math.min(0.8, matchingWords.length / titleWords.length);
    }
    
    // Variant matching bonus
    if (signature.variant.color && offerData.variant?.toLowerCase().includes(signature.variant.color.toLowerCase())) {
      confidence += 0.05;
    }
    
    return Math.min(0.95, confidence);
  }

  async extractSignature(url: string): Promise<ProductSignature | null> {
    // Extract ASIN from Amazon URL
    const asinMatch = url.match(/\/dp\/([A-Z0-9]{10})/);
    if (!asinMatch) return null;
    
    return {
      sourceSite: this.site,
      inputUrl: url,
      canonicalName: 'Product Name', // Would extract from page in real implementation
      asin: asinMatch[1],
      variant: {},
    };
  }

  private generateRealisticPrice(signature: ProductSignature): number {
    // Generate realistic prices based on product type
    const name = signature.canonicalName.toLowerCase();
    
    if (name.includes('iphone') || name.includes('samsung galaxy s')) return 45000;
    if (name.includes('laptop') || name.includes('macbook')) return 75000;
    if (name.includes('headphone') || name.includes('earbuds')) return 8000;
    if (name.includes('watch')) return 25000;
    if (name.includes('tablet') || name.includes('ipad')) return 35000;
    
    return 15000; // Default price
  }

  private formatVariant(variant: Record<string, string | undefined>): string {
    const parts = [];
    if (variant.capacity) parts.push(variant.capacity);
    if (variant.color) parts.push(variant.color);
    if (variant.size) parts.push(variant.size);
    return parts.join(', ');
  }

  private generateOfferNotes(): string[] {
    const offers = [
      '10% instant discount with SBI cards',
      'No cost EMI available',
      'Exchange offer up to ₹15,000',
      'Amazon Prime delivery',
      '1 year warranty included',
      'Special bank offer: ₹2000 off',
    ];
    
    const numOffers = Math.floor(Math.random() * 3) + 1;
    return offers.sort(() => 0.5 - Math.random()).slice(0, numOffers);
  }

  private generateETA(): string {
    const options = ['1-2 days', '2-3 days', '3-4 days', '1 week', 'Same day delivery'];
    return options[Math.floor(Math.random() * options.length)];
  }
}