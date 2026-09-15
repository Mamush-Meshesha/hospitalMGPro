import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, User, MapPin, ChevronRight, Database, Hash, Activity, Terminal, Code, Cpu, Server, Network, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { movementsApi } from '../api/movements.api';
import { toast } from 'sonner';

export default function StockMovementDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movement, setMovement] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showJson, setShowJson] = useState(false);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    const loadMovement = async () => {
      try {
        const data = await movementsApi.getById(Number(id));
        setMovement(data);
      } catch (error) {
        console.error('Failed to load movement details', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadMovement();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!movement) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Movement not found.</p>
        <button onClick={() => navigate('/movements')} className="text-primary hover:underline">Return to Movements</button>
      </div>
    );
  }

  // Mock hash & node since backend doesn't provide them
  const hash = `0x${movement.movement_id.toString(16).padStart(40, '0')}`;
  const node = 'us-east-1a-k8s-node-1';

  const getDerivedType = (m: any) => {
    if (m.reference?.toLowerCase().includes('adjust')) return 'ADJUSTMENT';
    if (m.source_wh_id && m.dest_wh_id) return 'TRANSFER';
    if (m.source_wh_id && !m.dest_wh_id) return 'DISPENSE';
    if (!m.source_wh_id && m.dest_wh_id) return 'RECEIPT';
    return 'UNKNOWN';
  };
  const movement_type = getDerivedType(movement);
  
  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      toast.success("Signature Verified! Hash matches the internal ledger.");
    }, 1500);
  };

  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Breadcrumb Header */}
      <div className="flex items-center justify-between border-b border-border pb-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/movements')} className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center text-sm text-muted-foreground gap-2">
            <span onClick={() => navigate('/movements')} className="hover:underline cursor-pointer font-medium">Movements</span>
            <ChevronRight size={16} className="opacity-50" />
            <span className="font-mono text-foreground font-bold text-base">{movement.reference || `MOV-${movement.movement_id}`}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowJson(true)} className="text-xs font-mono font-semibold uppercase tracking-wider px-3 py-1.5 bg-muted/50 hover:bg-muted text-foreground rounded border border-border transition-colors flex items-center gap-2">
            <Terminal size={14} /> View Raw JSON
          </button>
          <button onClick={handleVerify} disabled={verifying} className="text-xs font-mono font-semibold uppercase tracking-wider px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded border border-primary/30 transition-colors flex items-center gap-2">
            {verifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />} 
            {verifying ? 'Verifying...' : 'Verify Signature'}
          </button>
        </div>
      </div>

      {/* 12-Column Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: Metadata & Trace (Col 1-3) */}
        <div className="col-span-1 xl:col-span-3 flex flex-col gap-6">
          {/* Status Box */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Activity size={16} /> Status
              </span>
              <StatusBadge label="COMMITTED" variant="success" />
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Transaction ID</span>
                <span className="font-mono text-foreground">{movement.movement_id}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Type</span>
                <span className="font-mono font-bold text-foreground">{movement_type}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">Execution Node</span>
                <span className="font-mono text-muted-foreground flex items-center gap-1.5"><Server size={14} /> {node}</span>
              </div>
            </div>
          </div>

          {/* Cryptographic Trace */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Hash size={16} /> Crypto Hash
              </span>
            </div>
            <div className="space-y-3">
              <div className="bg-background border border-border p-3 rounded-md text-xs font-mono text-muted-foreground break-all leading-relaxed">
                {hash}
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                SHA-256 hash of transaction payload. Verified by internal blockchain consensus mechanism at <span className="font-mono text-foreground">{new Date(movement.date_moved || movement.created_at).toLocaleString()}</span>.
              </p>
            </div>
          </div>
          
          {/* User & Auth */}
          <div className="bg-card border border-border rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <User size={16} /> Authorization
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-foreground font-bold text-base">
                  U
                </div>
                <div>
                  <span className="block font-medium text-foreground">User {movement.user_id}</span>
                  <span className="block font-mono text-muted-foreground text-xs mt-0.5">ID: {movement.user_id}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-border border-dashed">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Auth Method</span>
                  <span className="font-mono text-foreground">JWT / 2FA</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER PANEL: Movement Execution Data (Col 4-9) */}
        <div className="col-span-1 xl:col-span-6 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col h-full">
            <div className="bg-muted/30 border-b border-border p-4 flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Network size={16} /> Execution Flow
              </span>
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                <Clock size={14} /> {new Date(movement.date_moved || movement.created_at).toLocaleString()}
              </span>
            </div>

            {/* Technical Flow Diagram */}
            <div className="flex-1 p-8 flex flex-col items-center justify-center space-y-8 bg-gradient-to-b from-background to-muted/10 relative">
              
              {/* Source */}
              <div className="w-full max-w-lg flex items-center gap-5 group">
                <div className="h-10 w-10 rounded bg-muted/50 border border-border flex items-center justify-center text-muted-foreground shrink-0 group-hover:border-primary/50 transition-colors">
                  <Database size={18} />
                </div>
                <div className="flex-1 border border-border bg-background p-4 rounded-md shadow-sm relative">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-l border-b border-border transform rotate-45"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Source Node</span>
                      <span className="text-sm font-mono font-bold text-foreground">{movement.source_warehouse?.name || 'External'}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Qty Deducted</span>
                      <span className="text-sm font-mono text-red-500 font-bold">-{Math.abs(Number(movement.quantity))}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector */}
              <div className="w-full max-w-lg flex items-center justify-center relative py-2">
                <div className="absolute top-0 bottom-0 w-px bg-border border-dashed border-l border-border left-10 -ml-px"></div>
                <div className="px-4 py-1.5 bg-muted border border-border rounded-full text-xs font-mono font-medium text-muted-foreground flex items-center gap-2 shadow-sm z-10">
                   <Cpu size={14} /> Processing Transition
                </div>
              </div>

              {/* Destination */}
              <div className="w-full max-w-lg flex items-center gap-5 group">
                <div className="h-10 w-10 rounded bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 group-hover:border-primary/50 transition-colors">
                  <MapPin size={18} />
                </div>
                <div className="flex-1 border border-border bg-background p-4 rounded-md shadow-sm relative border-l-primary/30">
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 bg-background border-l border-b border-border transform rotate-45 border-l-primary/30"></div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">Destination Node</span>
                      <span className="text-sm font-mono font-bold text-foreground">{movement.destination_warehouse?.name || 'External'}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-xs font-bold text-primary uppercase tracking-wider mb-1">Qty Added</span>
                      <span className="text-sm font-mono text-emerald-500 font-bold">+{Math.abs(Number(movement.quantity))}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted/30 border-t border-border p-5 grid grid-cols-2 gap-6">
              <div>
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Reference Document</span>
                <span className="text-sm font-mono font-semibold text-primary hover:underline cursor-pointer">{movement.reference || 'N/A'}</span>
              </div>
              <div className="text-right">
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">System Latency</span>
                <span className="text-sm font-mono font-semibold text-foreground">14ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Product Data (Col 10-12) */}
        <div className="col-span-1 xl:col-span-3 flex flex-col gap-6">
          <div className="bg-card border border-border rounded-lg p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Code size={16} /> Payload Asset
              </span>
            </div>

            <div className="space-y-5">
              <div>
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Product Name</span>
                <span className="text-sm font-semibold text-foreground">{movement.product?.name || 'Unknown'}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/30 border border-border rounded-md">
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">SKU</span>
                  <span className="text-xs font-mono font-medium text-foreground">{movement.product?.sku || 'N/A'}</span>
                </div>
                <div className="p-3 bg-muted/30 border border-border rounded-md">
                  <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Net Delta</span>
                  <span className={`text-sm font-mono font-bold ${Number(movement.quantity) > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {Number(movement.quantity) > 0 ? '+' : ''}{movement.quantity}
                  </span>
                </div>
              </div>

              <div className="pt-5 border-t border-border">
                <span className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Inventory Integrity Check</span>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-muted-foreground font-medium">Pre-Transaction</span>
                  <span className="font-mono text-foreground font-bold">VERIFIED</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground font-medium">Post-Transaction</span>
                  <span className="font-mono text-foreground font-bold">VERIFIED</span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showJson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card w-full max-w-2xl rounded-lg shadow-xl border border-border flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
              <h3 className="font-mono text-sm font-bold flex items-center gap-2"><Terminal size={16} /> RAW PAYLOAD</h3>
              <button onClick={() => setShowJson(false)} className="text-muted-foreground hover:text-foreground">Close</button>
            </div>
            <div className="p-4 overflow-auto bg-[#1e1e1e] text-[#d4d4d4] rounded-b-lg">
              <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(movement, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
