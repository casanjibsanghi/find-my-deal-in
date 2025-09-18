# PriceScout IN

**Find the best prices across major Indian marketplaces instantly.**

PriceScout IN is a comprehensive price comparison tool that helps Indian consumers find the best deals across Amazon, Flipkart, Croma, Reliance Digital, Tata CLiQ, and other major marketplaces.

## ✨ Features

- **Instant Price Comparison**: Paste any product URL and get prices from all major Indian marketplaces
- **Smart Product Matching**: Uses ASIN, model numbers, and fuzzy matching for accurate results
- **Effective Price Calculation**: Includes shipping, applies auto-discounts, shows bank offers separately
- **Best Buy Recommendations**: Highlights the best deal with clear rationale
- **Google Sheets Integration**: Automatically logs all comparisons for transparency
- **Responsive Design**: Beautiful, mobile-first interface with dark/light mode
- **Real-time Updates**: Live price updates with caching for performance

## 🛍️ Supported Marketplaces

- Amazon India
- Flipkart
- Croma
- Reliance Digital
- Tata CLiQ
- Vijay Sales
- Apple India Store
- Samsung India Store

## 🚀 Technology Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI**: TailwindCSS + shadcn/ui components
- **Icons**: Lucide React
- **State**: React Query for data fetching
- **Routing**: React Router DOM
- **Web Scraping**: Cheerio (for HTML parsing)
- **Sheets API**: Google Sheets API with Service Account

## 📋 Prerequisites

- Node.js 18+ and npm
- Google Cloud Service Account (for Sheets integration)
- SerpAPI key (optional, for search fallback)
- Upstash Redis (optional, for caching)

## 🔧 Environment Setup

Create a `.env.local` file with the following variables:

```env
# Google Sheets Integration (Required)
GOOGLE_SHEETS_ID=14rmW5fK44vOHiUAm9m41VnSZQGZO1ayuY4QaaODPIWc
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"

# Optional Services
SERPAPI_KEY=your_serpapi_key_here          # For search fallback
REDIS_URL=your_upstash_redis_url           # For caching
REDIS_TOKEN=your_upstash_redis_token       # For caching

# Configuration
APP_BASE_CURRENCY=INR
```

### Google Sheets Setup

1. Create a Google Cloud Project and enable the Sheets API
2. Create a Service Account and download the JSON key file
3. Share the target Google Sheet with your service account email (editor access)
4. Copy the private key to your `.env.local` file (preserve newlines with `\n`)

## 📦 Installation

```bash
# Clone the repository
git clone <your-git-url>
cd pricescout-in

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Header.tsx      # App header with hero section
│   ├── SearchForm.tsx  # URL input form
│   ├── ResultsTable.tsx # Price comparison table
│   └── InfoSection.tsx # FAQ and info accordions
├── pages/              # Main pages
│   ├── Index.tsx       # Home page
│   └── api/            # API mock/services
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── assets/             # Images and static files
```

## 🔄 How It Works

1. **Input**: User pastes a product URL from any supported marketplace
2. **Extract**: App extracts product identifiers (ASIN, model, GTIN) and canonical name
3. **Search**: Searches other marketplaces using identifiers or fuzzy matching
4. **Compare**: Calculates effective prices (base + shipping - auto-discounts)
5. **Rank**: Finds best buy based on price, availability, and delivery
6. **Log**: Saves results to Google Sheets for transparency
7. **Display**: Shows comparison table with clear best buy recommendation

## 💡 Usage Examples

### Basic Price Comparison
```bash
# Paste any product URL
https://www.amazon.in/dp/B08N5WRWNW

# Get instant comparison across all marketplaces
# Results automatically saved to Google Sheets
```

### Supported URL Formats
- Amazon: `amazon.in/dp/ASIN` or `amazon.in/gp/product/ASIN`
- Flipkart: `flipkart.com/product-name/p/itm*`
- Croma: `croma.com/product-name`
- And more...

## 🎯 Price Calculation Logic

**Effective Price = Base Price + Shipping Fee - Auto-Applied Discounts**

- ✅ **Included**: Listed price, shipping charges, auto-applied coupons
- ℹ️ **Shown Separately**: Bank offers, conditional discounts, exchange values
- 🚫 **Excluded**: Offers requiring specific actions or eligibility

## 📊 Comparison Criteria

1. **Primary**: Lowest effective price
2. **Secondary**: Stock availability
3. **Tertiary**: Faster delivery ETA
4. **Final**: Higher match confidence score

## 🛡️ Rate Limiting & Ethics

- Respects robots.txt for all marketplaces
- Implements 10 requests/minute rate limiting
- Uses realistic browser headers and delays
- Caches results to minimize server load
- Falls back to search APIs when scraping is restricted

## 🔐 Security Features

- Input URL validation (allowlisted domains only)
- XSS protection with content sanitization  
- Rate limiting by IP address
- HTTPS-only in production
- Environment variable validation

## 📈 Performance

- **Parallel Processing**: Fetches from multiple marketplaces simultaneously
- **Smart Caching**: 6-hour cache for product data, 2-hour for prices
- **Optimistic Loading**: Shows skeleton while fetching
- **Error Recovery**: 2-retry with exponential backoff

## 🧪 Testing

```bash
# Run unit tests
npm test

# Test specific components
npm test SearchForm
npm test ResultsTable

# E2E testing with sample URLs
npm run test:e2e
```

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Deploy to Vercel
npm run build
vercel --prod

# Set environment variables in Vercel dashboard
# Enable cron jobs for daily price updates
```

### Docker

```bash
# Build Docker image
docker build -t pricescout-in .

# Run container
docker run -p 3000:3000 --env-file .env.local pricescout-in
```

## 📅 Cron Jobs

The app includes a daily cron job (9:00 AM IST) that:
- Re-checks prices for the last 50 unique products
- Updates Google Sheets with fresh data
- Clears stale cache entries

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid URL format"**: Ensure URL is from a supported marketplace
2. **"No results found"**: Product might be discontinued or region-locked
3. **"Google Sheets error"**: Check service account permissions
4. **Rate limiting**: Wait a minute before retrying

### Debug Mode

```bash
# Enable debug logging
DEBUG=true npm run dev

# Check network requests
# Use browser dev tools Network tab
```

## 📄 Disclaimer

- **Accuracy**: Prices change rapidly; always verify on merchant sites
- **Offers**: Bank/credit card offers may have specific T&C
- **Availability**: Stock levels and delivery times may vary
- **Liability**: No warranties on price accuracy or deal availability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Lucide](https://lucide.dev/) for clean icons
- [TailwindCSS](https://tailwindcss.com/) for utility-first styling
- [Cheerio](https://cheerio.js.org/) for server-side HTML parsing

---

**Built with ❤️ for Indian consumers**

*Find better deals, save more money, shop smarter.*