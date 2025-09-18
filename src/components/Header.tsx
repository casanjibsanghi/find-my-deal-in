import { ShoppingCart, Search } from "lucide-react";
import heroBanner from "@/assets/hero-banner.jpg";

export const Header = () => {
  return (
    <header className="relative overflow-hidden rounded-2xl shadow-elegant animate-fade-in">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBanner})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/70"></div>
      </div>
      
      {/* Content */}
      <div className="relative px-8 py-16 text-center space-y-6 text-white">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full shadow-glow">
            <Search className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold">
            PriceScout IN
          </h1>
        </div>
        
        <p className="text-xl md:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90">
          Paste any product link. Get the best price across India.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {[
            'Amazon', 'Flipkart', 'Meesho', 'Zepto', 'BB Daily', 
            'Instamart', 'Myntra', 'Nykaa', 'Croma', 'Reliance Digital'
          ].map((marketplace) => (
            <span
              key={marketplace}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/20 hover:bg-white/20 transition-smooth"
            >
              {marketplace}
            </span>
          ))}
        </div>
      </div>
    </header>
  );
};