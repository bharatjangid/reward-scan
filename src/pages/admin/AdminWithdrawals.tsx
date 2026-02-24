import { CheckCircle, XCircle, Clock, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AdminWithdrawals = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: withdrawals = [] } = useQuery({
    queryKey: ['admin-all-withdrawals'],
    queryFn: async () => {
      const { data } = await supabase.from('withdrawals').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: redemptions = [] } = useQuery({
    queryKey: ['admin-all-redemptions'],
    queryFn: async () => {
      const { data } = await supabase.from('redemptions').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const handleWithdrawalAction = async (id: string, action: 'approved' | 'rejected') => {
    await supabase.from('withdrawals').update({ status: action as any }).eq('id', id);
    toast({ title: `Withdrawal ${action}` });
    queryClient.invalidateQueries({ queryKey: ['admin-all-withdrawals'] });
  };

  const handleRedemptionAction = async (id: string, status: string) => {
    await supabase.from('redemptions').update({ status: status as any }).eq('id', id);
    toast({ title: `Redemption marked as ${status}` });
    queryClient.invalidateQueries({ queryKey: ['admin-all-redemptions'] });
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-warning/10 text-warning',
      approved: 'bg-success/10 text-success',
      rejected: 'bg-destructive/10 text-destructive',
      dispatched: 'bg-primary/10 text-primary',
      completed: 'bg-success/10 text-success',
    };
    return `text-xs font-medium px-2 py-0.5 rounded-full ${styles[status] || ''}`;
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Withdrawals & Redemptions</h1>

        <Tabs defaultValue="withdrawals">
          <TabsList>
            <TabsTrigger value="withdrawals">Bank Withdrawals</TabsTrigger>
            <TabsTrigger value="redemptions">Product Redemptions</TabsTrigger>
          </TabsList>

          <TabsContent value="withdrawals" className="mt-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Amount</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Bank</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Date</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {withdrawals.map((w: any) => (
                      <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-foreground">{w.user_name}</td>
                        <td className="p-3 text-foreground font-semibold">₹{w.amount}</td>
                        <td className="p-3 text-muted-foreground">{w.bank_name} • {w.account_number?.length > 4 ? '****' + w.account_number.slice(-4) : w.account_number}</td>
                        <td className="p-3"><span className={statusBadge(w.status)}>{w.status}</span></td>
                        <td className="p-3 text-muted-foreground">{new Date(w.created_at).toLocaleDateString()}</td>
                        <td className="p-3 text-right">
                          {w.status === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" className="text-success" onClick={() => handleWithdrawalAction(w.id, 'approved')}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleWithdrawalAction(w.id, 'rejected')}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {withdrawals.length === 0 && (
                      <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No withdrawals yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="redemptions" className="mt-4">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Points</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {redemptions.map((r: any) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-foreground">{r.user_name}</td>
                        <td className="p-3 text-foreground">{r.product_name}</td>
                        <td className="p-3 text-foreground font-semibold">{r.points_used}</td>
                        <td className="p-3 text-muted-foreground capitalize">{r.type.replace('_', ' ')}</td>
                        <td className="p-3"><span className={statusBadge(r.status)}>{r.status}</span></td>
                        <td className="p-3 text-right">
                          {r.status === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <Button size="sm" variant="ghost" className="text-success" onClick={() => handleRedemptionAction(r.id, 'approved')}>Approve</Button>
                              <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRedemptionAction(r.id, 'rejected')}>Reject</Button>
                            </div>
                          )}
                          {r.status === 'approved' && (
                            <Button size="sm" variant="ghost" className="text-primary" onClick={() => handleRedemptionAction(r.id, 'dispatched')}>Dispatch</Button>
                          )}
                          {r.status === 'dispatched' && (
                            <Button size="sm" variant="ghost" className="text-success" onClick={() => handleRedemptionAction(r.id, 'completed')}>Complete</Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {redemptions.length === 0 && (
                      <tr><td colSpan={6} className="p-4 text-center text-muted-foreground">No redemptions yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminWithdrawals;
