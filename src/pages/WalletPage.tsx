import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownRight, Landmark, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import UserLayout from '@/components/UserLayout';
import { mockActivity, mockWithdrawals } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const statusIcons = {
  pending: <Clock className="w-4 h-4 text-warning" />,
  approved: <CheckCircle className="w-4 h-4 text-success" />,
  rejected: <XCircle className="w-4 h-4 text-destructive" />,
};

const WalletPage = () => {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const { toast } = useToast();
  const userPoints = 1250;

  const handleWithdraw = () => {
    const pts = parseInt(amount);
    if (!pts || pts > userPoints || !bankName || !accountNumber) {
      toast({ title: 'Invalid request', description: 'Check your details and try again', variant: 'destructive' });
      return;
    }
    toast({ title: 'Withdrawal Requested', description: `₹${pts} withdrawal is pending admin approval` });
    setShowWithdraw(false);
    setAmount('');
    setBankName('');
    setAccountNumber('');
  };

  return (
    <UserLayout>
      <div className="gradient-primary px-6 pt-8 pb-14 text-primary-foreground">
        <h1 className="text-xl font-bold mb-2">My Wallet</h1>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold">{userPoints.toLocaleString()}</span>
          <span className="text-primary-foreground/70 mb-1">points</span>
        </div>
      </div>

      <div className="px-6 -mt-6 space-y-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Button onClick={() => setShowWithdraw(true)} className="w-full gap-2">
            <Landmark className="w-4 h-4" /> Withdraw to Bank
          </Button>
        </motion.div>

        {/* Withdrawal History */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">Withdrawal History</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {mockWithdrawals.map((w) => (
              <div key={w.id} className="flex items-center gap-3 p-3">
                {statusIcons[w.status]}
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">₹{w.amount}</p>
                  <p className="text-xs text-muted-foreground">{w.bankName} • {w.accountNumber} • {w.createdAt}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  w.status === 'approved' ? 'bg-success/10 text-success' :
                  w.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                  'bg-warning/10 text-warning'
                }`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div>
          <h2 className="text-base font-semibold text-foreground mb-3">All Activity</h2>
          <div className="bg-card rounded-xl border border-border divide-y divide-border">
            {mockActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${a.points > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  {a.points > 0 ? <ArrowUpRight className="w-4 h-4 text-success" /> : <ArrowDownRight className="w-4 h-4 text-destructive" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{a.description}</p>
                  <p className="text-xs text-muted-foreground">{a.createdAt}</p>
                </div>
                <span className={`text-sm font-semibold ${a.points > 0 ? 'text-success' : 'text-destructive'}`}>
                  {a.points > 0 ? '+' : ''}{a.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdraw} onOpenChange={setShowWithdraw}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Withdraw to Bank</DialogTitle>
            <DialogDescription>1 point = ₹1. Min withdrawal: 100 points</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Points to withdraw" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <Input placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)} />
            <Input placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} />
            <Button onClick={handleWithdraw} className="w-full">Submit Withdrawal Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

export default WalletPage;
