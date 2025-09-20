import { MarketplaceAdapter, ProductSignature, OfferResult } from './types';

export class InstamartAdapter implements MarketplaceAdapter {
  site = 'instamart';
  displayName = 'Instamart';
  baseUrl = 'https://www.swiggy.com/instamart';
  color = '#FC8019';

  async discoverUrls(signature: ProductSignature): Promise<string[]> {
    const urls: string[] = [];
    
    if (this.isGroceryProduct(signature.canonicalName)) {
      const searchQuery = encodeURIComponent(signature.canonicalName);
      urls.push(`${this.baseUrl}/search?query=${searchQuery}`);
    }
    
    return urls.slice(0, 2);
  }

  async fetchOffer(url: string, signature: ProductSignature): Promise<OfferResult | null> {
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
    
    // Instamart similar to Zepto, ±₹25 variation
    const variation = Math.floor(Math.random() * 50) - 25;
    
    return {
      marketplace: this.displayName,
      marketplaceSlug: this.site,
      productUrl: url,
      productTitle: `${signature.canonicalName} - Instamart`,
      variant: this.formatVariant(signature.variant),
      listedPrice: basePrice + variation,
      shippingFee: Math.random() > 0.8 ? 15 : 0, // 20% chance of small delivery fee
      effectivePrice: basePrice + variation + (Math.random() > 0.8 ? 15 : 0),
      currency: 'INR',
      inStock: Math.random() > 0.08, // 92% chance in stock
      offerNotes: this.generateOfferNotes(),
      deliveryEta: this.generateETA(),
      matchConfidence: 0.86,
      lastCheckedISO: new Date().toISOString(),
      categories: ['Groceries', 'Daily Essentials', 'Quick Commerce'],
    };
  }

  matchConfidence(offerData: OfferResult, signature: ProductSignature): number {
    if (this.isGroceryProduct(signature.canonicalName)) {
      const titleWords = signature.canonicalName.toLowerCase().split(' ');
      const offerWords = offerData.productTitle.toLowerCase().split(' ');
      const matchingWords = titleWords.filter(word => 
        offerWords.some(offerWord => offerWord.includes(word))
      );
      return Math.min(0.88, matchingWords.length / titleWords.length);
    }
    
    return 0.0;
  }

  private isGroceryProduct(productName: string): boolean {
    const name = productName.toLowerCase();
    const groceryKeywords = [
      'milk', 'bread', 'eggs', 'butter', 'cheese', 'yogurt',
      'rice', 'wheat', 'flour', 'oil', 'sugar', 'salt',
      'shampoo', 'soap', 'toothpaste', 'detergent',
      'snacks', 'biscuits', 'chips', 'chocolate',
      'tea', 'coffee', 'juice', 'water', 'cold drink',
      'ice cream', 'frozen', 'ready to eat',
    ];
    
    return groceryKeywords.some(keyword => name.includes(keyword));
  }

  private generateRealisticPrice(signature: ProductSignature): number {
    const name = signature.canonicalName.toLowerCase();
    
    // Slightly higher prices due to quick delivery premium
    if (name.includes('milk')) return 68;
    if (name.includes('bread')) return 38;
    if (name.includes('eggs')) return 88;
    if (name.includes('oil')) return 235;
    if (name.includes('shampoo')) return 295;
    if (name.includes('soap')) return 48;
    if (name.includes('ice cream')) return 85;
    
    return 120;
  }

  private formatVariant(variant: Record<string, string | undefined>): string {
    const parts = [];
    if (variant.size) parts.push(variant.size);
    if (variant.capacity) parts.push(variant.capacity);
    return parts.join(', ');
  }

  private generateOfferNotes(): string[] {
    const offers = [
      '15-30 minute delivery',
      'Free delivery on orders above ₹99',
      'Swiggy One member benefits',
      'Lightning fast delivery',
      'Fresh products guarantee',
      'No surge pricing',
    ];
    
    const numOffers = Math.floor(Math.random() * 2) + 1;
    return offers.sort(() => 0.5 - Math.random()).slice(0, numOffers);
  }

  private generateETA(): string {
    const options = ['15-20 minutes', '20-30 minutes', '30-45 minutes'];
    return options[Math.floor(Math.random() * options.length)];
  }
}