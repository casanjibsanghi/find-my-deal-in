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

/**
 * Fetch and parse product page content
 */
export async function fetchProductPage(url: string): Promise<string | null> {
  try {
    // Add user agent to avoid blocking
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching product page:', error);
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