import { useState, useRef, useCallback } from 'react';
import { Plus, Download, ChevronDown, ChevronUp, Trash2, Eye, Printer, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdminLayout from '@/components/AdminLayout';
import { mockQRBatches, mockRewardProducts, type QRBatch } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';

const AdminQR = () => {
  const [batches, setBatches] = useState<QRBatch[]>(mockQRBatches);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState('');
  const [newPoints, setNewPoints] = useState('');
  const [newCount, setNewCount] = useState('');
  const [showDownload, setShowDownload] = useState(false);
  const [downloadBatch, setDownloadBatch] = useState<QRBatch | null>(null);
  const [qrSize, setQrSize] = useState('50');
  const [pageSize, setPageSize] = useState('a4');
  const { toast } = useToast();

  const handleCreateBatch = () => {
    if (!newProduct || !newPoints || !newCount) {
      toast({ title: 'Missing fields', variant: 'destructive' });
      return;
    }
    const pts = parseInt(newPoints);
    const count = parseInt(newCount);
    const batchId = `batch-${Date.now()}`;
    const newBatch: QRBatch = {
      id: batchId,
      productName: newProduct,
      pointsPerCode: pts,
      totalCodes: count,
      redeemedCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      codes: Array.from({ length: count }, (_, i) => ({
        id: `qr-${batchId}-${i}`,
        code: `${newProduct.substring(0, 3).toUpperCase()}-${String(i + 1).padStart(4, '0')}`,
        productName: newProduct,
        points: pts,
        batchId,
        status: 'pending' as const,
        createdAt: new Date().toISOString().split('T')[0],
      })),
    };
    setBatches([newBatch, ...batches]);
    setShowCreate(false);
    setNewProduct('');
    setNewPoints('');
    setNewCount('');
    toast({ title: 'Batch created!', description: `${count} QR codes generated for ${newProduct}` });
  };

  const handleDeleteBatch = (batchId: string) => {
    setBatches(batches.filter(b => b.id !== batchId));
    toast({ title: 'Batch deleted' });
  };

  const handleDownloadPDF = useCallback(() => {
    if (!downloadBatch) return;
    const size = parseInt(qrSize);
    const pageDims = pageSize === 'a4' ? { w: 210, h: 297 } : pageSize === 'letter' ? { w: 216, h: 279 } : { w: 148, h: 210 };
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [pageDims.w, pageDims.h] });

    const margin = 10;
    const gap = 5;
    const cols = Math.floor((pageDims.w - 2 * margin + gap) / (size + gap));
    const rows = Math.floor((pageDims.h - 2 * margin + gap) / (size + gap + 8));

    downloadBatch.codes.forEach((code, i) => {
      const pageIndex = Math.floor(i / (cols * rows));
      const posInPage = i % (cols * rows);
      const col = posInPage % cols;
      const row = Math.floor(posInPage / cols);

      if (pageIndex > 0 && posInPage === 0) pdf.addPage();

      const x = margin + col * (size + gap);
      const y = margin + row * (size + gap + 8);

      // Draw QR placeholder (in real app, render actual QR)
      pdf.setDrawColor(0);
      pdf.rect(x, y, size, size);
      pdf.setFontSize(6);
      pdf.text(code.code, x + size / 2, y + size + 4, { align: 'center' });
      pdf.text(`${code.points} pts`, x + size / 2, y + size + 7, { align: 'center' });
    });

    pdf.save(`QR_Batch_${downloadBatch.productName}_${downloadBatch.id}.pdf`);
    toast({ title: 'PDF Downloaded!', description: `${downloadBatch.codes.length} QR codes exported` });
    setShowDownload(false);
  }, [downloadBatch, qrSize, pageSize, toast]);

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

        {/* Batch List */}
        <div className="space-y-3">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-card rounded-xl border border-border overflow-hidden">
              <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-foreground">{batch.productName}</h3>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{batch.pointsPerCode} pts/code</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {batch.totalCodes} codes • {batch.redeemedCount} redeemed • {batch.totalCodes - batch.redeemedCount} pending • {batch.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setDownloadBatch(batch); setShowDownload(true); }}>
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" className="text-destructive" onClick={(e) => { e.stopPropagation(); handleDeleteBatch(batch.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  {expandedBatch === batch.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {/* Expanded Codes */}
              {expandedBatch === batch.id && (
                <div className="border-t border-border max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                    {batch.codes.slice(0, 30).map((code) => (
                      <div key={code.id} className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                        code.status === 'redeemed' ? 'bg-success/5' : 'bg-muted/50'
                      }`}>
                        {code.status === 'redeemed' ? <Check className="w-3 h-3 text-success shrink-0" /> : <Clock className="w-3 h-3 text-warning shrink-0" />}
                        <span className="font-mono text-foreground">{code.code}</span>
                        <span className={`ml-auto ${code.status === 'redeemed' ? 'text-success' : 'text-warning'}`}>{code.status}</span>
                      </div>
                    ))}
                    {batch.codes.length > 30 && (
                      <p className="text-xs text-muted-foreground p-2 col-span-full">...and {batch.codes.length - 30} more codes</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Create Batch Dialog */}
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
            <Button onClick={handleCreateBatch} className="w-full">Generate QR Codes</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Download PDF Dialog */}
      <Dialog open={showDownload} onOpenChange={setShowDownload}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download QR Codes as PDF</DialogTitle>
            <DialogDescription>{downloadBatch?.productName} - {downloadBatch?.codes.length} codes</DialogDescription>
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
            <div className="bg-muted rounded-lg p-3 text-sm text-muted-foreground">
              <p>Preview: ~{Math.floor(((pageSize === 'a4' ? 210 : pageSize === 'letter' ? 216 : 148) - 20 + 5) / (parseInt(qrSize) + 5)) * Math.floor(((pageSize === 'a4' ? 297 : pageSize === 'letter' ? 279 : 210) - 20 + 5) / (parseInt(qrSize) + 5 + 8))} codes per page</p>
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
