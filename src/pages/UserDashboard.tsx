import { motion } from 'framer-motion';
import { Gift, TrendingUp, QrCode, ArrowUpRight, ArrowDownRight, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserLayout from '@/components/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const UserDashboard = () => {
  const { profile, user } = useAuth();

  const { data: activity = [] } = useQuery({
    queryKey: ['activity', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('activity_logs').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(4);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <UserLayout>
      <div className="gradient-primary px-6 pt-8 pb-20 text-primary-foreground">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/80 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold">{profile?.name || 'User'}</h1>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-lg font-bold">{profile?.name?.charAt(0) || 'U'}</span>
          </Link>
        </div>
      </div>

      <div className="px-6 -mt-14 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl shadow-xl p-5 reward-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Available Points</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3" /> Member
            </span>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-bold text-foreground animate-count-up">{(profile?.points || 0).toLocaleString()}</span>
            <span className="text-muted-foreground text-sm mb-1">pts</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <ArrowUpRight className="w-4 h-4 text-success" />
              <span className="text-muted-foreground">Earned:</span>
              <span className="font-medium text-foreground">{(profile?.total_earned || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <ArrowDownRight className="w-4 h-4 text-destructive" />
              <span className="text-muted-foreground">Used:</span>
              <span className="font-medium text-foreground">{(profile?.total_redeemed || 0).toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-3 gap-3">
          <Link to="/scan" className="bg-card rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow border border-border">
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center mx-auto mb-2">
              <QrCode className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">Scan QR</span>
          </Link>
          <Link to="/rewards" className="bg-card rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow border border-border">
            <div className="w-10 h-10 rounded-lg gradient-gold flex items-center justify-center mx-auto mb-2">
              <Gift className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">Rewards</span>
          </Link>
          <Link to="/wallet" className="bg-card rounded-xl p-4 text-center shadow-sm hover:shadow-md transition-shadow border border-border">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-2">
              <TrendingUp className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground">Withdraw</span>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
            <Link to="/wallet" className="text-xs text-primary flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {activity.length === 0 && (
              <p className="p-4 text-sm text-muted-foreground text-center">No activity yet. Scan a QR code to get started!</p>
            )}
            {activity.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 p-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.points > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  {a.points > 0 ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.description}</p>
                  <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-sm font-semibold ${a.points > 0 ? 'text-success' : 'text-destructive'}`}>
                  {a.points > 0 ? '+' : ''}{a.points}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </UserLayout>
  );
};

export default UserDashboard;
