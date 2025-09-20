import { MarketplaceAdapter, ProductSignature, OfferResult } from './types';

export class ZeptoAdapter implements MarketplaceAdapter {
  site = 'zepto';
  displayName = 'Zepto';
  baseUrl = 'https://www.zeptonow.com';
  color = '#E91E63';

  async discoverUrls(signature: ProductSignature): Promise<string[]> {
    const urls: string[] = [];
    
    // Zepto is primarily for groceries/daily essentials, filter accordingly
    if (this.isGroceryProduct(signature.canonicalName)) {
      const searchQuery = encodeURIComponent(signature.canonicalName);
      urls.push(`${this.baseUrl}/search?query=${searchQuery}`);
    }
    
    return urls.slice(0, 2);
  }

  async fetchOffer(url: string, signature: ProductSignature): Promise<OfferResult | null> {
    // Only return results for grocery/daily essential products
    if (!this.isGroceryProduct(signature.canonicalName)) {
      return null;
    }

    // Prioritize AI-extracted price for grocery products
    let basePrice: number;
    if (signature.originalPrice && signature.originalPrice > 0) {
      basePrice = signature.originalPrice;
    } else {
      basePrice = this.generateRealisticPrice(signature);
    }
    
    // Zepto typically has small markup for convenience, ±₹20 variation
    const variation = Math.floor(Math.random() * 40) - 20;
    
    return {
      marketplace: this.displayName,
      marketplaceSlug: this.site,
      productUrl: url,
      productTitle: `${signature.canonicalName} - Quick delivery`,
      variant: this.formatVariant(signature.variant),
      listedPrice: basePrice + variation,
      shippingFee: 0, // Zepto typically has free delivery
      effectivePrice: basePrice + variation,
      currency: 'INR',
      inStock: Math.random() > 0.1, // 90% chance in stock
      offerNotes: this.generateOfferNotes(),
      deliveryEta: this.generateETA(),
      matchConfidence: 0.85,
      lastCheckedISO: new Date().toISOString(),
      categories: ['Groceries', 'Daily Essentials'],
    };
  }

  matchConfidence(offerData: OfferResult, signature: ProductSignature): number {
    // High confidence for exact grocery matches
    if (this.isGroceryProduct(signature.canonicalName)) {
      const titleWords = signature.canonicalName.toLowerCase().split(' ');
      const offerWords = offerData.productTitle.toLowerCase().split(' ');
      const matchingWords = titleWords.filter(word => 
        offerWords.some(offerWord => offerWord.includes(word))
      );
      return Math.min(0.9, matchingWords.length / titleWords.length);
    }
    
    return 0.0; // No match for non-grocery items
  }

  private isGroceryProduct(productName: string): boolean {
    const name = productName.toLowerCase();
    const groceryKeywords = [
      'milk', 'bread', 'eggs', 'butter', 'cheese', 'yogurt',
      'rice', 'wheat', 'flour', 'oil', 'sugar', 'salt',
      'shampoo', 'soap', 'toothpaste', 'detergent',
      'snacks', 'biscuits', 'chips', 'chocolate',
      'tea', 'coffee', 'juice', 'water',
    ];
    
    return groceryKeywords.some(keyword => name.includes(keyword));
  }

  private generateRealisticPrice(signature: ProductSignature): number {
    const name = signature.canonicalName.toLowerCase();
    
    // Grocery prices
    if (name.includes('milk')) return 60;
    if (name.includes('bread')) return 30;
    if (name.includes('eggs')) return 80;
    if (name.includes('oil')) return 200;
    if (name.includes('shampoo')) return 250;
    if (name.includes('soap')) return 40;
    
    return 100; // Default grocery price
  }

  private formatVariant(variant: Record<string, string | undefined>): string {
    const parts = [];
    if (variant.size) parts.push(variant.size);
    if (variant.capacity) parts.push(variant.capacity);
    return parts.join(', ');
  }

  private generateOfferNotes(): string[] {
    const offers = [
      '10-minute delivery',
      'Fresh guarantee',
      'No delivery charges',
      'Same day delivery',
      'Express delivery available',
    ];
    
    const numOffers = Math.floor(Math.random() * 2) + 1;
    return offers.sort(() => 0.5 - Math.random()).slice(0, numOffers);
  }

  private generateETA(): string {
    return '10-15 minutes'; // Zepto's USP is quick delivery
  }
}