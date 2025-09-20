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
    // Prioritize AI-extracted price, fallback to realistic generation
    let basePrice: number;
    if (signature.originalPrice && signature.originalPrice > 0) {
      console.log(`Using AI-extracted price: ₹${signature.originalPrice} for ${signature.canonicalName}`);
      basePrice = signature.originalPrice;
    } else {
      basePrice = this.generateRealisticPrice(signature);
      console.log(`Using generated price: ₹${basePrice} for ${signature.canonicalName}`);
    }
    
    // For source marketplace (Amazon), use exact price with minimal variation
    const isSourceUrl = url.includes('/dp/') && signature.asin && url.includes(signature.asin);
    const variation = isSourceUrl ? 0 : Math.floor(Math.random() * 200) - 100; // ±₹100 for other products
    
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
    const name = signature.canonicalName.toLowerCase();
    const brand = signature.brand?.toLowerCase() || '';
    
    // Smartphones with brand-specific pricing
    if (name.includes('iphone')) {
      if (name.includes('15') || name.includes('pro')) return 79900;
      if (name.includes('14')) return 69900;
      if (name.includes('13')) return 59900;
      return 49900;
    }
    if (name.includes('samsung galaxy s24')) return 74999;
    if (name.includes('samsung galaxy s23')) return 64999;
    if (name.includes('samsung galaxy')) return 54999;
    if (name.includes('oneplus') && name.includes('12')) return 64999;
    if (name.includes('oneplus')) return 39999;
    if (name.includes('xiaomi') || name.includes('redmi')) return 24999;
    if (name.includes('oppo') || name.includes('vivo')) return 29999;
    
    // Laptops with capacity/brand variations
    if (name.includes('macbook')) {
      if (name.includes('pro')) return 199900;
      if (name.includes('air')) return 114900;
      return 99900;
    }
    if (name.includes('laptop')) {
      if (brand.includes('dell') || brand.includes('hp')) return 65000;
      if (brand.includes('lenovo')) return 58000;
      if (brand.includes('asus')) return 62000;
      return 55000;
    }
    
    // Audio devices
    if (name.includes('airpods')) return 24900;
    if (name.includes('headphone') || name.includes('earbuds')) {
      if (brand.includes('sony') || brand.includes('bose')) return 15999;
      if (brand.includes('boat') || brand.includes('noise')) return 3999;
      return 7999;
    }
    
    // Watches
    if (name.includes('apple watch')) return 41900;
    if (name.includes('samsung galaxy watch')) return 32999;
    if (name.includes('watch')) return 18999;
    
    // Tablets
    if (name.includes('ipad')) {
      if (name.includes('pro')) return 81900;
      if (name.includes('air')) return 59900;
      return 39900;
    }
    if (name.includes('tablet')) return 29999;
    
    // Default electronics price
    return 15999;
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