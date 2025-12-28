import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get('category');
  
  useEffect(() => {
    fetchProducts();
  }, [category]);
  
  const fetchProducts = async () => {
    try {
      const url = category ? `${API}/products?category=${category}` : `${API}/products`;
      const response = await axios.get(url);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };
  
  const setCategory = (cat) => {
    if (cat) {
      setSearchParams({ category: cat });
    } else {
      setSearchParams({});
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="products-title">
            Our Collection
          </h1>
          <p className="text-lg text-muted-foreground">
            Handcrafted with love, each piece tells its own story
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-8" data-testid="category-filters">
          <Button
            variant={!category ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setCategory(null)}
            data-testid="filter-all"
          >
            All Products
          </Button>
          <Button
            variant={category === 'crochet' ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setCategory('crochet')}
            data-testid="filter-crochet"
          >
            Crochet
          </Button>
          <Button
            variant={category === 'cards' ? "default" : "outline"}
            className="rounded-full"
            onClick={() => setCategory('cards')}
            data-testid="filter-cards"
          >
            Cards
          </Button>
        </div>
        
        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">No products found. Check back soon!</p>
          </div>
        ) : (
          <div className="masonry-grid" data-testid="products-grid">
            {products.map((product, index) => (
              <motion.div
                key={product.product_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/products/${product.product_id}`}>
                  <div 
                    className="product-card bg-white rounded-2xl overflow-hidden shadow-soft hover:shadow-lifted group"
                    data-testid={`product-card-${product.product_id}`}
                  >
                    {/* Product Image */}
                    <div className="relative overflow-hidden aspect-square">
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        data-testid={`product-image-${product.product_id}`}
                      />
                      {product.stock < 5 && product.stock > 0 && (
                        <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-semibold">
                          Only {product.stock} left!
                        </div>
                      )}
                      {product.stock === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">Sold Out</span>
                        </div>
                      )}
                      {product.game_eligible && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                          Can Win Free!
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="p-5">
                      <div className="text-xs text-primary uppercase tracking-wider mb-2 font-semibold">
                        {product.category}
                      </div>
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors" data-testid={`product-name-${product.product_id}`}>
                        {product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold font-accent text-primary" data-testid={`product-price-${product.product_id}`}>
                          ₹{product.price}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {product.time_taken}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
}