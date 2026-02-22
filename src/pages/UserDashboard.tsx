import { motion } from 'framer-motion';
import { Gift, TrendingUp, QrCode, ArrowUpRight, ArrowDownRight, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserLayout from '@/components/UserLayout';
import { mockActivity } from '@/lib/mockData';

const UserDashboard = () => {
  const userPoints = 1250;
  const totalEarned = 3500;

  return (
    <UserLayout>
      {/* Header */}
      <div className="gradient-primary px-6 pt-8 pb-20 text-primary-foreground">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-primary-foreground/80 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold">Rajesh Kumar</h1>
          </div>
          <Link to="/profile" className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
            <span className="text-lg font-bold">R</span>
          </Link>
        </div>
      </div>

      <div className="px-6 -mt-14 space-y-4">
        {/* Points Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl shadow-xl p-5 reward-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Available Points</span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-gold bg-gold/10 px-2 py-0.5 rounded-full">
              <Star className="w-3 h-3" /> Gold Member
            </span>
          </div>
          <div className="flex items-end gap-2 mb-4">
            <span className="text-4xl font-bold text-foreground animate-count-up">{userPoints.toLocaleString()}</span>
            <span className="text-muted-foreground text-sm mb-1">pts</span>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 text-sm">
              <ArrowUpRight className="w-4 h-4 text-success" />
              <span className="text-muted-foreground">Earned:</span>
              <span className="font-medium text-foreground">{totalEarned.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <ArrowDownRight className="w-4 h-4 text-destructive" />
              <span className="text-muted-foreground">Used:</span>
              <span className="font-medium text-foreground">2,250</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
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

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
            <Link to="/wallet" className="text-xs text-primary flex items-center gap-0.5">
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {mockActivity.slice(0, 4).map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  activity.points > 0 ? 'bg-success/10' : 'bg-destructive/10'
                }`}>
                  {activity.points > 0 ? (
                    <ArrowUpRight className="w-4 h-4 text-success" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-destructive" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.createdAt}</p>
                </div>
                <span className={`text-sm font-semibold ${activity.points > 0 ? 'text-success' : 'text-destructive'}`}>
                  {activity.points > 0 ? '+' : ''}{activity.points}
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
