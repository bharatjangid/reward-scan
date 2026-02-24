import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScanLine, Camera, CheckCircle, XCircle, AlertCircle, History, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import UserLayout from '@/components/UserLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

const ScanPage = () => {
  const [manualCode, setManualCode] = useState('');
  const [scanResult, setScanResult] = useState<'success' | 'error' | null>(null);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<BrowserMultiFormatReader | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { toast } = useToast();
  const { user, profile, refreshProfile } = useAuth();
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const fetchScanHistory = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'scan')
      .order('created_at', { ascending: false })
      .limit(10);
    setScanHistory(data || []);
    setHistoryLoading(false);
  }, [user]);

  useEffect(() => {
    fetchScanHistory();
  }, [fetchScanHistory]);

  const redeemCode = async (code: string) => {
    if (!user || loading) return;
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
    toast({ title: `+${qrCode.points} Points Added!`, description: 'QR code scanned successfully' });
    await refreshProfile();
    await fetchScanHistory();
    setLoading(false);
    setTimeout(() => setScanResult(null), 3000);
    setManualCode('');
  };

  const startCamera = async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported on this browser.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setScanning(true);

      const codeReader = new BrowserMultiFormatReader();
      scannerRef.current = codeReader;

      codeReader.decodeFromStream(stream, videoRef.current!, (result) => {
        if (result) {
          const text = result.getText();
          void redeemCode(text);
          stopCamera();
        }
      });
    } catch (err: any) {
      setScanning(false);
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera permission denied. Go to Chrome Settings → Site Settings → Camera → Allow.');
      } else if (err.name === 'NotReadableError') {
        setCameraError('Camera in use by another app. Close other camera apps and try again.');
      } else {
        setCameraError(`Camera error: ${err.message || 'Unknown'}. Please try again.`);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) return;
    await redeemCode(manualCode.trim());
  };

  return (
    <UserLayout>
      <div className="gradient-primary px-6 pt-8 pb-8 text-primary-foreground text-center">
        <h1 className="text-xl font-bold">Scan QR Code</h1>
        <p className="text-primary-foreground/80 text-sm mt-1">Scan product QR codes to earn points</p>
      </div>

      <div className="px-6 space-y-6 mt-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative bg-card rounded-2xl border-2 border-dashed border-border aspect-square max-w-xs mx-auto flex flex-col items-center justify-center overflow-hidden"
        >
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
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />

              {!scanning && !cameraError && (
                <div className="text-center z-10 flex flex-col items-center gap-3">
                  <Camera className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Tap to open camera</p>
                  <Button onClick={startCamera}>Open Camera</Button>
                </div>
              )}

              {cameraError && (
                <div className="text-center z-10 flex flex-col items-center gap-3 px-4">
                  <AlertCircle className="w-12 h-12 text-destructive" />
                  <p className="text-sm text-destructive">{cameraError}</p>
                  <Button onClick={startCamera} variant="outline">Try Again</Button>
                </div>
              )}

              {scanning && (
                <>
                  <div className="absolute inset-0 z-10 pointer-events-none">
                    <motion.div
                      className="absolute left-4 right-4 h-0.5 bg-primary/80"
                      initial={{ y: 16, opacity: 0.6 }}
                      animate={{ y: 'calc(100% - 16px)', opacity: 1 }}
                      transition={{ duration: 1.8, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                    />

                    <div className="absolute top-4 left-4 h-8 w-8 border-l-2 border-t-2 border-primary" />
                    <div className="absolute top-4 right-4 h-8 w-8 border-r-2 border-t-2 border-primary" />
                    <div className="absolute bottom-4 left-4 h-8 w-8 border-l-2 border-b-2 border-primary" />
                    <div className="absolute bottom-4 right-4 h-8 w-8 border-r-2 border-b-2 border-primary" />
                  </div>

                  <div className="absolute bottom-3 z-20">
                    <Button onClick={stopCamera} variant="destructive" size="sm">Stop Camera</Button>
                  </div>
                </>
              )}
            </>
          )}
        </motion.div>

        <div className="bg-card rounded-xl border border-border p-4">
          <p className="text-sm font-medium text-foreground mb-3">Or enter code manually</p>
          <div className="flex gap-2">
            <Input
              placeholder="Enter QR code (e.g., CEM-0001)"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleManualSubmit} disabled={loading}>
              <ScanLine className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Scan History */}
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">Recent Scans</p>
          </div>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : scanHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No scans yet. Scan a QR code to get started!</p>
          ) : (
            <div className="space-y-3">
              {scanHistory.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{log.description}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="ml-2 shrink-0">+{log.points}</Badge>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
};

export default ScanPage;
