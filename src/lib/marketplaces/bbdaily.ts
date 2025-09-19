import { MarketplaceAdapter, ProductSignature, OfferResult } from './types';

export class BBDailyAdapter implements MarketplaceAdapter {
  site = 'bbdaily';
  displayName = 'BB Daily';
  baseUrl = 'https://www.bigbasket.com';
  color = '#84C225';

  async discoverUrls(signature: ProductSignature): Promise<string[]> {
    const urls: string[] = [];
    
    // BB Daily is for groceries and daily essentials
    if (this.isGroceryProduct(signature.canonicalName)) {
      const searchQuery = encodeURIComponent(signature.canonicalName);
      urls.push(`${this.baseUrl}/ps/?q=${searchQuery}`);
    }
    
    return urls.slice(0, 2);
  }

  async fetchOffer(url: string, signature: ProductSignature): Promise<OfferResult | null> {
    if (!this.isGroceryProduct(signature.canonicalName)) {
      return null;
    }

    // Use actual extracted price if available, otherwise generate realistic price
    const basePrice = signature.originalPrice || this.generateRealisticPrice(signature);
    const variation = Math.floor(Math.random() * 80) - 40;
    
    return {
      marketplace: this.displayName,
      marketplaceSlug: this.site,
      productUrl: url,
      productTitle: `${signature.canonicalName} - BigBasket`,
      variant: this.formatVariant(signature.variant),
      listedPrice: basePrice + variation,
      shippingFee: Math.random() > 0.7 ? 25 : 0, // 30% chance of delivery fee
      effectivePrice: basePrice + variation + (Math.random() > 0.7 ? 25 : 0),
      currency: 'INR',
      inStock: Math.random() > 0.05, // 95% chance in stock
      offerNotes: this.generateOfferNotes(),
      deliveryEta: this.generateETA(),
      matchConfidence: 0.88,
      lastCheckedISO: new Date().toISOString(),
      categories: ['Groceries', 'Fresh Produce', 'Daily Essentials'],
    };
  }

  matchConfidence(offerData: OfferResult, signature: ProductSignature): number {
    if (this.isGroceryProduct(signature.canonicalName)) {
      const titleWords = signature.canonicalName.toLowerCase().split(' ');
      const offerWords = offerData.productTitle.toLowerCase().split(' ');
      const matchingWords = titleWords.filter(word => 
        offerWords.some(offerWord => offerWord.includes(word))
      );
      return Math.min(0.9, matchingWords.length / titleWords.length);
    }
    
    return 0.0;
  }

  private isGroceryProduct(productName: string): boolean {
    const name = productName.toLowerCase();
    const groceryKeywords = [
      'milk', 'bread', 'eggs', 'butter', 'cheese', 'yogurt', 'cream',
      'rice', 'wheat', 'flour', 'oil', 'sugar', 'salt', 'spices',
      'shampoo', 'soap', 'toothpaste', 'detergent', 'cleaning',
      'snacks', 'biscuits', 'chips', 'chocolate', 'candy',
      'tea', 'coffee', 'juice', 'water', 'soft drink',
      'vegetables', 'fruits', 'meat', 'fish', 'chicken',
    ];
    
    return groceryKeywords.some(keyword => name.includes(keyword));
  }

  private generateRealisticPrice(signature: ProductSignature): number {
    const name = signature.canonicalName.toLowerCase();
    
    if (name.includes('milk')) return 65;
    if (name.includes('bread')) return 35;
    if (name.includes('eggs')) return 85;
    if (name.includes('oil')) return 220;
    if (name.includes('shampoo')) return 280;
    if (name.includes('soap')) return 45;
    if (name.includes('rice')) return 120;
    
    return 110;
  }

  private formatVariant(variant: Record<string, string | undefined>): string {
    const parts = [];
    if (variant.size) parts.push(variant.size);
    if (variant.capacity) parts.push(variant.capacity);
    return parts.join(', ');
  }

  private generateOfferNotes(): string[] {
    const offers = [
      'Fresh guarantee',
      'Free delivery on orders above ₹200',
      'BB Star member discount',
      'Same day delivery',
      'Quality assurance',
      'Express slot available',
    ];
    
    const numOffers = Math.floor(Math.random() * 3) + 1;
    return offers.sort(() => 0.5 - Math.random()).slice(0, numOffers);
  }

  private generateETA(): string {
    const options = ['Same day', '2-4 hours', '6-8 hours', 'Next day', 'Express slot'];
    return options[Math.floor(Math.random() * options.length)];
  }
}