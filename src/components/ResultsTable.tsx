import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ExternalLink, Crown, Check, X } from "lucide-react";
import { CompareResponse } from "@/pages/Index";

interface ResultsTableProps {
  results: CompareResponse;
}

export const ResultsTable = ({ results }: ResultsTableProps) => {
  const { signature, results: priceResults, bestBuy } = results;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getMarketplaceLogo = (marketplace: string) => {
    // In a real app, you'd have actual logos
    const colors = {
      'amazon': 'bg-orange-500',
      'flipkart': 'bg-blue-500',
      'croma': 'bg-red-500',
      'reliance': 'bg-purple-500',
      'tata': 'bg-green-500',
    };
    return colors[marketplace.toLowerCase() as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-3 w-3 bg-success rounded-full animate-glow"></div>
            Product Found: {signature.canonicalName}
          </CardTitle>
          {signature.model && (
            <p className="text-muted-foreground">Model: {signature.model}</p>
          )}
        </CardHeader>
      </Card>

      {bestBuy && (
        <Card className="border-success/20 bg-success/5 shadow-glow animate-bounce-in">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Crown className="h-6 w-6 text-accent" />
                <div>
                  <h3 className="text-lg font-semibold">Best Buy</h3>
                  <p className="text-2xl font-bold text-success">
                    {formatPrice(bestBuy.effectivePrice)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    at {bestBuy.marketplace}
                  </p>
                </div>
              </div>
              <Button 
                asChild
                className="bg-gradient-accent hover:bg-accent/90 transition-smooth"
              >
                <a
                  href={bestBuy.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Buy Now <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
            {bestBuy.rationale && bestBuy.rationale.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {bestBuy.rationale.map((reason, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {reason}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Price Comparison</CardTitle>
          <p className="text-sm text-muted-foreground">
            Last checked: {new Date().toLocaleString('en-IN')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marketplace</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Listed Price</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead className="font-semibold">Effective Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Offers</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {priceResults.map((result, index) => (
                  <TableRow key={index} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getMarketplaceLogo(result.marketplace)}`}></div>
                        <span className="font-medium">{result.marketplace}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{result.productTitle}</p>
                        {result.variant && (
                          <p className="text-xs text-muted-foreground">{result.variant}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatPrice(result.listedPrice)}</TableCell>
                    <TableCell>
                      {result.shippingFee > 0 ? formatPrice(result.shippingFee) : 'Free'}
                    </TableCell>
                    <TableCell className="font-bold text-lg">
                      {formatPrice(result.effectivePrice)}
                      {result.effectivePrice === bestBuy?.effectivePrice && (
                        <Crown className="inline ml-1 h-4 w-4 text-accent" />
                      )}
                    </TableCell>
                    <TableCell>
                      {result.inStock ? (
                        <Check className="h-4 w-4 text-success" />
                      ) : (
                        <X className="h-4 w-4 text-destructive" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {result.offerNotes.slice(0, 2).map((offer, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {offer}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="transition-smooth hover:bg-primary hover:text-primary-foreground"
                      >
                        <a
                          href={result.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};