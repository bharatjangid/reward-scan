import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AdminRewards = () => {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState({ name: '', description: '', pointsCost: '', image: '', category: '', stock: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [] } = useQuery({
    queryKey: ['admin-reward-products'],
    queryFn: async () => {
      const { data } = await supabase.from('reward_products').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', pointsCost: String(p.points_cost), image: p.image, category: p.category, stock: String(p.stock) });
    setShowForm(true);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '', pointsCost: '', image: '🎁', category: '', stock: '' });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.pointsCost) return;
    if (editing) {
      await supabase.from('reward_products').update({
        name: form.name,
        description: form.description,
        points_cost: parseInt(form.pointsCost),
        image: form.image,
        category: form.category,
        stock: parseInt(form.stock) || 0,
      }).eq('id', editing.id);
      toast({ title: 'Reward updated' });
    } else {
      await supabase.from('reward_products').insert({
        name: form.name,
        description: form.description,
        points_cost: parseInt(form.pointsCost),
        image: form.image || '🎁',
        category: form.category || 'General',
        stock: parseInt(form.stock) || 0,
      });
      toast({ title: 'Reward added' });
    }
    setShowForm(false);
    queryClient.invalidateQueries({ queryKey: ['admin-reward-products'] });
  };

  const handleDelete = async (id: string) => {
    await supabase.from('reward_products').delete().eq('id', id);
    toast({ title: 'Reward deleted' });
    queryClient.invalidateQueries({ queryKey: ['admin-reward-products'] });
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reward Products</h1>
            <p className="text-sm text-muted-foreground">{products.length} products in catalog</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="w-4 h-4" /> Add Reward
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p: any) => (
            <div key={p.id} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-2xl">{p.image}</div>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(p)}><Edit2 className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(p.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                </div>
              </div>
              <h3 className="font-semibold text-foreground text-sm">{p.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
              <div className="flex items-center justify-between mt-3">
                <span className="text-sm font-bold text-primary">{p.points_cost} pts</span>
                <span className="text-xs text-muted-foreground">{p.stock} in stock</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit' : 'Add'} Reward</DialogTitle>
            <DialogDescription>Manage your reward catalog</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Input placeholder="Points cost" type="number" value={form.pointsCost} onChange={(e) => setForm({ ...form, pointsCost: e.target.value })} />
            <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <Input placeholder="Stock quantity" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            <Input placeholder="Emoji icon (e.g., 🎁)" value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} />
            <Button onClick={handleSave} className="w-full">{editing ? 'Update' : 'Add'} Reward</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminRewards;
