import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, ShoppingBag, Gift, Tag, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [selectedRewards, setSelectedRewards] = useState([]);
  const [processing, setProcessing] = useState(false);
  
  useEffect(() => {
    loadCart();
    fetchRewards();
  }, []);
  
  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };
  
  const fetchRewards = async () => {
    try {
      const response = await axios.get(`${API}/rewards`, {
        withCredentials: true
      });
      setRewards(response.data);
    } catch (error) {
      console.error('Failed to load rewards');
    }
  };
  
  const updateQuantity = (productId, delta) => {
    const newCart = cart.map(item => {
      if (item.product_id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };
  
  const removeItem = (productId) => {
    const newCart = cart.filter(item => item.product_id !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    toast.success('Item removed');
  };
  
  const toggleReward = (rewardId) => {
    setSelectedRewards(prev => 
      prev.includes(rewardId)
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    );
  };
  
  const calculateTotals = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    selectedRewards.forEach(rewardId => {
      const reward = rewards.find(r => r.reward_id === rewardId);
      if (reward && reward.type === 'discount') {
        discount += parseFloat(reward.value);
      }
    });
    
    return {
      subtotal,
      discount,
      total: Math.max(0, subtotal - discount)
    };
  };
  
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    
    setProcessing(true);
    
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        rewards_applied: selectedRewards
      };
      
      const response = await axios.post(`${API}/orders`, orderData, {
        withCredentials: true
      });
      
      const order = response.data;
      
      if (order.total > 0 && order.razorpay_order_id) {
        // Initialize Razorpay payment
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID || '',
          amount: order.total * 100,
          currency: 'INR',
          order_id: order.razorpay_order_id,
          name: 'S² Creation',
          description: 'Handmade Products',
          handler: async (paymentResponse) => {
            try {
              await axios.post(`${API}/orders/verify-payment`, {
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature
              }, { withCredentials: true });
              
              toast.success('Order placed successfully!');
              localStorage.removeItem('cart');
              setCart([]);
              setSelectedRewards([]);
            } catch (error) {
              toast.error('Payment verification failed');
            }
          },
          theme: {
            color: '#8DA399'
          }
        };
        
        if (window.Razorpay) {
          const razorpay = new window.Razorpay(options);
          razorpay.open();
        } else {
          toast.error('Payment gateway not available');
        }
      } else {
        // Free order (rewards cover everything)
        toast.success('Order placed successfully!');
        localStorage.removeItem('cart');
        setCart([]);
        setSelectedRewards([]);
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Checkout failed');
    } finally {
      setProcessing(false);
    }
  };
  
  const totals = calculateTotals();
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-8" data-testid="cart-title">
          Shopping Cart
        </h1>
        
        {cart.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag className="w-20 h-20 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-2xl font-semibold mb-2" data-testid="empty-cart-message">
              Your cart is empty
            </h2>
            <p className="text-muted-foreground mb-6">
              Start shopping to add items to your cart
            </p>
            <Button
              onClick={() => window.location.href = '/products'}
              className="rounded-full"
              data-testid="shop-now-button"
            >
              Shop Now
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item) => (
                <div 
                  key={item.product_id}
                  className="bg-white rounded-2xl p-6 shadow-soft flex gap-4"
                  data-testid={`cart-item-${item.product_id}`}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    data-testid={`cart-item-image-${item.product_id}`}
                  />
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1" data-testid={`cart-item-name-${item.product_id}`}>
                      {item.name}
                    </h3>
                    <p className="text-primary font-accent text-xl mb-3" data-testid={`cart-item-price-${item.product_id}`}>
                      ₹{item.price}
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 border rounded-full">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.product_id, -1)}
                          data-testid={`decrease-qty-${item.product_id}`}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="min-w-8 text-center" data-testid={`cart-item-qty-${item.product_id}`}>
                          {item.quantity}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 rounded-full"
                          onClick={() => updateQuantity(item.product_id, 1)}
                          data-testid={`increase-qty-${item.product_id}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeItem(item.product_id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-testid={`remove-item-${item.product_id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div className="space-y-6">
              {/* Apply Rewards */}
              {rewards.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="rewards-section">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Apply Rewards
                  </h3>
                  <div className="space-y-3">
                    {rewards.map((reward) => (
                      <div key={reward.reward_id} className="flex items-start gap-3">
                        <Checkbox
                          checked={selectedRewards.includes(reward.reward_id)}
                          onCheckedChange={() => toggleReward(reward.reward_id)}
                          data-testid={`reward-checkbox-${reward.reward_id}`}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{reward.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Expires: {new Date(reward.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Order Summary */}
              <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="order-summary">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span data-testid="subtotal">₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-accent-foreground">
                      <span className="flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        Discount
                      </span>
                      <span data-testid="discount">-₹{totals.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary" data-testid="total">₹{totals.total.toFixed(2)}</span>
                  </div>
                </div>
                
                <Button
                  onClick={handleCheckout}
                  disabled={processing}
                  className="w-full rounded-full shadow-soft hover:shadow-lifted hover:-translate-y-1 transition-all"
                  size="lg"
                  data-testid="checkout-button"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    'Proceed to Checkout'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}