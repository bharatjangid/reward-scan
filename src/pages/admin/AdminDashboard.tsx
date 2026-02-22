import { motion } from 'framer-motion';
import { Users, QrCode, Gift, Wallet, TrendingUp, ArrowUpRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { mockUsers, mockQRBatches, mockWithdrawals, mockRedemptions } from '@/lib/mockData';

const stats = [
  { label: 'Total Users', value: '4', icon: Users, change: '+2 this month' },
  { label: 'QR Codes Generated', value: '150', icon: QrCode, change: '57 redeemed' },
  { label: 'Pending Withdrawals', value: '1', icon: Wallet, change: '₹500 pending' },
  { label: 'Active Rewards', value: '8', icon: Gift, change: '3 redeemed today' },
];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Overview of your reward program</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl border border-border p-4"
              >
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

        {/* Recent Activity Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Recent Users</h3>
            </div>
            <div className="divide-y divide-border">
              {mockUsers.slice(0, 3).map(u => (
                <div key={u.id} className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                    {u.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.phone}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">{u.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">Pending Withdrawals</h3>
            </div>
            <div className="divide-y divide-border">
              {mockWithdrawals.filter(w => w.status === 'pending').map(w => (
                <div key={w.id} className="flex items-center gap-3 p-4">
                  <div className="w-8 h-8 rounded-full bg-warning/10 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-warning" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{w.userName}</p>
                    <p className="text-xs text-muted-foreground">{w.bankName} • {w.accountNumber}</p>
                  </div>
                  <span className="text-sm font-semibold text-foreground">₹{w.amount}</span>
                </div>
              ))}
              {mockWithdrawals.filter(w => w.status === 'pending').length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">No pending withdrawals</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
