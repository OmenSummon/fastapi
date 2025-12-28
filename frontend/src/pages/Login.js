import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/products';
  
  const handleLogin = () => {
    // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
    const redirectUrl = window.location.origin + from;
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9F7F2] via-[#F0EFEA] to-primary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white rounded-3xl shadow-lifted p-8 sm:p-12 text-center">
          {/* Logo */}
          <img 
            src="https://customer-assets.emergentagent.com/job_crochet-lucky/artifacts/lpdgvd71_1cd9b656-4f95-4983-9ee1-eac9a8b25537.jpg" 
            alt="S² Creation" 
            className="h-20 w-auto mx-auto mb-6"
            data-testid="login-logo"
          />
          
          <h1 className="text-3xl font-bold mb-3">Welcome Back!</h1>
          <p className="text-muted-foreground mb-8">
            Sign in to explore handmade treasures and play our daily lucky game
          </p>
          
          {/* Decorative element */}
          <div className="flex justify-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-accent" />
            <Sparkles className="w-8 h-8 text-primary" />
            <Sparkles className="w-6 h-6 text-secondary" />
          </div>
          
          <Button 
            onClick={handleLogin}
            size="lg"
            className="w-full rounded-full shadow-soft hover:shadow-lifted hover:-translate-y-1 transition-all"
            data-testid="google-login-button"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign in with Google
          </Button>
          
          <p className="text-sm text-muted-foreground mt-6">
            New here? Your account will be created automatically upon first sign-in.
          </p>
          
          <button
            onClick={() => navigate('/')}
            className="text-sm text-primary hover:underline mt-4"
            data-testid="back-to-home"
          >
            ← Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
}