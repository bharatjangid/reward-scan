import { useState } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Camera, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserLayout from '@/components/UserLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const ScanPage = () => {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();

  const handleManualSubmit = async () => {
    if (!manualCode.trim() || !user) return;
    setLoading(true);

    // Find the QR code
    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('code', manualCode.toUpperCase())
      .eq('status', 'pending')
      .maybeSingle();

    if (error || !qrCode) {
      setScanResult('error');
      toast({ title: 'Invalid QR Code', description: 'This code is not valid or already used', variant: 'destructive' });
      setLoading(false);
      setTimeout(() => setScanResult(null), 3000);
      setManualCode('');
      return;
    }

    // Redeem QR code
    await supabase.from('qr_codes').update({
      status: 'redeemed' as any,
      redeemed_by: user.id,
      redeemed_by_name: profile?.name,
      redeemed_at: new Date().toISOString(),
    }).eq('id', qrCode.id);

    // Update batch redeemed count
    const { data: batchData } = await supabase.from('qr_batches').select('redeemed_count').eq('id', qrCode.batch_id).maybeSingle();
    if (batchData) {
      await supabase.from('qr_batches').update({ redeemed_count: (batchData.redeemed_count || 0) + 1 }).eq('id', qrCode.batch_id);
    }

    // Update user points
    await supabase.from('profiles').update({
      points: (profile?.points || 0) + qrCode.points,
      total_earned: (profile?.total_earned || 0) + qrCode.points,
    }).eq('user_id', user.id);

    // Log activity
    await supabase.from('activity_logs').insert({
      user_id: user.id,
      type: 'scan' as any,
      description: `Scanned QR from ${qrCode.product_name}`,
      points: qrCode.points,
    });

    setEarnedPoints(qrCode.points);
    setScanResult('success');
    toast({ title: `Points Added! +${qrCode.points} pts`, description: 'QR code scanned successfully' });
    await refreshProfile();
    setLoading(false);
    setTimeout(() => setScanResult(null), 3000);
    setManualCode('');
  };

  return (
    <UserLayout>
      <div className="gradient-primary px-6 pt-8 pb-8 text-primary-foreground text-center">
        <h1 className="text-xl font-bold">Scan QR Code</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Scan product QR codes to earn points</p>
      </div>

      <div className="px-6 space-y-6 mt-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-card rounded-2xl border-2 border-dashed border-border aspect-square max-w-xs mx-auto flex flex-col items-center justify-center">
          {scanResult === 'success' ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-3" />
              <p className="font-semibold text-success">+{earnedPoints} Points!</p>
            </motion.div>
          ) : scanResult === 'error' ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
              <p className="font-semibold text-destructive">Invalid Code</p>
            </motion.div>
          ) : (
            <>
              <Camera className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">Camera preview</p>
              <p className="text-xs text-muted-foreground mt-1">Point at a QR code</p>
              <div className="absolute inset-8 border-2 border-primary/30 rounded-xl" />
              <div className="absolute top-8 left-8 w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-lg" />
              <div className="absolute top-8 right-8 w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-lg" />
              <div className="absolute bottom-8 left-8 w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-lg" />
              <div className="absolute bottom-8 right-8 w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-lg" />
            </>
          )}
        </motion.div>

        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-foreground mb-3">Or enter code manually</p>
          <div className="flex gap-2">
            <Input placeholder="Enter QR code (e.g., CEM-0001)" value={manualCode} onChange={(e) => setManualCode(e.target.value)} className="flex-1" />
            <Button onClick={handleManualSubmit} disabled={loading}>
              <ScanLine className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ScanPage;
