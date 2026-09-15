import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Edit2, Trash2, ShoppingCart, Receipt, FileText, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { suppliersApi } from '../api/suppliers.api';

export default function SupplierDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [supplier, setSupplier] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSupplier = async () => {
      try {
        const data = await suppliersApi.getById(Number(id));
        setSupplier(data);
      } catch (error) {
        console.error('Failed to load supplier details', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadSupplier();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Supplier not found.</p>
        <button onClick={() => navigate('/suppliers')} className="text-primary hover:underline">Return to Suppliers</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/suppliers')}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded border border-border bg-muted/50 flex items-center justify-center text-primary font-bold text-xl uppercase">
              {supplier.name?.substring(0, 2)}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">{supplier.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {supplier.is_active !== false ? <StatusBadge label="Active" variant="success" /> : <StatusBadge label="Inactive" variant="default" />}
                <span className="text-sm font-mono text-muted-foreground ml-2">TAX ID: {supplier.tax_id || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-colors">
            <Edit2 size={14} /> Edit
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-medium hover:bg-destructive/90 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="font-semibold text-lg text-foreground">Contact Information</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Mail size={16} />
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Email Address</span>
                  <a href={`mailto:${supplier.contact_email}`} className="font-medium text-primary hover:underline">{supplier.contact_email || 'N/A'}</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Phone size={16} />
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Phone Number</span>
                  <a href={`tel:${supplier.contact_phone}`} className="font-medium text-foreground">{supplier.contact_phone || 'N/A'}</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <ShoppingCart size={16} className="text-muted-foreground" /> Recent Purchase Orders
              </h3>
              <button 
                onClick={() => navigate('/purchase-orders')}
                className="text-xs text-primary hover:underline"
              >
                View All
              </button>
            </div>
            <div className="p-4">
              {supplier.purchase_orders?.length > 0 ? (
                <div className="space-y-2">
                  {supplier.purchase_orders.map((po: any) => (
                    <div key={po.po_id} className="flex justify-between items-center p-3 border border-border rounded hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/purchase-orders/${po.po_id}`)}>
                      <div>
                        <div className="font-medium text-sm text-foreground">{po.po_number}</div>
                        <div className="text-xs text-muted-foreground">{new Date(po.created_at).toLocaleDateString()}</div>
                      </div>
                      <StatusBadge label={po.status} variant={po.status === 'APPROVED' ? 'success' : 'warning'} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                  <FileText size={32} className="opacity-20" />
                  <p>No recent purchase orders found for this supplier.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Receipt size={16} className="text-muted-foreground" /> Invoices & Payables
              </h3>
              <button 
                onClick={() => navigate('/invoices')}
                className="text-xs text-primary hover:underline"
              >
                View All
              </button>
            </div>
            <div className="p-4">
              {supplier.invoices?.length > 0 ? (
                <div className="space-y-2">
                  {supplier.invoices.map((inv: any) => (
                    <div key={inv.invoice_id} className="flex justify-between items-center p-3 border border-border rounded hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/invoices/${inv.invoice_id}`)}>
                      <div>
                        <div className="font-medium text-sm text-foreground">{inv.invoice_number || `INV-${inv.invoice_id}`}</div>
                        <div className="text-xs text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-semibold">${Number(inv.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
                        <StatusBadge label={inv.status} variant={inv.status === 'PAID' ? 'success' : 'default'} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
                  <Receipt size={32} className="opacity-20" />
                  <p>No invoices found for this supplier.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
