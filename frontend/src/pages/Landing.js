import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Heart, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F7F2] to-[#F0EFEA]">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-left"
            >
              <div className="inline-block mb-4 px-4 py-2 bg-primary/10 rounded-full">
                <span className="text-primary font-semibold text-sm" data-testid="hero-tagline">
                  Handmade with Love. Won with Luck.
                </span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 text-heading leading-tight">
                Discover Handcrafted
                <span className="block text-primary">Treasures</span>
              </h1>
              
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Explore unique crochet creations and handmade cards crafted with care. 
                Play our daily game for a chance to win free products!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/game" data-testid="hero-game-cta">
                  <Button 
                    size="lg" 
                    className="rounded-full px-8 shadow-lifted hover:-translate-y-1 transition-all group w-full sm:w-auto"
                  >
                    <Trophy className="w-5 h-5 mr-2" />
                    Play & Win
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/products" data-testid="hero-shop-cta">
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="rounded-full px-8 hover:bg-primary/5 w-full sm:w-auto"
                  >
                    <Heart className="w-5 h-5 mr-2" />
                    Shop Collection
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            {/* Right: Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-lifted">
                <img
                  src="https://images.unsplash.com/photo-1728393287642-13bee7126ae8?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Handmade crochet creations"
                  className="w-full h-auto object-cover"
                  data-testid="hero-image"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent"></div>
              </div>
              
              {/* Floating Badge */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-accent text-accent-foreground px-6 py-3 rounded-full shadow-lifted font-accent text-xl"
              >
                <Sparkles className="w-5 h-5 inline mr-2" />
                Win Daily!
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose Us?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Every piece tells a story, every game brings joy
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-lifted transition-all"
              data-testid="feature-handmade"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">100% Handmade</h3>
              <p className="text-muted-foreground">
                Each product is lovingly crafted by hand, making every piece unique and special.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-lifted transition-all"
              data-testid="feature-game"
            >
              <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Daily Lucky Game</h3>
              <p className="text-muted-foreground">
                Spin the wheel once a day for a chance to win free products, discounts, or special cards!
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-soft hover:shadow-lifted transition-all"
              data-testid="feature-story"
            >
              <div className="w-14 h-14 bg-secondary/20 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-secondary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Unique Stories</h3>
              <p className="text-muted-foreground">
                Learn the story behind each creation - the inspiration, time, and love poured into it.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Creations</h2>
            <p className="text-lg text-muted-foreground">Handpicked favorites from our collection</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group relative rounded-2xl overflow-hidden shadow-soft hover:shadow-lifted transition-all"
              data-testid="featured-crochet"
            >
              <img
                src="https://images.unsplash.com/photo-1757583012114-0a48ae0a6e3c?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Crochet Creations"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-3xl font-bold mb-2">Crochet Creations</h3>
                  <p className="mb-4 opacity-90">Dolls, flowers, keychains & more</p>
                  <Link to="/products?category=crochet">
                    <Button className="rounded-full" variant="secondary">
                      Explore Crochet
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="group relative rounded-2xl overflow-hidden shadow-soft hover:shadow-lifted transition-all"
              data-testid="featured-cards"
            >
              <img
                src="https://images.unsplash.com/photo-1758402750917-52aead675b72?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Handmade Cards"
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h3 className="text-3xl font-bold mb-2">Handmade Cards</h3>
                  <p className="mb-4 opacity-90">Birthday, love, custom notes</p>
                  <Link to="/products?category=cards">
                    <Button className="rounded-full" variant="secondary">
                      Explore Cards
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
          
          <div className="text-center">
            <Link to="/products">
              <Button size="lg" variant="outline" className="rounded-full px-8">
                View All Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-primary to-secondary p-12 rounded-3xl shadow-lifted text-white"
          >
            <Trophy className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Ready to Try Your Luck?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Spin the wheel daily for a chance to win handmade treasures!
            </p>
            <Link to="/login" data-testid="cta-play-now">
              <Button 
                size="lg" 
                variant="secondary"
                className="rounded-full px-8 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                Play Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}