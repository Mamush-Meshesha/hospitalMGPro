import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Receipt, Calendar, CreditCard, ExternalLink, Printer, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { invoicesApi } from '../api/invoices.api';
import { printDocument } from '../utils/print';

export default function InvoiceDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadInvoice = async () => {
    setIsLoading(true);
    try {
      const data = await invoicesApi.getById(Number(id));
      setInvoice(data);
    } catch (error) {
      console.error('Failed to load invoice details', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadInvoice();
  }, [id]);

  const handlePay = async () => {
    try {
      await invoicesApi.update(Number(id), { status: 'PAID' });
      loadInvoice();
    } catch (error) {
      console.error('Payment failed', error);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Invoice not found.</p>
        <button onClick={() => navigate('/invoices')} className="text-primary hover:underline">Return to Invoices</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/invoices')}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-foreground font-mono">{invoice.invoice_number}</h1>
              <StatusBadge label={invoice.status} variant={invoice.status === 'PAID' ? 'success' : 'destructive'} />
            </div>
            <p className="text-sm font-medium text-muted-foreground mt-1">{invoice.supplier?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 no-print">
          {invoice.status === 'UNPAID' && (
            <button onClick={handlePay} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
              <CreditCard size={14} /> Record Payment
            </button>
          )}
          <button onClick={printDocument} className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-colors">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="font-semibold text-lg text-foreground">Invoice Summary</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/20 p-4 rounded-md border border-border">
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Amount</span>
                <span className="font-bold text-2xl text-foreground">${Number(invoice.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
              <div className="bg-muted/20 p-4 rounded-md border border-border">
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Received Date</span>
                <span className="font-mono text-lg text-foreground flex items-center gap-2"><Calendar size={18} className="text-muted-foreground" /> {new Date(invoice.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Related Documents</h3>
            {invoice.purchase_order ? (
              <div onClick={() => navigate(`/po/${invoice.po_id}`)} className="p-4 border border-border rounded-md hover:bg-muted/20 transition-colors cursor-pointer flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <Receipt size={18} className="text-primary" />
                  <div>
                    <span className="block font-medium text-sm text-foreground">Purchase Order</span>
                    <span className="block font-mono text-xs text-muted-foreground">{invoice.purchase_order.po_number}</span>
                  </div>
                </div>
                <ExternalLink size={16} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ) : (
              <div className="p-4 border border-dashed border-border rounded-md text-muted-foreground text-center">
                <p>No related purchase order.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
