// Gemini AI service for product information extraction
const GEMINI_API_KEY = 'AIzaSyA5Mk05ayJcAu7BoXqVSuO__oq5x-Jg5vc';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

export interface ProductInfo {
  name: string;
  brand?: string;
  model?: string;
  category: string;
  price?: number;
  currency?: string;
  color?: string;
  size?: string;
  capacity?: string;
  ram?: string;
  description?: string;
  availability?: boolean;
  asin?: string;
  sku?: string;
  gtin?: string;
}

/**
 * Extract product information from HTML content using Gemini AI
 */
export async function extractProductInfoWithAI(htmlContent: string, url: string): Promise<ProductInfo | null> {
  try {
    const prompt = `
Analyze this product page HTML and extract structured product information. Focus on the main product being sold.

URL: ${url}

HTML Content (first 8000 chars):
${htmlContent.substring(0, 8000)}

Extract and return ONLY a JSON object with these fields (use null for missing data):
{
  "name": "Complete product name/title",
  "brand": "Brand name",
  "model": "Model number/name", 
  "category": "Product category (Electronics/Fashion/Beauty/Grocery/etc)",
  "price": "Current price as number (no currency symbols)",
  "currency": "Currency code (INR/USD/etc)",
  "color": "Product color/variant",
  "size": "Size/dimensions", 
  "capacity": "Storage/memory capacity",
  "ram": "RAM specification",
  "description": "Brief product description",
  "availability": "In stock status as boolean",
  "asin": "Amazon ASIN if available",
  "sku": "Product SKU/ID",
  "gtin": "GTIN/EAN/UPC code"
}

Be precise and extract only confirmed information. Return valid JSON only.`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      throw new Error('No response from Gemini AI');
    }

    // Extract JSON from AI response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in AI response');
    }

    const productInfo: ProductInfo = JSON.parse(jsonMatch[0]);
    
    // Validate required fields
    if (!productInfo.name || productInfo.name === 'null') {
      return null;
    }

    return productInfo;
  } catch (error) {
    console.error('Error extracting product info with AI:', error);
    return null;
  }
}

export async function fetchProductPage(url: string): Promise<string | null> {
  try {
    console.log('Fetching product page:', url);
    
    // For development/demo, we'll use a CORS proxy for external requests
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Fetch failed: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Successfully fetched page content');
    return data.contents || null;
  } catch (error) {
    console.error('Error fetching product page:', error);
    
    // Fallback: try direct fetch (might work in some environments)
    try {
      console.log('Trying direct fetch as fallback...');
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PriceBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      
      if (response.ok) {
        console.log('Direct fetch succeeded');
        return await response.text();
      }
    } catch (fallbackError) {
      console.error('Direct fetch also failed:', fallbackError);
    }
    
    return null;
  }
}

/**
 * Clean and normalize product name
 */
export function normalizeProductName(name: string): string {
  return name
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s\-\.]/g, ' ')
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Determine if a URL is likely a product page
 */
export function isProductUrl(url: string): boolean {
  const productIndicators = [
    '/dp/', '/product/', '/p/', '/item/', '/buy/',
    'product-', 'item-', '/gp/product/', '/d/',
    'pid=', 'productId=', 'itemId='
  ];
  
  const lowerUrl = url.toLowerCase();
  return productIndicators.some(indicator => lowerUrl.includes(indicator));
}