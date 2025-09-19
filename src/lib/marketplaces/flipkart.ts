import { MarketplaceAdapter, ProductSignature, OfferResult } from './types';

export class FlipkartAdapter implements MarketplaceAdapter {
  site = 'flipkart';
  displayName = 'Flipkart';
  baseUrl = 'https://www.flipkart.com';
  color = '#047BD6';

  async discoverUrls(signature: ProductSignature): Promise<string[]> {
    const urls: string[] = [];
    
    // Flipkart search URL
    if (signature.canonicalName) {
      const searchQuery = encodeURIComponent(signature.canonicalName);
      urls.push(`${this.baseUrl}/search?q=${searchQuery}`);
    }
    
    return urls.slice(0, 3);
  }

  async fetchOffer(url: string, signature: ProductSignature): Promise<OfferResult | null> {
    const basePrice = this.generateRealisticPrice(signature);
    const variation = Math.floor(Math.random() * 3000) - 1500; // ±1500 variation
    
    return {
      marketplace: this.displayName,
      marketplaceSlug: this.site,
      productUrl: url,
      productTitle: `${signature.canonicalName} - Flipkart`,
      variant: this.formatVariant(signature.variant),
      listedPrice: basePrice + variation,
      shippingFee: Math.random() > 0.8 ? 40 : 0, // 20% chance of shipping fee
      effectivePrice: basePrice + variation + (Math.random() > 0.8 ? 40 : 0),
      currency: 'INR',
      inStock: Math.random() > 0.15, // 85% chance in stock
      offerNotes: this.generateOfferNotes(),
      deliveryEta: this.generateETA(),
      matchConfidence: 0.88,
      lastCheckedISO: new Date().toISOString(),
      categories: ['Electronics', 'Mobiles'],
    };
  }

  matchConfidence(offerData: OfferResult, signature: ProductSignature): number {
    let confidence = 0.0;
    
    // Model number match
    if (signature.model && offerData.productTitle.toLowerCase().includes(signature.model.toLowerCase())) {
      confidence = 0.9;
    }
    // Title fuzzy match
    else {
      const titleWords = signature.canonicalName.toLowerCase().split(' ');
      const offerWords = offerData.productTitle.toLowerCase().split(' ');
      const matchingWords = titleWords.filter(word => 
        offerWords.some(offerWord => offerWord.includes(word) || word.includes(offerWord))
      );
      confidence = Math.min(0.85, matchingWords.length / titleWords.length);
    }
    
    // Brand matching bonus
    if (signature.brand && offerData.productTitle.toLowerCase().includes(signature.brand.toLowerCase())) {
      confidence += 0.05;
    }
    
    return Math.min(0.9, confidence);
  }

  private generateRealisticPrice(signature: ProductSignature): number {
    const name = signature.canonicalName.toLowerCase();
    const brand = signature.brand?.toLowerCase() || '';
    
    // Smartphones - slightly lower than Amazon
    if (name.includes('iphone')) {
      if (name.includes('15') || name.includes('pro')) return 77900;
      if (name.includes('14')) return 67900;
      if (name.includes('13')) return 57900;
      return 47900;
    }
    if (name.includes('samsung galaxy s24')) return 72999;
    if (name.includes('samsung galaxy s23')) return 62999;
    if (name.includes('samsung galaxy')) return 52999;
    if (name.includes('oneplus') && name.includes('12')) return 62999;
    if (name.includes('oneplus')) return 37999;
    if (name.includes('xiaomi') || name.includes('redmi')) return 22999;
    if (name.includes('oppo') || name.includes('vivo')) return 27999;
    
    // Laptops
    if (name.includes('macbook')) {
      if (name.includes('pro')) return 195900;
      if (name.includes('air')) return 112900;
      return 97900;
    }
    if (name.includes('laptop')) {
      if (brand.includes('dell') || brand.includes('hp')) return 63000;
      if (brand.includes('lenovo')) return 56000;
      if (brand.includes('asus')) return 60000;
      return 53000;
    }
    
    // Audio
    if (name.includes('airpods')) return 23900;
    if (name.includes('headphone') || name.includes('earbuds')) {
      if (brand.includes('sony') || brand.includes('bose')) return 14999;
      if (brand.includes('boat') || brand.includes('noise')) return 3499;
      return 7499;
    }
    
    // Watches
    if (name.includes('apple watch')) return 40900;
    if (name.includes('samsung galaxy watch')) return 31999;
    if (name.includes('watch')) return 17999;
    
    // Tablets
    if (name.includes('ipad')) {
      if (name.includes('pro')) return 79900;
      if (name.includes('air')) return 57900;
      return 37900;
    }
    if (name.includes('tablet')) return 28999;
    
    return 14999;
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
      'Bank offer: 10% off with Axis Bank cards',
      'Exchange offer up to ₹20,000',
      'Flipkart Plus delivery',
      'No cost EMI from ₹2,500/month',
      'F-Assured product quality',
      'Extra ₹1000 off on prepaid orders',
    ];
    
    const numOffers = Math.floor(Math.random() * 3) + 1;
    return offers.sort(() => 0.5 - Math.random()).slice(0, numOffers);
  }

  private generateETA(): string {
    const options = ['2-3 days', '3-4 days', '4-5 days', '1 week', 'Express delivery'];
    return options[Math.floor(Math.random() * options.length)];
  }
}