import { useState } from 'react';
import { Plus, Copy, Check, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AdminLayout from '@/components/AdminLayout';
import { mockAgentCodes, type AgentCode } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

const AdminAgents = () => {
  const [codes, setCodes] = useState<AgentCode[]>(mockAgentCodes);
  const [showCreate, setShowCreate] = useState(false);
  const [count, setCount] = useState('5');
  const { toast } = useToast();

  const handleGenerate = () => {
    const num = parseInt(count) || 1;
    const newCodes: AgentCode[] = Array.from({ length: num }, (_, i) => ({
      id: `ac-${Date.now()}-${i}`,
      code: `AG${String(codes.length + i + 1).padStart(3, '0')}`,
      used: false,
      createdAt: new Date().toISOString().split('T')[0],
    }));
    setCodes([...newCodes, ...codes]);
    setShowCreate(false);
    toast({ title: `${num} agent codes generated` });
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Copied!', description: code });
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agent Codes</h1>
            <p className="text-sm text-muted-foreground">
              {codes.filter(c => !c.used).length} unused / {codes.length} total
            </p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Generate Codes
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left p-3 font-medium text-muted-foreground">Code</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Used By</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Created</th>
                  <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {codes.map((code) => (
                  <tr key={code.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono font-semibold text-foreground">{code.code}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        code.used ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {code.used ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {code.used ? 'Used' : 'Available'}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{code.usedBy || '-'}</td>
                    <td className="p-3 text-muted-foreground">{code.createdAt}</td>
                    <td className="p-3 text-right">
                      {!code.used && (
                        <Button size="sm" variant="ghost" onClick={() => handleCopy(code.code)}>
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Agent Codes</DialogTitle>
            <DialogDescription>Create one-time signup codes for new users</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input placeholder="Number of codes" type="number" value={count} onChange={(e) => setCount(e.target.value)} />
            <Button onClick={handleGenerate} className="w-full">Generate {count} Codes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminAgents;
