import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ShoppingCart, Gift, Trophy, LogOut, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Header() {
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    checkAuth();
  }, []);
  
  const checkAuth = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, {
        withCredentials: true
      });
      setUser(response.data);
    } catch (error) {
      setUser(null);
    }
  };
  
  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img 
              src="https://customer-assets.emergentagent.com/job_crochet-lucky/artifacts/lpdgvd71_1cd9b656-4f95-4983-9ee1-eac9a8b25537.jpg" 
              alt="S² Creation" 
              className="h-12 sm:h-16 w-auto"
              data-testid="header-logo"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/products" 
              className="text-sm font-medium hover:text-primary transition-colors"
              data-testid="nav-products"
            >
              Products
            </Link>
            <Link 
              to="/game" 
              className="text-sm font-medium hover:text-primary transition-colors"
              data-testid="nav-game"
            >
              <Trophy className="w-4 h-4 inline mr-1" />
              Play & Win
            </Link>
            <Link 
              to="/about" 
              className="text-sm font-medium hover:text-primary transition-colors"
              data-testid="nav-about"
            >
              About
            </Link>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {user ? (
              <>
                <Link to="/rewards" data-testid="nav-rewards">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Gift className="w-4 h-4 mr-2" />
                    Rewards
                  </Button>
                  <Button variant="ghost" size="icon" className="sm:hidden">
                    <Gift className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/cart" data-testid="nav-cart">
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="w-5 h-5" />
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="hidden sm:flex"
                  data-testid="logout-button"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" data-testid="login-button">
                <Button className="rounded-full" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="mobile-menu-button"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-3">
              <Link 
                to="/products" 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/game" 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="w-4 h-4 inline mr-1" />
                Play & Win
              </Link>
              <Link 
                to="/about" 
                className="text-sm font-medium hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              {user && (
                <>
                  <Link 
                    to="/rewards" 
                    className="text-sm font-medium hover:text-primary transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Gift className="w-4 h-4 inline mr-1" />
                    Rewards
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-sm font-medium hover:text-primary transition-colors py-2 text-left"
                  >
                    <LogOut className="w-4 h-4 inline mr-1" />
                    Logout
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}