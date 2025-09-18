import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SearchForm } from "@/components/SearchForm";
import { ResultsTable } from "@/components/ResultsTable";
import { Header } from "@/components/Header";
import { InfoSection } from "@/components/InfoSection";
import { mockCompareAPI } from "./api/compare";

export interface ProductResult {
  marketplace: string;
  productUrl: string;
  productTitle: string;
  variant?: string;
  listedPrice: number;
  shippingFee: number;
  effectivePrice: number;
  currency: 'INR';
  inStock: boolean;
  offerNotes: string[];
  deliveryEta?: string;
  matchConfidence: number;
  lastCheckedISO: string;
}

export interface CompareResponse {
  signature: {
    sourceSite: string;
    inputUrl: string;
    canonicalName: string;
    model?: string;
    asin?: string;
    gtin?: string;
    variant: Record<string, string>;
  };
  results: ProductResult[];
  bestBuy?: {
    marketplace: string;
    link: string;
    effectivePrice: number;
    rationale: string[];
  };
  savedToSheet: boolean;
  sheetRowIds?: string[];
}

const Index = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompareResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (url: string) => {
    if (!url.trim()) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid product URL",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const data = await mockCompareAPI(url);
      setResults(data);
      
      if (data.savedToSheet) {
        toast({
          title: "Success",
          description: "Price comparison completed and saved to Google Sheets",
          duration: 4000,
        });
      } else {
        toast({
          title: "Comparison Complete",
          description: "Price comparison completed",
          duration: 3000,
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Header />
        
        <main className="space-y-8">
          <SearchForm onSearch={handleSearch} loading={loading} />
          
          {error && (
            <div className="animate-fade-in bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive font-medium">Error: {error}</p>
            </div>
          )}
          
          {results && (
            <div className="animate-slide-up">
              <ResultsTable results={results} />
            </div>
          )}
          
          <InfoSection />
        </main>
      </div>
    </div>
  );
};

export default Index;