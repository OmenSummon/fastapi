import { motion } from 'framer-motion';
import { Heart, Scissors, Sparkles } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F9F7F2] to-[#F0EFEA]">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-6" data-testid="about-title">
            Whispering Hands
          </h1>
          <p className="text-xl text-primary font-accent">
            "Every stitch whispers a story"
          </p>
        </motion.div>
        
        {/* Main Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-white rounded-3xl p-8 sm:p-12 shadow-lifted mb-12"
          data-testid="about-story"
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img
                src="https://images.unsplash.com/photo-1617897210309-61331a57ac1f?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Handmade crafting"
                className="rounded-2xl shadow-soft w-full"
              />
            </div>
            
            <div>
              <Heart className="w-12 h-12 text-secondary mb-4" />
              <h2 className="text-3xl font-bold mb-4">Our Journey</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  S² Creation began with a simple love for handmade crafts. What started as a hobby 
                  in a cozy corner has blossomed into a collection of unique crochet pieces and 
                  heartfelt cards.
                </p>
                <p>
                  Each creation is born from hours of careful work, with every stitch and fold 
                  carrying the warmth of human touch. We believe that handmade items aren't just 
                  products—they're pieces of art that tell stories and create connections.
                </p>
                <p>
                  The name "Whispering Hands" reflects our philosophy: our hands whisper love, 
                  care, and creativity into every piece we make.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-soft text-center"
            data-testid="value-handmade"
          >
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Handmade with Love</h3>
            <p className="text-sm text-muted-foreground">
              Every piece is crafted by hand with attention to detail and care that machines can't replicate.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-soft text-center"
            data-testid="value-sustainable"
          >
            <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-8 h-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Sustainable</h3>
            <p className="text-sm text-muted-foreground">
              We use quality materials and sustainable practices, creating products that last and respect our planet.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl p-8 shadow-soft text-center"
            data-testid="value-unique"
          >
            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-accent-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Uniquely Yours</h3>
            <p className="text-sm text-muted-foreground">
              No two pieces are exactly alike. Each item has its own character and tells its own story.
            </p>
          </motion.div>
        </div>
        
        {/* Why Gamification */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary to-secondary p-8 sm:p-12 rounded-3xl shadow-lifted text-white"
          data-testid="why-game"
        >
          <h2 className="text-3xl font-bold mb-4">Why the Lucky Wheel?</h2>
          <p className="text-lg leading-relaxed opacity-90">
            We wanted to add joy and excitement to the handmade shopping experience. Our daily 
            lucky wheel game gives you a chance to win free products or discounts, making each 
            visit memorable. It's our way of sharing the happiness that comes from creating 
            handmade treasures!
          </p>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
}