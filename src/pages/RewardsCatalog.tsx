import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Phone as PhoneIcon, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import UserLayout from '@/components/UserLayout';
import { mockRewardProducts, storeLocations } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const RewardsCatalog = () => {
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<typeof mockRewardProducts[0] | null>(null);
  const [showStoreDialog, setShowStoreDialog] = useState(false);
  const { toast } = useToast();
  const userPoints = 1250;

  const filtered = mockRewardProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleRedeem = (product: typeof mockRewardProducts[0]) => {
    if (userPoints < product.pointsCost) {
      toast({ title: 'Not enough points', description: `You need ${product.pointsCost - userPoints} more points`, variant: 'destructive' });
      return;
    }
    setSelectedProduct(product);
    setShowStoreDialog(true);
  };

  const handleConfirmRedeem = (storeId: string) => {
    toast({ title: 'Reward Redeemed! 🎉', description: `Your ${selectedProduct?.name} is ready for pickup` });
    setShowStoreDialog(false);
    setSelectedProduct(null);
  };

  return (
    <UserLayout>
      <div className="gradient-primary px-6 pt-8 pb-12 text-primary-foreground">
        <h1 className="text-xl font-bold mb-4">Rewards Catalog</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search rewards..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
          />
        </div>
      </div>

      <div className="px-6 -mt-4 space-y-3 pb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{filtered.length} rewards available</span>
          <span className="text-sm font-medium text-primary">{userPoints.toLocaleString()} pts available</span>
        </div>

        {filtered.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-card rounded-xl border border-border p-4 flex gap-4 items-center"
          >
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center text-2xl shrink-0">
              {product.image}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground text-sm">{product.name}</h3>
              <p className="text-xs text-muted-foreground truncate">{product.description}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm font-bold text-primary">{product.pointsCost} pts</span>
                <span className="text-xs text-muted-foreground">• {product.stock} left</span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleRedeem(product)}
              disabled={userPoints < product.pointsCost}
              className="shrink-0"
            >
              Redeem
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Store Selection Dialog */}
      <Dialog open={showStoreDialog} onOpenChange={setShowStoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Choose Pickup Store</DialogTitle>
            <DialogDescription>
              Select a store to pick up your {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            {storeLocations.map((store) => (
              <button
                key={store.id}
                onClick={() => handleConfirmRedeem(store.id)}
                className="w-full text-left bg-secondary rounded-xl p-4 hover:bg-secondary/80 transition-colors"
              >
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
