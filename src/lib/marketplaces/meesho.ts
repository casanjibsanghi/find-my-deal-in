import { MarketplaceAdapter, ProductSignature, OfferResult } from './types';

export class MeeshoAdapter implements MarketplaceAdapter {
  site = 'meesho';
  displayName = 'Meesho';
  baseUrl = 'https://www.meesho.com';
  color = '#E91E63';

  async discoverUrls(signature: ProductSignature): Promise<string[]> {
    const urls: string[] = [];
    
    if (signature.canonicalName) {
      const searchQuery = encodeURIComponent(signature.canonicalName);
      urls.push(`${this.baseUrl}/search?q=${searchQuery}`);
    }
    
    return urls.slice(0, 3);
  }

  async fetchOffer(url: string, signature: ProductSignature): Promise<OfferResult | null> {
    const basePrice = this.generateRealisticPrice(signature);
    const variation = Math.floor(Math.random() * 2000) - 1000;
    
    return {
      marketplace: this.displayName,
      marketplaceSlug: this.site,
      productUrl: url,
      productTitle: `${signature.canonicalName} - Meesho`,
      variant: this.formatVariant(signature.variant),
      listedPrice: basePrice + variation,
      shippingFee: Math.random() > 0.6 ? 50 : 0, // 40% chance of shipping
      effectivePrice: basePrice + variation + (Math.random() > 0.6 ? 50 : 0),
      currency: 'INR',
      inStock: Math.random() > 0.2, // 80% chance in stock
      offerNotes: this.generateOfferNotes(),
      deliveryEta: this.generateETA(),
      matchConfidence: 0.75, // Generally lower confidence due to varied sellers
      lastCheckedISO: new Date().toISOString(),
      categories: ['Fashion', 'Electronics'],
    };
  }

  matchConfidence(offerData: OfferResult, signature: ProductSignature): number {
    let confidence = 0.0;
    
    // Title fuzzy match (Meesho has varied product titles)
    const titleWords = signature.canonicalName.toLowerCase().split(' ');
    const offerWords = offerData.productTitle.toLowerCase().split(' ');
    const matchingWords = titleWords.filter(word => 
      offerWords.some(offerWord => offerWord.includes(word) || word.includes(offerWord))
    );
    confidence = Math.min(0.75, matchingWords.length / titleWords.length);
    
    // Brand matching
    if (signature.brand && offerData.productTitle.toLowerCase().includes(signature.brand.toLowerCase())) {
      confidence += 0.1;
    }
    
    return Math.min(0.8, confidence);
  }

  private generateRealisticPrice(signature: ProductSignature): number {
    const name = signature.canonicalName.toLowerCase();
    const brand = signature.brand?.toLowerCase() || '';
    
    // Meesho focuses on fashion, home, and budget electronics
    // Electronics are typically refurbished or unbranded variants
    if (name.includes('iphone') || name.includes('samsung galaxy s')) return 35000; // Likely refurbished
    if (name.includes('laptop') || name.includes('macbook')) return 45000; // Budget laptops
    if (name.includes('headphone') || name.includes('earbuds')) {
      if (brand.includes('boat') || brand.includes('noise')) return 1999;
      return 2999; // Mostly unbranded
    }
    if (name.includes('watch')) return 1499; // Fashion watches, not smartwatches
    if (name.includes('tablet')) return 12999;
    
    // Fashion items (Meesho's strength)
    if (name.includes('shirt') || name.includes('t-shirt') || name.includes('tshirt')) return 299;
    if (name.includes('jeans') || name.includes('pants')) return 499;
    if (name.includes('dress') || name.includes('kurti')) return 399;
    if (name.includes('saree')) return 599;
    if (name.includes('shoes') || name.includes('sandals')) return 449;
    if (name.includes('bag') || name.includes('handbag')) return 349;
    if (name.includes('jewelry') || name.includes('earrings')) return 199;
    
    // Home & Kitchen
    if (name.includes('bedsheet') || name.includes('pillow')) return 299;
    if (name.includes('curtain')) return 399;
    if (name.includes('kitchen') || name.includes('utensil')) return 249;
    
    return 399; // Default for fashion/home items
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
      'Free delivery on orders above ₹999',
      'Cash on delivery available',
      '7-day return policy',
      'Lowest price guarantee',
      'Supplier rating: 4.2★',
      'Verified supplier',
    ];
    
    const numOffers = Math.floor(Math.random() * 2) + 1;
    return offers.sort(() => 0.5 - Math.random()).slice(0, numOffers);
  }

  private generateETA(): string {
    const options = ['3-5 days', '5-7 days', '1-2 weeks', '4-6 days'];
    return options[Math.floor(Math.random() * options.length)];
  }
}