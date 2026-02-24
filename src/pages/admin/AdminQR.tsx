import { useState, useCallback } from 'react';
import { Plus, Download, ChevronDown, ChevronUp, Trash2, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdminLayout from '@/components/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

const AdminQR = () => {
  const [showCreate, setShowCreate] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [newCount, setNewCount] = useState('');
  const [showDownload, setShowDownload] = useState(false);
  const [downloadBatchId, setDownloadBatchId] = useState<string | null>(null);
  const [qrSize, setQrSize] = useState('50');
  const [pageSize, setPageSize] = useState('a4');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: batches = [] } = useQuery({
    queryKey: ['admin-qr-batches'],
    queryFn: async () => {
      const { data } = await supabase.from('qr_batches').select('*').order('created_at', { ascending: false });
      return data || [];
    },
  });

  const { data: expandedCodes = [] } = useQuery({
    queryKey: ['admin-qr-codes', expandedBatch],
    queryFn: async () => {
      const { data } = await supabase.from('qr_codes').select('*').eq('batch_id', expandedBatch!).order('created_at').limit(50);
      return data || [];
    },
    enabled: !!expandedBatch,
  });

  const handleCreateBatch = async () => {
    if (!newProduct || !newPoints || !newCount) {
      toast({ title: 'Missing fields', variant: 'destructive' });
      return;
    }
    setCreating(true);
    const pts = parseInt(newPoints);
    const count = parseInt(newCount);
    const prefix = newProduct.substring(0, 3).toUpperCase();

    // Create batch
    const { data: batch, error } = await supabase.from('qr_batches').insert({
      product_name: newProduct,
      points_per_code: pts,
      total_codes: count,
    }).select().single();

    if (error || !batch) {
      toast({ title: 'Error creating batch', variant: 'destructive' });
      setCreating(false);
      return;
    }

    // Create QR codes
    const codes = Array.from({ length: count }, (_, i) => ({
      code: `${prefix}-${String(i + 1).padStart(4, '0')}-${batch.id.substring(0, 4)}`,
      product_name: newProduct,
      points: pts,
      batch_id: batch.id,
    }));

    await supabase.from('qr_codes').insert(codes);

    setShowCreate(false);
    setNewProduct('');
    setNewPoints('');
    setNewCount('');
    setCreating(false);
    toast({ title: 'Batch created!', description: `${count} QR codes generated for ${newProduct}` });
    queryClient.invalidateQueries({ queryKey: ['admin-qr-batches'] });
  };

  const handleDeleteBatch = async (batchId: string) => {
    await supabase.from('qr_batches').delete().eq('id', batchId);
    toast({ title: 'Batch deleted' });
    queryClient.invalidateQueries({ queryKey: ['admin-qr-batches'] });
  };

  const handleDownloadPDF = useCallback(async () => {
    if (!downloadBatchId) return;
    const batch = batches.find((b: any) => b.id === downloadBatchId);
    if (!batch) return;

    const { data: codes } = await supabase.from('qr_codes').select('*').eq('batch_id', downloadBatchId).order('created_at');
    if (!codes) return;

    const size = parseInt(qrSize);
    const pageDims = pageSize === 'a4' ? { w: 210, h: 297 } : pageSize === 'letter' ? { w: 216, h: 279 } : { w: 148, h: 210 };
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pageDims.w, pageDims.h] });

    const margin = 10;
    const gap = 5;
    const cols = Math.floor((pageDims.w - 2 * margin + gap) / (size + gap));
    const rows = Math.floor((pageDims.h - 2 * margin + gap) / (size + gap + 8));

    // Generate all QR code data URLs in parallel
    const qrDataUrls = await Promise.all(
      codes.map((code: any) => QRCode.toDataURL(code.code, { width: 256, margin: 1 }))
    );

    codes.forEach((code: any, i: number) => {
      const pageIndex = Math.floor(i / (cols * rows));
      const posInPage = i % (cols * rows);
      const col = posInPage % cols;
      const row = Math.floor(posInPage / cols);

      if (pageIndex > 0 && posInPage === 0) pdf.addPage();

      const x = margin + col * (size + gap);
      const y = margin + row * (size + gap + 8);

      pdf.addImage(qrDataUrls[i], 'PNG', x, y, size, size);
      pdf.setFontSize(6);
      pdf.text(code.code, x + size / 2, y + size + 4, { align: 'center' });
      pdf.text(`${code.points} pts`, x + size / 2, y + size + 7, { align: 'center' });
    });

    pdf.save(`QR_Batch_${batch.product_name}_${batch.id.substring(0, 8)}.pdf`);
    toast({ title: 'PDF Downloaded!', description: `${codes.length} QR codes exported` });
    setShowDownload(false);
  }, [downloadBatchId, qrSize, pageSize, toast, batches]);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">QR Code Management</h1>
            <p className="text-sm text-muted-foreground">{batches.length} batches created</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Create Batch
          </Button>
        </div>

        <div className="space-y-3">
          {batches.map((batch: any) => (
            <div key={batch.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{batch.product_name}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{batch.points_per_code} pts/code</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {batch.total_codes} codes • {batch.redeemed_count} redeemed • {batch.total_codes - batch.redeemed_count} pending • {new Date(batch.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDownloadBatchId(batch.id); setShowDownload(true); }}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteBatch(batch.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {expandedBatch === batch.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {expandedBatch === batch.id && (
                <div className="border-t border-border max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                    {expandedCodes.map((code: any) => (
                      <div key={code.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${code.status === 'redeemed' ? 'bg-success/5' : 'bg-muted/50'}`}>
                        {code.status === 'redeemed' ? <Check className="w-3 h-3 text-success shrink-0" /> : <Clock className="w-3 h-3 text-warning shrink-0" />}
                        <span className="font-mono text-foreground">{code.code}</span>
                        <span className={`ml-auto ${code.status === 'redeemed' ? 'text-success' : 'text-warning'}`}>{code.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create QR Batch</DialogTitle>
            <DialogDescription>Generate QR codes for a product</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Select value={newProduct} onValueChange={setNewProduct}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {['Premium Cement 50kg', 'Wall Putty 20kg', 'White Cement 5kg', 'Tile Adhesive 25kg', 'Waterproof Coating 10L'].map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Points per QR code" type="number" value={newPoints} onChange={(e) => setNewPoints(e.target.value)} />
            <Input placeholder="Number of QR codes" type="number" value={newCount} onChange={(e) => setNewCount(e.target.value)} />
            <Button onClick={handleCreateBatch} className="w-full" disabled={creating}>
              {creating ? 'Generating...' : 'Generate QR Codes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDownload} onOpenChange={setShowDownload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download QR Codes as PDF</DialogTitle>
            <DialogDescription>{batches.find((b: any) => b.id === downloadBatchId)?.product_name}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">QR Code Size (mm)</label>
              <Select value={qrSize} onValueChange={setQrSize}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25mm (Small)</SelectItem>
                  <SelectItem value="35">35mm (Medium)</SelectItem>
                  <SelectItem value="50">50mm (Large)</SelectItem>
                  <SelectItem value="70">70mm (Extra Large)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Page Size</label>
              <Select value={pageSize} onValueChange={setPageSize}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="a4">A4 (210×297mm)</SelectItem>
                  <SelectItem value="letter">Letter (8.5×11")</SelectItem>
                  <SelectItem value="a5">A5 (148×210mm)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleDownloadPDF} className="w-full gap-2">
              <Download className="w-4 h-4" /> Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminQR;
