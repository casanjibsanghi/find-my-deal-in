import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Loader2 } from "lucide-react";

interface SearchFormProps {
  onSearch: (url: string) => void;
  loading: boolean;
}

export const SearchForm = ({ onSearch, loading }: SearchFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(url);
  };

  const handleTryExample = () => {
    const exampleUrl = "https://www.amazon.in/dp/B08N5WRWNW";
    setUrl(exampleUrl);
    onSearch(exampleUrl);
  };

  return (
    <Card className="shadow-elegant animate-fade-in">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <Input
                type="url"
                placeholder="Paste product URL from Amazon, Flipkart, Meesho, Zepto, Myntra, Nykaa..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-12 text-lg"
                disabled={loading}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !url.trim()}
              className="h-12 px-8 bg-gradient-primary hover:bg-primary/90 transition-smooth"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Compare Prices
                </>
              )}
            </Button>
          </div>
        </form>
        
        <div className="flex justify-center mt-4">
          <Button
            variant="ghost"
            onClick={handleTryExample}
            disabled={loading}
            className="text-muted-foreground hover:text-foreground"
          >
            Try sample product
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};