import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Phone as PhoneIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import UserLayout from '@/components/UserLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const RewardsCatalog = () => {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['reward-products'],
    queryFn: async () => {
      const { data } = await supabase.from('reward_products').select('*').order('points_cost');
      return data || [];
    },
  });

  const { data: stores = [] } = useQuery({
    queryKey: ['store-locations'],
    queryFn: async () => {
      const { data } = await supabase.from('store_locations').select('*');
      return data || [];
    },
  });

  const filtered = products.filter((p: any) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const userPoints = profile?.points || 0;

  const handleRedeem = (product: any) => {
    if (userPoints < product.points_cost) {
      toast({ title: 'Not enough points', description: `You need ${product.points_cost - userPoints} more points`, variant: 'destructive' });
      return;
    }
    setSelectedProduct(product);
    setShowStoreDialog(true);
  };

  const handleConfirmRedeem = async (store: any) => {
    if (!user || !selectedProduct) return;

    await supabase.from('redemptions').insert({
      user_id: user.id,
      user_name: profile?.name || '',
      product_name: selectedProduct.name,
      points_used: selectedProduct.points_cost,
      type: 'store_pickup' as any,
      store_address: store.address,
      store_phone: store.phone,
    });

    // Deduct points
    await supabase.from('profiles').update({
      points: userPoints - selectedProduct.points_cost,
      total_redeemed: (profile?.total_redeemed || 0) + selectedProduct.points_cost,
    }).eq('user_id', user.id);

    // Update stock
    await supabase.from('reward_products').update({
      stock: selectedProduct.stock - 1,
    }).eq('id', selectedProduct.id);

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      type: 'redeem' as any,
      description: `Redeemed ${selectedProduct.name}`,
      points: -selectedProduct.points_cost,
    });

    toast({ title: 'Reward Redeemed! 🎉', description: `Your ${selectedProduct.name} is ready for pickup` });
    setShowStoreDialog(false);
    setSelectedProduct(null);
    await refreshProfile();
    queryClient.invalidateQueries({ queryKey: ['reward-products'] });
  };

  return (
    <UserLayout>
      <div className="gradient-primary px-6 pt-8 pb-12 text-primary-foreground">
        <h1 className="text-xl font-bold mb-4">Rewards Catalog</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search rewards..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50" />
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{filtered.length} rewards available</span>
          <span className="text-sm font-medium text-primary">{userPoints.toLocaleString()} pts available</span>
        </div>

        {filtered.map((product: any, i: number) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl border border-border p-4 flex gap-4 items-center">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">{product.image}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm">{product.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{product.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-primary">{product.points_cost} pts</span>
                <span className="text-xs text-muted-foreground">• {product.stock} left</span>
              </div>
            </div>
            <Button size="sm" onClick={() => handleRedeem(product)} disabled={userPoints < product.points_cost || product.stock <= 0} className="shrink-0">
              Redeem
            </Button>
          </motion.div>
        ))}
      </div>

      <Dialog open={showStoreDialog} onOpenChange={setShowStoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Pickup Store</DialogTitle>
            <DialogDescription>Select a store to pick up your {selectedProduct?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {stores.map((store: any) => (
              <button key={store.id} onClick={() => handleConfirmRedeem(store)} className="w-full text-left bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors">
                <h4 className="font-medium text-foreground text-sm">{store.name}</h4>
                <div className="flex items-start gap-1 mt-1 text-xs text-muted-foreground">
                  <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>{store.address}</span>
                </div>
                <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                  <PhoneIcon className="w-3 h-3" />
                  <span>{store.phone}</span>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

export default RewardsCatalog;
