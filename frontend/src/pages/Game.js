import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Trophy, Sparkles, Gift, Tag, Frown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const WHEEL_SEGMENTS = [
  { result: 'free_product', label: 'Free Product', color: '#8DA399', icon: Gift },
  { result: 'no_win', label: 'Try Again', color: '#E5E7EB', icon: Frown },
  { result: 'discount', label: 'Discount', color: '#E3C565', icon: Tag },
  { result: 'no_win', label: 'Better Luck', color: '#E5E7EB', icon: Frown },
  { result: 'free_card', label: 'Free Card', color: '#C78D75', icon: Gift },
  { result: 'no_win', label: 'Next Time', color: '#E5E7EB', icon: Frown },
  { result: 'discount', label: 'Discount', color: '#E3C565', icon: Tag },
  { result: 'no_win', label: 'Almost!', color: '#E5E7EB', icon: Frown },
];

export default function Game() {
  const [canPlay, setCanPlay] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [reward, setReward] = useState(null);
  
  useEffect(() => {
    checkCanPlay();
  }, []);
  
  const checkCanPlay = async () => {
    try {
      const response = await axios.get(`${API}/game/can-play`, {
        withCredentials: true
      });
      setCanPlay(response.data.can_play);
    } catch (error) {
      toast.error('Failed to check game status');
    }
  };
  
  const spinWheel = async () => {
    if (spinning || !canPlay) return;
    
    setSpinning(true);
    setResult(null);
    setReward(null);
    
    try {
      const response = await axios.post(`${API}/game/spin`, {}, {
        withCredentials: true
      });
      
      if (response.data.result === 'already_played') {
        toast.info(response.data.message);
        setCanPlay(false);
        setSpinning(false);
        return;
      }
      
      // Calculate rotation based on result
      const resultSegmentIndex = WHEEL_SEGMENTS.findIndex(seg => seg.result === response.data.result);
      const segmentAngle = 360 / WHEEL_SEGMENTS.length;
      const targetRotation = (360 * 5) + (resultSegmentIndex * segmentAngle) + (segmentAngle / 2);
      
      setRotation(targetRotation);
      
      // Wait for animation
      setTimeout(() => {
        setResult(response.data.result);
        setReward(response.data.reward);
        setSpinning(false);
        setCanPlay(false);
        
        if (response.data.result !== 'no_win') {
          toast.success(response.data.message);
        } else {
          toast.info(response.data.message);
        }
      }, 3000);
    } catch (error) {
      toast.error('Failed to spin');
      setSpinning(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F7F2] to-[#F0EFEA]">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <Trophy className="w-16 h-16 mx-auto mb-4 text-accent" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="game-title">
            Spin & Win!
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Try your luck once a day to win free products, discounts, or handmade cards!
          </p>
        </div>
        
        {/* Wheel Container */}
        <div className="relative max-w-lg mx-auto mb-12">
          {/* Arrow Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-20">
            <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-primary"></div>
          </div>
          
          {/* Wheel */}
          <div className="spin-wheel-container">
            <motion.div
              className="spin-wheel relative w-full aspect-square rounded-full shadow-lifted overflow-hidden"
              style={{
                transform: `rotate(${rotation}deg)`
              }}
              animate={{ rotate: rotation }}
              transition={{ duration: 3, ease: 'easeOut' }}
              data-testid="spin-wheel"
            >
              {WHEEL_SEGMENTS.map((segment, index) => {
                const segmentAngle = 360 / WHEEL_SEGMENTS.length;
                const rotation = index * segmentAngle;
                
                return (
                  <div
                    key={index}
                    className="absolute inset-0"
                    style={{
                      transform: `rotate(${rotation}deg)`,
                      clipPath: `polygon(50% 50%, ${50 + 50 * Math.cos(0)}% ${50 + 50 * Math.sin(0)}%, ${50 + 50 * Math.cos((segmentAngle * Math.PI) / 180)}% ${50 + 50 * Math.sin((segmentAngle * Math.PI) / 180)}%)`
                    }}
                  >
                    <div 
                      className="w-full h-full flex items-start justify-center pt-8"
                      style={{ backgroundColor: segment.color }}
                    >
                      <div className="text-center" style={{ transform: `rotate(-${rotation + segmentAngle/2}deg)` }}>
                        <segment.icon className="w-8 h-8 mx-auto mb-1" style={{ color: segment.color === '#E5E7EB' ? '#666' : 'white' }} />
                        <span className="text-xs font-semibold block" style={{ color: segment.color === '#E5E7EB' ? '#666' : 'white' }}>
                          {segment.label}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {/* Center Circle */}
              <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-accent" />
              </div>
            </motion.div>
          </div>
          
          {/* Spin Button */}
          <div className="text-center mt-8">
            <Button
              size="lg"
              onClick={spinWheel}
              disabled={!canPlay || spinning}
              className="rounded-full px-12 shadow-soft hover:shadow-lifted hover:-translate-y-1 transition-all"
              data-testid="spin-button"
            >
              {spinning ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Spinning...
                </>
              ) : canPlay === false ? (
                'Come Back Tomorrow!'
              ) : canPlay === null ? (
                'Loading...'
              ) : (
                <>
                  <Trophy className="w-5 h-5 mr-2" />
                  Spin Now!
                </>
              )}
            </Button>
            
            {canPlay === false && !spinning && (
              <p className="text-sm text-muted-foreground mt-3">
                You've already played today. Try again tomorrow!
              </p>
            )}
          </div>
        </div>
        
        {/* Result Display */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-8 shadow-lifted text-center max-w-md mx-auto"
            data-testid="game-result"
          >
            {result !== 'no_win' ? (
              <>
                <Trophy className="w-16 h-16 mx-auto mb-4 text-accent" />
                <h2 className="text-3xl font-bold mb-3">Congratulations!</h2>
                {reward && (
                  <>
                    <p className="text-lg text-muted-foreground mb-4">
                      {reward.description}
                    </p>
                    <Button
                      onClick={() => window.location.href = '/rewards'}
                      className="rounded-full"
                      data-testid="view-rewards-button"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      View My Rewards
                    </Button>
                  </>
                )}
              </>
            ) : (
              <>
                <Frown className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-bold mb-3">Better Luck Next Time!</h2>
                <p className="text-muted-foreground mb-4">
                  Come back tomorrow for another chance to win!
                </p>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/products'}
                  className="rounded-full"
                  data-testid="browse-products-button"
                >
                  Browse Products
                </Button>
              </>
            )}
          </motion.div>
        )}
        
        {/* Rules */}
        <div className="mt-12 bg-white rounded-2xl p-6 shadow-soft max-w-2xl mx-auto">
          <h3 className="text-xl font-semibold mb-4">Game Rules</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>You can spin the wheel once per day</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Win free products, discount coupons, or handmade cards</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Rewards expire after 30 days</span>
            </li>
            <li className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span>Redeem rewards at checkout</span>
            </li>
          </ul>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}