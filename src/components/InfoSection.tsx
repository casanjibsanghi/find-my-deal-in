import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Shield, Zap } from "lucide-react";

export const InfoSection = () => {
  return (
    <div className="space-y-6 mt-12">
      <Card className="shadow-card">
        <CardContent className="p-6">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="how-we-compare">
              <AccordionTrigger className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                How We Compare Prices
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  PriceScout IN extracts product identifiers (ASIN, model numbers, GTIN) from your input URL 
                  and searches across major Indian marketplaces for the exact same product.
                </p>
                <p>
                  We calculate "effective price" as: Base Price + Shipping Fee - Auto-applied discounts. 
                  Bank offers and conditional discounts are shown separately for transparency.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="data-sources">
              <AccordionTrigger className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-primary" />
                Data Sources & Accuracy
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p>
                  We search across Amazon, Flipkart, Meesho, Zepto, BB Daily, Instamart, 
                  Myntra, Nykaa, Croma, Reliance Digital, and other major Indian marketplaces.
                </p>
                <p>
                  Product matching uses ASIN/model numbers for highest accuracy, falling back to 
                  fuzzy title matching with variant details. Match confidence is shown for each result.
                </p>
                <p>
                  All comparisons are logged to Google Sheets for transparency and historical tracking.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="disclaimer">
              <AccordionTrigger className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                Important Disclaimer
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground space-y-2">
                <p className="font-medium">
                  Prices and offers change rapidly. Always verify final price on the merchant website.
                </p>
                <p>
                  Bank offers, exchange values, and promotional discounts may have specific terms and conditions. 
                  We display publicly visible information but cannot guarantee eligibility or availability.
                </p>
                <p>
                  Product availability, delivery estimates, and return policies may vary by merchant.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};