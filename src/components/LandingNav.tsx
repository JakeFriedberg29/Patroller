import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const LandingNav = () => {
  return (
    <nav className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">M</span>
            </div>
            <span className="text-xl font-bold text-foreground">Mission</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/about" className="text-foreground/80 hover:text-foreground transition-colors">
              About
            </Link>
            <Link to="/product" className="text-foreground/80 hover:text-foreground transition-colors">
              Product
            </Link>
            <Link to="/customers" className="text-foreground/80 hover:text-foreground transition-colors">
              Customers
            </Link>
            <Link to="/pricing" className="text-foreground/80 hover:text-foreground transition-colors">
              Pricing
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="ghost">Login</Button>
            </Link>
            <Button>Contact Sales</Button>
          </div>
        </div>
      </div>
    </nav>
  );
};