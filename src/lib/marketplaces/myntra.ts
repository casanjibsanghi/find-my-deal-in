import { MarketplaceAdapter, ProductSignature, OfferResult } from './types';

export class MyntraAdapter implements MarketplaceAdapter {
  site = 'myntra';
  displayName = 'Myntra';
  baseUrl = 'https://www.myntra.com';
  color = '#FF3F6C';

  async discoverUrls(signature: ProductSignature): Promise<string[]> {
    const urls: string[] = [];
    
    if (this.isFashionProduct(signature.canonicalName)) {
      const searchQuery = encodeURIComponent(signature.canonicalName);
      urls.push(`${this.baseUrl}/search?q=${searchQuery}`);
    }
    
    return urls.slice(0, 3);
  }

  async fetchOffer(url: string, signature: ProductSignature): Promise<OfferResult | null> {
    if (!this.isFashionProduct(signature.canonicalName)) {
      return null;
    }

    const basePrice = this.generateRealisticPrice(signature);
    const variation = Math.floor(Math.random() * 1000) - 500;
    
    return {
      marketplace: this.displayName,
      marketplaceSlug: this.site,
      productUrl: url,
      productTitle: `${signature.canonicalName} - Fashion`,
      variant: this.formatVariant(signature.variant),
      listedPrice: basePrice + variation,
      shippingFee: Math.random() > 0.6 ? 99 : 0, // 40% chance of shipping
      effectivePrice: basePrice + variation + (Math.random() > 0.6 ? 99 : 0),
      currency: 'INR',
      inStock: Math.random() > 0.2, // 80% chance in stock
      offerNotes: this.generateOfferNotes(),
      deliveryEta: this.generateETA(),
      matchConfidence: 0.82,
      lastCheckedISO: new Date().toISOString(),
      categories: ['Fashion', 'Clothing', 'Accessories'],
    };
  }

  matchConfidence(offerData: OfferResult, signature: ProductSignature): number {
    if (this.isFashionProduct(signature.canonicalName)) {
      const titleWords = signature.canonicalName.toLowerCase().split(' ');
      const offerWords = offerData.productTitle.toLowerCase().split(' ');
      const matchingWords = titleWords.filter(word => 
        offerWords.some(offerWord => offerWord.includes(word))
      );
      
      let confidence = Math.min(0.85, matchingWords.length / titleWords.length);
      
      // Size matching bonus for fashion
      if (signature.variant.size && offerData.variant?.includes(signature.variant.size)) {
        confidence += 0.1;
      }
      
      return Math.min(0.9, confidence);
    }
    
    return 0.0;
  }

  private isFashionProduct(productName: string): boolean {
    const name = productName.toLowerCase();
    const fashionKeywords = [
      'shirt', 'tshirt', 't-shirt', 'jeans', 'pants', 'trousers',
      'dress', 'kurta', 'saree', 'lehenga', 'top', 'blouse',
      'shoes', 'sneakers', 'sandals', 'boots', 'heels',
      'bag', 'handbag', 'backpack', 'wallet', 'belt',
      'watch', 'jewelry', 'earrings', 'necklace', 'ring',
      'jacket', 'hoodie', 'sweater', 'blazer', 'coat',
      'inner wear', 'undergarments', 'bra', 'briefs',
      'ethnic wear', 'western wear', 'formal wear',
    ];
    
    return fashionKeywords.some(keyword => name.includes(keyword));
  }

  private generateRealisticPrice(signature: ProductSignature): number {
    const name = signature.canonicalName.toLowerCase();
    
    if (name.includes('shirt') || name.includes('t-shirt')) return 800;
    if (name.includes('jeans') || name.includes('pants')) return 1200;
    if (name.includes('dress')) return 1500;
    if (name.includes('shoes') || name.includes('sneakers')) return 2500;
    if (name.includes('watch')) return 3500;
    if (name.includes('bag') || name.includes('handbag')) return 1800;
    if (name.includes('jacket') || name.includes('hoodie')) return 2200;
    
    return 1000;
  }

  private formatVariant(variant: Record<string, string | undefined>): string {
    const parts = [];
    if (variant.size) parts.push(`Size: ${variant.size}`);
    if (variant.color) parts.push(variant.color);
    return parts.join(', ');
  }

  private generateOfferNotes(): string[] {
    const offers = [
      'Buy 2 Get 1 Free',
      'Flat 40% off on minimum purchase',
      'Free shipping on orders above ₹999',
      'Easy 30-day returns',
      'Try & Buy available',
      'Myntra Insider benefits',
      'Bank offer: Extra 10% off',
    ];
    
    const numOffers = Math.floor(Math.random() * 3) + 1;
    return offers.sort(() => 0.5 - Math.random()).slice(0, numOffers);
  }

  private generateETA(): string {
    const options = ['2-3 days', '3-5 days', '1 week', 'Express delivery'];
    return options[Math.floor(Math.random() * options.length)];
  }
}