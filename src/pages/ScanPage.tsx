import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Camera, CheckCircle, XCircle, Video, VideoOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserLayout from '@/components/UserLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Html5Qrcode } from 'html5-qrcode';

const ScanPage = () => {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);

  const redeemCode = async (code: string) => {
    if (processingRef.current || !user) return;
    processingRef.current = true;
    setLoading(true);

    const { data: qrCode, error } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('status', 'pending')
      .maybeSingle();

    if (error || !qrCode) {
      setScanResult('error');
      toast({ title: 'Invalid QR Code', description: 'This code is not valid or already used', variant: 'destructive' });
      setLoading(false);
      processingRef.current = false;
      setTimeout(() => setScanResult(null), 3000);
      return;
    }

    await supabase.from('qr_codes').update({
      status: 'redeemed' as any,
      redeemed_by: user.id,
      redeemed_by_name: profile?.name,
      redeemed_at: new Date().toISOString(),
    }).eq('id', qrCode.id);

    const { data: batchData } = await supabase.from('qr_batches').select('redeemed_count').eq('id', qrCode.batch_id).maybeSingle();
    if (batchData) {
      await supabase.from('qr_batches').update({ redeemed_count: (batchData.redeemed_count || 0) + 1 }).eq('id', qrCode.batch_id);
    }

    await supabase.from('profiles').update({
      points: (profile?.points || 0) + qrCode.points,
      total_earned: (profile?.total_earned || 0) + qrCode.points,
    }).eq('user_id', user.id);

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
    setTimeout(() => {
      setScanResult(null);
      processingRef.current = false;
    }, 3000);
  };

  const startCamera = async () => {
    if (scannerRef.current?.isScanning) return;

    setCameraActive(true);

    // Let React render the qr-reader container before starting camera stream
    await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));

    try {
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      const config = { fps: 10, qrbox: { width: 200, height: 200 } };

      try {
        await scanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            redeemCode(decodedText);
          },
          () => {}
        );
      } catch {
        const cameras = await Html5Qrcode.getCameras();
        const rearCamera = cameras.find((camera) => /back|rear|environment/i.test(camera.label));
        const fallbackCameraId = rearCamera?.id ?? cameras[0]?.id;

        if (!fallbackCameraId) throw new Error('No camera found');

        await scanner.start(
          fallbackCameraId,
          config,
          (decodedText) => {
            redeemCode(decodedText);
          },
          () => {}
        );
      }
    } catch {
      setCameraActive(false);
      toast({
        title: 'Camera Error',
        description: 'Could not access camera. Please allow camera permission or use manual entry.',
        variant: 'destructive'
      });
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current?.isScanning) {
      await scannerRef.current.stop();
    }
    scannerRef.current?.clear();
    scannerRef.current = null;
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
      scannerRef.current?.clear();
      scannerRef.current = null;
    };
  }, []);

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    redeemCode(manualCode);
    setManualCode('');
  };

  return (
    <UserLayout>
      <div className="gradient-primary px-6 pt-8 pb-8 text-primary-foreground text-center">
        <h1 className="text-xl font-bold">Scan QR Code</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Scan product QR codes to earn points</p>
      </div>

      <div className="px-6 space-y-6 mt-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative bg-card rounded-2xl border-2 border-dashed border-border aspect-square max-w-xs mx-auto flex flex-col items-center justify-center overflow-hidden">
          {scanResult === 'success' ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center z-10">
              <CheckCircle className="w-16 h-16 text-success mx-auto mb-3" />
              <p className="font-semibold text-success">+{earnedPoints} Points!</p>
            </motion.div>
          ) : scanResult === 'error' ? (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-center z-10">
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-3" />
              <p className="font-semibold text-destructive">Invalid Code</p>
            </motion.div>
          ) : (
            <>
              <div id="qr-reader" className={`absolute inset-0 ${cameraActive ? '' : 'hidden'}`} />
              {!cameraActive && (
                <>
                  <Camera className="w-12 h-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">Tap below to start camera</p>
                </>
              )}
            </>
          )}
        </motion.div>

        <div className="flex justify-center">
          <Button onClick={cameraActive ? stopCamera : startCamera} variant={cameraActive ? 'destructive' : 'default'} className="gap-2">
            {cameraActive ? <><VideoOff className="w-4 h-4" /> Stop Camera</> : <><Video className="w-4 h-4" /> Start Camera</>}
          </Button>
        </div>

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
