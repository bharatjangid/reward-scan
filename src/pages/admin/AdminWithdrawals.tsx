import { useState } from 'react';
import { CheckCircle, XCircle, Clock, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdminLayout from '@/components/AdminLayout';
import { mockWithdrawals, mockRedemptions } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminWithdrawals = () => {
  const [withdrawals, setWithdrawals] = useState(mockWithdrawals);
  const [redemptions, setRedemptions] = useState(mockRedemptions);
  const { toast } = useToast();

  const handleWithdrawalAction = (id: string, action: 'approved' | 'rejected') => {
    setWithdrawals(withdrawals.map(w => w.id === id ? { ...w, status: action } : w));
    toast({ title: `Withdrawal ${action}` });
  };

  const handleRedemptionAction = (id: string, status: 'approved' | 'dispatched' | 'completed' | 'rejected') => {
    setRedemptions(redemptions.map(r => r.id === id ? { ...r, status } : r));
    toast({ title: `Redemption marked as ${status}` });
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
                    {withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-foreground">{w.userName}</td>
                        <td className="p-3 text-foreground font-semibold">₹{w.amount}</td>
                        <td className="p-3 text-muted-foreground">{w.bankName} • {w.accountNumber}</td>
                        <td className="p-3"><span className={statusBadge(w.status)}>{w.status}</span></td>
                        <td className="p-3 text-muted-foreground">{w.createdAt}</td>
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
                    {redemptions.map((r) => (
                      <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium text-foreground">{r.userName}</td>
                        <td className="p-3 text-foreground">{r.productName}</td>
                        <td className="p-3 text-foreground font-semibold">{r.pointsUsed}</td>
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
