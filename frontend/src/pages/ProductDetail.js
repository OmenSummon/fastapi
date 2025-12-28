import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Clock, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  
  useEffect(() => {
    fetchProduct();
  }, [productId]);
  
  const fetchProduct = async () => {
    try {
      const response = await axios.get(`${API}/products/${productId}`);
      setProduct(response.data);
    } catch (error) {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };
  
  const addToCart = () => {
    // Get existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingIndex = cart.findIndex(item => item.product_id === product.product_id);
    
    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    toast.success('Added to cart!');
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (!product) return null;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl overflow-hidden shadow-soft mb-4"
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full aspect-square object-cover"
                data-testid="product-detail-image"
              />
            </motion.div>
            
            {/* Thumbnail Gallery */}
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-1 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    } hover:border-primary transition-colors`}
                    data-testid={`thumbnail-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Product Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-xs text-primary uppercase tracking-wider mb-2 font-semibold">
                {product.category}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="product-detail-name">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl font-bold font-accent text-primary" data-testid="product-detail-price">
                  ₹{product.price}
                </span>
                {product.stock > 0 && product.stock < 5 && (
                  <span className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Only {product.stock} left!
                  </span>
                )}
              </div>
              
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                {product.description}
              </p>
              
              {/* Product Details */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-sm"><strong>Time Taken:</strong> {product.time_taken}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-primary" />
                  <span className="text-sm">
                    <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                  </span>
                </div>
              </div>
              
              {/* The Story */}
              <div className="bg-white rounded-2xl p-6 mb-8 shadow-soft">
                <h2 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                  <Heart className="w-6 h-6 text-secondary" />
                  The Story
                </h2>
                <p className="text-muted-foreground leading-relaxed italic">
                  "{product.story}"
                </p>
                <p className="text-sm text-primary font-accent text-lg mt-3">- Whispering Hands</p>
              </div>
              
              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 rounded-full shadow-soft hover:shadow-lifted hover:-translate-y-1 transition-all"
                  disabled={product.stock === 0}
                  onClick={addToCart}
                  data-testid="add-to-cart-button"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full"
                  onClick={() => navigate('/game')}
                  data-testid="try-luck-button"
                >
                  Try Your Luck to Win!
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}