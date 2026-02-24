import { useState } from 'react';
import { Search, Plus, Minus, Ban, CheckCircle, Eye, Trash2, RotateCcw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const AdminUsers = () => {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [pointsAction, setPointsAction] = useState<'add' | 'deduct' | null>(null);
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const filtered = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) || u.phone?.includes(search)
  );

  const handlePointsAction = async () => {
    const pts = parseInt(pointsAmount);
    if (!pts || !pointsReason || !selectedUser) return;

    const newPoints = pointsAction === 'add' ? selectedUser.points + pts : Math.max(0, selectedUser.points - pts);
    const newEarned = pointsAction === 'add' ? selectedUser.total_earned + pts : selectedUser.total_earned;
    const newRedeemed = pointsAction === 'deduct' ? selectedUser.total_redeemed + pts : selectedUser.total_redeemed;

    await supabase.from('profiles').update({
      points: newPoints,
      total_earned: newEarned,
      total_redeemed: newRedeemed,
    }).eq('id', selectedUser.id);

    await supabase.from('activity_logs').insert({
      user_id: selectedUser.user_id,
      type: (pointsAction === 'add' ? 'bonus' : 'deduction') as any,
      description: pointsReason,
      points: pointsAction === 'add' ? pts : -pts,
    });

    toast({
      title: `${pointsAction === 'add' ? 'Added' : 'Deducted'} ${pts} points`,
      description: `${selectedUser.name}: ${pointsReason}`,
    });
    setPointsAction(null);
    setPointsAmount('');
    setPointsReason('');
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const handleToggleStatus = async (user: any) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    setActionLoading(true);
    await supabase.from('profiles').update({ status: newStatus }).eq('id', user.id);
    toast({
      title: newStatus === 'active' ? 'User Activated' : 'User Suspended',
      description: `${user.name} is now ${newStatus}`,
    });
    setActionLoading(false);
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    if (selectedUser?.id === user.id) {
      setSelectedUser({ ...user, status: newStatus });
    }
  };

  const handleResetPoints = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    const currentPoints = selectedUser.points;
    await supabase.from('profiles').update({ points: 0, total_redeemed: selectedUser.total_redeemed + currentPoints }).eq('id', selectedUser.id);
    await supabase.from('activity_logs').insert({
      user_id: selectedUser.user_id,
      type: 'deduction' as any,
      description: 'Admin reset points to zero',
      points: -currentPoints,
    });
    toast({ title: 'Points Reset', description: `${selectedUser.name}'s points reset to 0` });
    setActionLoading(false);
    setSelectedUser({ ...selectedUser, points: 0 });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget || deleteConfirmName !== deleteTarget.name) return;
    setActionLoading(true);
    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: { user_id: deleteTarget.user_id },
    });
    setActionLoading(false);
    if (error || data?.error) {
      toast({ title: 'Delete Failed', description: data?.error || error?.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'User Deleted', description: `${deleteTarget.name}'s account has been permanently deleted` });
    setDeleteTarget(null);
    setDeleteConfirmName('');
    setSelectedUser(null);
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
  };

  const { data: userActivity = [] } = useQuery({
    queryKey: ['admin-user-activity', selectedUser?.user_id],
    queryFn: async () => {
      const { data } = await supabase.from('activity_logs').select('*').eq('user_id', selectedUser!.user_id).order('created_at', { ascending: false }).limit(5);
      return data || [];
    },
    enabled: !!selectedUser?.user_id,
  });

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Management</h1>
            <p className="text-sm text-muted-foreground">{users.length} registered users</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">User</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Phone</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Points</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((user: any) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {user.name?.charAt(0) || '?'}
                        </div>
                        <span className="font-medium text-foreground">{user.name}</span>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground">{user.phone}</td>
                    <td className="p-3 font-semibold text-foreground">{user.points?.toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        user.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}>
                        {user.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {user.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedUser(user)} title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-success" onClick={() => { setSelectedUser(user); setPointsAction('add'); }} title="Add points">
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setSelectedUser(user); setPointsAction('deduct'); }} title="Deduct points">
                          <Minus className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleToggleStatus(user)} title={user.status === 'active' ? 'Suspend' : 'Activate'}>
                          <Ban className={`w-3.5 h-3.5 ${user.status === 'active' ? 'text-muted-foreground' : 'text-success'}`} />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { setDeleteTarget(user); setDeleteConfirmName(''); }} title="Delete user">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Detail Dialog */}
      <Dialog open={!!selectedUser && !pointsAction} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedUser?.name}
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                selectedUser?.status === 'active' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              }`}>
                {selectedUser?.status}
              </span>
            </DialogTitle>
            <DialogDescription>{selectedUser?.phone} • Agent: {selectedUser?.agent_code}</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 mt-2">
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-foreground">{selectedUser?.points?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Current</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-success">{selectedUser?.total_earned?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Earned</p>
            </div>
            <div className="bg-secondary rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-destructive">{selectedUser?.total_redeemed?.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Redeemed</p>
            </div>
          </div>
          <div className="mt-2">
            <h4 className="text-sm font-medium text-foreground mb-2">Recent Activity</h4>
            <div className="bg-secondary rounded-lg divide-y divide-border max-h-48 overflow-y-auto">
              {userActivity.length === 0 && <p className="p-3 text-sm text-muted-foreground">No activity</p>}
              {userActivity.map((a: any) => (
                <div key={a.id} className="flex items-center justify-between p-2.5 text-sm">
                  <span className="text-muted-foreground truncate flex-1">{a.description}</span>
                  <span className={`font-semibold ml-2 ${a.points > 0 ? 'text-success' : 'text-destructive'}`}>
                    {a.points > 0 ? '+' : ''}{a.points}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Account Actions */}
          <div className="mt-2 space-y-2">
            <h4 className="text-sm font-medium text-foreground">Account Actions</h4>
            <div className="flex items-center justify-between bg-secondary rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-foreground">Account Status</p>
                <p className="text-xs text-muted-foreground">{selectedUser?.status === 'active' ? 'User can log in and use the app' : 'User is blocked from logging in'}</p>
              </div>
              <Switch
                checked={selectedUser?.status === 'active'}
                onCheckedChange={() => selectedUser && handleToggleStatus(selectedUser)}
                disabled={actionLoading}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-2">
            <Button size="sm" onClick={() => setPointsAction('add')} className="flex-1 gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Points
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPointsAction('deduct')} className="flex-1 gap-1 text-destructive">
              <Minus className="w-3.5 h-3.5" /> Deduct Points
            </Button>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handleResetPoints} disabled={actionLoading || !selectedUser?.points} className="flex-1 gap-1">
              <RotateCcw className="w-3.5 h-3.5" /> Reset Points
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { setDeleteTarget(selectedUser); setDeleteConfirmName(''); }} className="flex-1 gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Delete Account
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Points Dialog */}
      <Dialog open={!!pointsAction} onOpenChange={() => setPointsAction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pointsAction === 'add' ? 'Add' : 'Deduct'} Points</DialogTitle>
            <DialogDescription>For {selectedUser?.name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Number of points" type="number" value={pointsAmount} onChange={(e) => setPointsAmount(e.target.value)} />
            <Input placeholder="Reason (e.g., Festival bonus)" value={pointsReason} onChange={(e) => setPointsReason(e.target.value)} />
            <Button onClick={handlePointsAction} className="w-full">
              {pointsAction === 'add' ? 'Add Points' : 'Deduct Points'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User Account</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>'s account and all associated data (activity logs, redemptions, withdrawals). This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-2">
            <p className="text-sm text-muted-foreground mb-2">Type <strong>{deleteTarget?.name}</strong> to confirm:</p>
            <Input value={deleteConfirmName} onChange={(e) => setDeleteConfirmName(e.target.value)} placeholder="Type user's name" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={deleteConfirmName !== deleteTarget?.name || actionLoading}
            >
              {actionLoading ? 'Deleting...' : 'Delete Permanently'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminUsers;
