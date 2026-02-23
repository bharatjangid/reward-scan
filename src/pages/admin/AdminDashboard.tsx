import { motion } from 'framer-motion';
import { Users, QrCode, Gift, Wallet, ArrowUpRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const AdminDashboard = () => {
  const { data: profiles = [] } = useQuery({
    queryKey: ['admin-profiles'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: batches = [] } = useQuery({
    queryKey: ['admin-batches'],
    queryFn: async () => {
      const { data } = await supabase.from('qr_batches').select('*');
      return data || [];
    },
  });

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['admin-withdrawals'],
    queryFn: async () => {
      const { data } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data } = await supabase.from('reward_products').select('*');
      return data || [];
    },
  });

  const totalQR = batches.reduce((sum: number, b: any) => sum + b.total_codes, 0);
  const redeemedQR = batches.reduce((sum: number, b: any) => sum + b.redeemed_count, 0);
  const pendingWithdrawals = withdrawals.filter((w: any) => w.status === 'pending');
  const pendingAmount = pendingWithdrawals.reduce((sum: number, w: any) => sum + w.amount, 0);

  const stats = [
    { label: 'Total Users', value: String(profiles.length), icon: Users, change: `${profiles.filter((p: any) => new Date(p.created_at) > new Date(Date.now() - 30 * 86400000)).length} this month` },
    { label: 'QR Codes Generated', value: String(totalQR), icon: QrCode, change: `${redeemedQR} redeemed` },
    { label: 'Pending Withdrawals', value: String(pendingWithdrawals.length), icon: Wallet, change: `₹${pendingAmount} pending` },
    { label: 'Active Rewards', value: String(products.length), icon: Gift, change: `${products.filter((p: any) => p.stock > 0).length} in stock` },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your reward program</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-success" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                <p className="text-xs text-success mt-1">{stat.change}</p>
              </motion.div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Users</h3>
            </div>
            <div className="divide-y divide-border">
              {profiles.slice(0, 3).map((u: any) => (
                <div key={u.id} className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {u.name?.charAt(0) || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.phone}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{u.points} pts</span>
                </div>
              ))}
              {profiles.length === 0 && <p className="p-4 text-sm text-muted-foreground">No users yet</p>}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Pending Withdrawals</h3>
            </div>
            <div className="divide-y divide-border">
              {pendingWithdrawals.slice(0, 3).map((w: any) => (
                <div key={w.id} className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{w.user_name}</p>
                    <p className="text-xs text-muted-foreground">{w.bank_name} • {w.account_number}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">₹{w.amount}</span>
                </div>
              ))}
              {pendingWithdrawals.length === 0 && <p className="p-4 text-sm text-muted-foreground">No pending withdrawals</p>}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
