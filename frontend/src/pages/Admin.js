import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, Package, Trophy, Settings, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Admin() {
  const [analytics, setAnalytics] = useState(null);
  const [products, setProducts] = useState([]);
  const [settings, setSettings] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  useEffect(() => {
    fetchAnalytics();
    fetchProducts();
    fetchSettings();
  }, []);
  
  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`${API}/admin/analytics`, {
        withCredentials: true
      });
      setAnalytics(response.data);
    } catch (error) {
      toast.error('Failed to load analytics');
    }
  };
  
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to load products');
    }
  };
  
  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/admin/settings`, {
        withCredentials: true
      });
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    }
  };
  
  const handleSaveProduct = async (productData) => {
    try {
      if (editingProduct?.product_id) {
        await axios.put(`${API}/products/${editingProduct.product_id}`, productData, {
          withCredentials: true
        });
        toast.success('Product updated');
      } else {
        await axios.post(`${API}/products`, productData, {
          withCredentials: true
        });
        toast.success('Product created');
      }
      fetchProducts();
      setDialogOpen(false);
      setEditingProduct(null);
    } catch (error) {
      toast.error('Failed to save product');
    }
  };
  
  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API}/products/${productId}`, {
        withCredentials: true
      });
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };
  
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${API}/admin/settings`, settings, {
        withCredentials: true
      });
      toast.success('Settings updated');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    }
  };
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-8" data-testid="admin-title">
          Admin Dashboard
        </h1>
        
        <Tabs defaultValue="analytics" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics" data-testid="analytics-tab">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="products" data-testid="products-tab">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="settings" data-testid="settings-tab">
              <Settings className="w-4 h-4 mr-2" />
              Game Settings
            </TabsTrigger>
          </TabsList>
          
          {/* Analytics Tab */}
          <TabsContent value="analytics">
            {analytics && (
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="stat-attempts">
                  <Trophy className="w-8 h-8 text-accent mb-2" />
                  <p className="text-sm text-muted-foreground">Attempts Today</p>
                  <p className="text-3xl font-bold">{analytics.total_attempts_today}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="stat-wins">
                  <Trophy className="w-8 h-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Wins Today</p>
                  <p className="text-3xl font-bold">{analytics.wins_today}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="stat-win-rate">
                  <BarChart3 className="w-8 h-8 text-secondary mb-2" />
                  <p className="text-sm text-muted-foreground">Win Rate</p>
                  <p className="text-3xl font-bold">{(analytics.win_rate_today * 100).toFixed(1)}%</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="stat-orders">
                  <Package className="w-8 h-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-3xl font-bold">{analytics.total_orders}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="stat-revenue">
                  <BarChart3 className="w-8 h-8 text-accent-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-3xl font-bold">₹{analytics.total_revenue.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-soft" data-testid="stat-products">
                  <Package className="w-8 h-8 text-secondary mb-2" />
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-3xl font-bold">{analytics.total_products}</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Products Tab */}
          <TabsContent value="products">
            <div className="mb-4">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingProduct(null)} data-testid="add-product-button">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingProduct?.product_id ? 'Edit Product' : 'Add New Product'}
                    </DialogTitle>
                  </DialogHeader>
                  <ProductForm
                    product={editingProduct}
                    onSave={handleSaveProduct}
                    onCancel={() => { setDialogOpen(false); setEditingProduct(null); }}
                  />
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid gap-4" data-testid="products-list">
              {products.map(product => (
                <div key={product.product_id} className="bg-white rounded-xl p-6 shadow-soft flex items-center gap-4">
                  <img src={product.images[0]} alt={product.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category} - ₹{product.price}</p>
                    <p className="text-xs text-muted-foreground">Stock: {product.stock}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setEditingProduct(product); setDialogOpen(true); }}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.product_id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            {settings && (
              <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 shadow-soft space-y-6">
                <div>
                  <Label>Free Product Probability</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={settings.free_product_probability}
                    onChange={(e) => setSettings({...settings, free_product_probability: parseFloat(e.target.value)})}
                    data-testid="free-product-prob"
                  />
                </div>
                <div>
                  <Label>Discount Probability</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={settings.discount_probability}
                    onChange={(e) => setSettings({...settings, discount_probability: parseFloat(e.target.value)})}
                    data-testid="discount-prob"
                  />
                </div>
                <div>
                  <Label>Free Card Probability</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={settings.free_card_probability}
                    onChange={(e) => setSettings({...settings, free_card_probability: parseFloat(e.target.value)})}
                    data-testid="free-card-prob"
                  />
                </div>
                <div>
                  <Label>No Win Probability</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={settings.no_win_probability}
                    onChange={(e) => setSettings({...settings, no_win_probability: parseFloat(e.target.value)})}
                    data-testid="no-win-prob"
                  />
                </div>
                <div>
                  <Label>Discount Amount (₹)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={settings.discount_amount}
                    onChange={(e) => setSettings({...settings, discount_amount: parseInt(e.target.value)})}
                    data-testid="discount-amount"
                  />
                </div>
                <Button type="submit" data-testid="save-settings-button">Save Settings</Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
}

function ProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    story: product?.story || '',
    time_taken: product?.time_taken || '',
    category: product?.category || 'crochet',
    price: product?.price || 0,
    stock: product?.stock || 0,
    images: product?.images?.join(', ') || '',
    game_eligible: product?.game_eligible ?? true
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      images: formData.images.split(',').map(url => url.trim()).filter(Boolean)
    };
    onSave(data);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} required />
      </div>
      <div>
        <Label>Story</Label>
        <Textarea value={formData.story} onChange={(e) => setFormData({...formData, story: e.target.value})} required />
      </div>
      <div>
        <Label>Time Taken</Label>
        <Input value={formData.time_taken} onChange={(e) => setFormData({...formData, time_taken: e.target.value})} required />
      </div>
      <div>
        <Label>Category</Label>
        <Select value={formData.category} onValueChange={(val) => setFormData({...formData, category: val})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="crochet">Crochet</SelectItem>
            <SelectItem value="cards">Cards</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Price (₹)</Label>
          <Input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})} required />
        </div>
        <div>
          <Label>Stock</Label>
          <Input type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})} required />
        </div>
      </div>
      <div>
        <Label>Images (comma-separated URLs)</Label>
        <Textarea value={formData.images} onChange={(e) => setFormData({...formData, images: e.target.value})} required />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={formData.game_eligible} onChange={(e) => setFormData({...formData, game_eligible: e.target.checked})} />
        <Label>Game Eligible</Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit">Save</Button>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}