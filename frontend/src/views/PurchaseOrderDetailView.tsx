import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShoppingCart, FileText, Printer, CheckCircle, Edit2, Trash2, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { poApi } from '../api/po.api';
import { printDocument } from '../utils/print';

const MOCK_USERS: Record<number, string> = {
  1: "System Administrator",
  2: "IT Support Team",
  3: "James Wilson",
  4: "Sarah Connor",
  5: "Joy Peters"
};

export default function PurchaseOrderDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [po, setPo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadPo = async () => {
    setIsLoading(true);
    try {
      const data = await poApi.getById(Number(id));
      setPo(data);
    } catch (error) {
      console.error('Failed to load po details', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadPo();
  }, [id]);

  const handleApprove = async () => {
    try {
      await poApi.updateStatus(Number(id), 'APPROVED', 1); // Mock user ID 1
      loadPo();
    } catch (error) {
      console.error('Failed to approve', error);
    }
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'DRAFT': return 'default';
      case 'APPROVED': return 'info';
      case 'SENT': return 'warning';
      case 'PARTIAL': return 'warning';
      case 'COMPLETED': return 'success';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!po) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Purchase order not found.</p>
        <button onClick={() => navigate('/po')} className="text-primary hover:underline">Return to Purchase Orders</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/po')}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors no-print"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{po.po_number}</h1>
              <StatusBadge label={po.status} variant={getStatusVariant(po.status)} />
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-1">{po.supplier?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          {po.status === 'DRAFT' && (
            <button onClick={handleApprove} className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-colors">
              <CheckCircle size={14} /> Approve PO
            </button>
          )}
          <button onClick={printDocument} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
            <Printer size={14} /> Print PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-semibold text-foreground">Line Items</h3>
              <span className="text-xs font-medium bg-background px-2 py-1 rounded-full border border-border">{po.items?.length || 0} Items</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground tracking-wider">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Product</th>
                    <th className="px-4 py-3 font-semibold text-right">Qty</th>
                    <th className="px-4 py-3 font-semibold text-right">Unit Price</th>
                    <th className="px-4 py-3 font-semibold text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {po.items?.length > 0 ? po.items.map((item: any) => (
                    <tr key={item.po_item_id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium text-foreground">{item.product?.name}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">{item.quantity_ordered}</td>
                      <td className="px-4 py-3 text-right font-mono text-muted-foreground">${Number(item.unit_price).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground font-medium">${(Number(item.quantity_ordered) * Number(item.unit_price)).toLocaleString('en-US', {minimumFractionDigits: 2})}</td>
                    </tr>
                  )) : (
                     <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No items added to this PO yet.</td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-muted/20 border-t border-border flex flex-col items-end gap-2">
              <div className="flex justify-between w-full max-w-[250px] text-sm text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono">${(Number(po.total_amount || 0) * 0.9).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between w-full max-w-[250px] text-sm text-muted-foreground">
                <span>Tax (10%):</span>
                <span className="font-mono">${(Number(po.total_amount || 0) * 0.1).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="flex justify-between w-full max-w-[250px] text-base font-bold text-foreground pt-2 border-t border-border/50">
                <span>Total Amount:</span>
                <span className="font-mono text-primary text-lg">${Number(po.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <FileText size={16} className="text-muted-foreground" /> 
                Order Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created Date:</span>
                  <span className="font-medium text-foreground flex items-center gap-1.5"><Clock size={12} className="opacity-70" /> {new Date(po.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created By:</span>
                  <span className="font-medium text-foreground">{MOCK_USERS[po.created_by] || `User ${po.created_by}`}</span>
                </div>
                {po.status !== 'DRAFT' && po.approved_by && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Approved By:</span>
                    <span className="font-medium text-foreground">{MOCK_USERS[po.approved_by] || `User ${po.approved_by}`}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-sm text-foreground mb-3 flex items-center gap-2">
                <ShoppingCart size={16} className="text-muted-foreground" /> 
                Supplier Details
              </h3>
              <div className="p-3 bg-muted/30 rounded-md border border-border space-y-1">
                <span className="block font-medium text-foreground">{po.supplier?.name}</span>
                <span className="block text-xs text-muted-foreground">ID: {po.supplier_id}</span>
                <button onClick={() => navigate(`/suppliers/${po.supplier_id}`)} className="text-xs text-primary hover:underline mt-2 inline-block">View Supplier Profile →</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
