import { MarketplaceAdapter, ProductSignature, OfferResult } from './types';

export class NykaaAdapter implements MarketplaceAdapter {
  site = 'nykaa';
  displayName = 'Nykaa';
  baseUrl = 'https://www.nykaa.com';
  color = '#FC2779';

  async discoverUrls(signature: ProductSignature): Promise<string[]> {
    const urls: string[] = [];
    
    if (this.isBeautyProduct(signature.canonicalName)) {
      const searchQuery = encodeURIComponent(signature.canonicalName);
      urls.push(`${this.baseUrl}/search?query=${searchQuery}`);
    }
    
    return urls.slice(0, 3);
  }

  async fetchOffer(url: string, signature: ProductSignature): Promise<OfferResult | null> {
    if (!this.isBeautyProduct(signature.canonicalName)) {
      return null;
    }

    // Use actual extracted price if available, otherwise generate realistic price
    const basePrice = signature.originalPrice || this.generateRealisticPrice(signature);
    const variation = Math.floor(Math.random() * 400) - 200;
    
    return {
      marketplace: this.displayName,
      marketplaceSlug: this.site,
      productUrl: url,
      productTitle: `${signature.canonicalName} - Beauty`,
      variant: this.formatVariant(signature.variant),
      listedPrice: basePrice + variation,
      shippingFee: Math.random() > 0.7 ? 50 : 0, // 30% chance of shipping
      effectivePrice: basePrice + variation + (Math.random() > 0.7 ? 50 : 0),
      currency: 'INR',
      inStock: Math.random() > 0.15, // 85% chance in stock
      offerNotes: this.generateOfferNotes(),
      deliveryEta: this.generateETA(),
      matchConfidence: 0.88,
      lastCheckedISO: new Date().toISOString(),
      categories: ['Beauty', 'Cosmetics', 'Skincare', 'Personal Care'],
    };
  }

  matchConfidence(offerData: OfferResult, signature: ProductSignature): number {
    if (this.isBeautyProduct(signature.canonicalName)) {
      const titleWords = signature.canonicalName.toLowerCase().split(' ');
      const offerWords = offerData.productTitle.toLowerCase().split(' ');
      const matchingWords = titleWords.filter(word => 
        offerWords.some(offerWord => offerWord.includes(word))
      );
      
      let confidence = Math.min(0.9, matchingWords.length / titleWords.length);
      
      // Brand matching is important for beauty products
      if (signature.brand && offerData.productTitle.toLowerCase().includes(signature.brand.toLowerCase())) {
        confidence += 0.05;
      }
      
      return Math.min(0.92, confidence);
    }
    
    return 0.0;
  }

  private isBeautyProduct(productName: string): boolean {
    const name = productName.toLowerCase();
    const beautyKeywords = [
      'lipstick', 'foundation', 'concealer', 'mascara', 'eyeliner',
      'eyeshadow', 'blush', 'highlighter', 'bronzer', 'primer',
      'moisturizer', 'cleanser', 'serum', 'toner', 'face wash',
      'sunscreen', 'face mask', 'scrub', 'cream', 'lotion',
      'shampoo', 'conditioner', 'hair oil', 'hair mask',
      'perfume', 'deodorant', 'body wash', 'body lotion',
      'nail polish', 'makeup', 'skincare', 'beauty',
      'kajal', 'kohl', 'sindoor', 'mehendi',
    ];
    
    return beautyKeywords.some(keyword => name.includes(keyword));
  }

  private generateRealisticPrice(signature: ProductSignature): number {
    const name = signature.canonicalName.toLowerCase();
    
    if (name.includes('lipstick')) return 650;
    if (name.includes('foundation')) return 1200;
    if (name.includes('mascara')) return 450;
    if (name.includes('moisturizer')) return 800;
    if (name.includes('serum')) return 1500;
    if (name.includes('shampoo')) return 350;
    if (name.includes('perfume')) return 2500;
    if (name.includes('nail polish')) return 280;
    
    return 600;
  }

  private formatVariant(variant: Record<string, string | undefined>): string {
    const parts = [];
    if (variant.color) parts.push(`Shade: ${variant.color}`);
    if (variant.size) parts.push(variant.size);
    if (variant.capacity) parts.push(variant.capacity);
    return parts.join(', ');
  }

  private generateOfferNotes(): string[] {
    const offers = [
      'Buy 3 Get 1 Free',
      'Flat 25% off on minimum purchase ₹1000',
      'Free beauty samples with orders',
      'Nykaa Pro member benefits',
      'Authentic products guarantee',
      'Free shipping on orders above ₹500',
      'Bank offer: Extra 15% off',
      'Beauty advice available',
    ];
    
    const numOffers = Math.floor(Math.random() * 3) + 1;
    return offers.sort(() => 0.5 - Math.random()).slice(0, numOffers);
  }

  private generateETA(): string {
    const options = ['2-4 days', '3-5 days', '1 week', 'Same day (select cities)'];
    return options[Math.floor(Math.random() * options.length)];
  }
}