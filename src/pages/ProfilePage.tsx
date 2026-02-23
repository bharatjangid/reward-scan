import { motion } from 'framer-motion';
import { Phone, KeyRound, Calendar, LogOut, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import UserLayout from '@/components/UserLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const { data: redemptions = [] } = useQuery({
    queryKey: ['my-redemptions', user?.id],
    queryFn: async () => {
      const { data } = await supabase.from('redemptions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <UserLayout>
      <div className="gradient-primary px-6 pt-8 pb-14 text-primary-foreground text-center">
        <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center mx-auto mb-3">
          <span className="text-2xl font-bold">{profile?.name?.charAt(0) || 'U'}</span>
        </div>
        <h1 className="text-xl font-bold">{profile?.name || 'User'}</h1>
        <p className="text-primary-foreground/70 text-sm">Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : ''}</p>
      </div>

      <div className="px-6 -mt-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl border border-border divide-y divide-border">
          <div className="flex items-center gap-3 p-4">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-foreground">{profile?.phone || user?.phone || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <KeyRound className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Agent Code</p>
              <p className="text-sm font-medium text-foreground">{profile?.agent_code || '-'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm font-medium text-foreground">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-'}</p>
            </div>
          </div>
        </motion.div>

        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">My Redemptions</h2>
          <div className="space-y-2">
            {redemptions.length === 0 && <p className="text-sm text-muted-foreground text-center p-4">No redemptions yet</p>}
            {redemptions.map((r: any) => (
              <div key={r.id} className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-foreground">{r.product_name}</h3>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    r.status === 'completed' ? 'bg-success/10 text-success' :
                    r.status === 'dispatched' ? 'bg-primary/10 text-primary' :
                    r.status === 'pending' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>{r.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">{r.points_used} pts • {r.type.replace('_', ' ')} • {new Date(r.created_at).toLocaleDateString()}</p>
                {r.store_address && (
                  <div className="mt-2 bg-secondary rounded-lg p-2 text-xs text-muted-foreground">
                    <div className="flex items-start gap-1">
                      <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                      <span>{r.store_address}</span>
                    </div>
                    {r.store_phone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="w-3 h-3" />
                        <span>{r.store_phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" className="w-full gap-2 text-destructive" onClick={handleLogout}>
          <LogOut className="w-4 h-4" /> Logout
        </Button>
      </div>
    </UserLayout>
  );
};

export default ProfilePage;
