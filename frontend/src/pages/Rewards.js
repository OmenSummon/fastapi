import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Gift, Calendar, Tag, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Rewards() {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchRewards();
  }, []);
  
  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${API}/rewards`, {
        withCredentials: true
      });
      setRewards(response.data);
    } catch (error) {
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };
  
  const getRewardIcon = (type) => {
    switch (type) {
      case 'free_product':
        return <Package className="w-8 h-8" />;
      case 'discount':
        return <Tag className="w-8 h-8" />;
      case 'free_card':
        return <Gift className="w-8 h-8" />;
      default:
        return <Gift className="w-8 h-8" />;
    }
  };
  
  const getRewardColor = (type) => {
    switch (type) {
      case 'free_product':
        return 'bg-primary/10 text-primary';
      case 'discount':
        return 'bg-accent/20 text-accent-foreground';
      case 'free_card':
        return 'bg-secondary/20 text-secondary';
      default:
        return 'bg-primary/10 text-primary';
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="rewards-title">
            My Rewards
          </h1>
          <p className="text-lg text-muted-foreground">
            Your earned rewards from the lucky wheel game
          </p>
        </div>
        
        {/* Rewards Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-20 h-20 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-semibold mb-2" data-testid="no-rewards-message">
              No rewards yet
            </h2>
            <p className="text-muted-foreground mb-6">
              Play the daily wheel game to win amazing rewards!
            </p>
            <Button
              onClick={() => window.location.href = '/game'}
              className="rounded-full"
              data-testid="play-game-button"
            >
              Play Now
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6" data-testid="rewards-grid">
            {rewards.map((reward, index) => (
              <motion.div
                key={reward.reward_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-soft hover:shadow-lifted transition-all"
                data-testid={`reward-card-${reward.reward_id}`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-4 rounded-xl ${getRewardColor(reward.type)}`}>
                    {getRewardIcon(reward.type)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1" data-testid={`reward-description-${reward.reward_id}`}>
                      {reward.description}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Expires: {new Date(reward.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => window.location.href = '/cart'}
                      className="rounded-full"
                      data-testid={`use-reward-button-${reward.reward_id}`}
                    >
                      Use at Checkout
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}