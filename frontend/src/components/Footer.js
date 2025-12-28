import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <img 
              src="https://customer-assets.emergentagent.com/job_crochet-lucky/artifacts/lpdgvd71_1cd9b656-4f95-4983-9ee1-eac9a8b25537.jpg" 
              alt="S² Creation" 
              className="h-16 w-auto mb-4"
            />
            <p className="text-sm text-muted-foreground max-w-md">
              Handmade with Love. Won with Luck. Every piece is crafted with care, 
              telling a unique story of creativity and passion.
            </p>
            <p className="mt-4 text-sm text-primary font-accent text-lg">- Whispering Hands</p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">
                  Shop Products
                </Link>
              </li>
              <li>
                <Link to="/game" className="text-muted-foreground hover:text-primary transition-colors">
                  Play & Win
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/products?category=crochet" className="text-muted-foreground hover:text-primary transition-colors">
                  Crochet Creations
                </Link>
              </li>
              <li>
                <Link to="/products?category=cards" className="text-muted-foreground hover:text-primary transition-colors">
                  Handmade Cards
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
              </div>
    </footer>
  );
}
