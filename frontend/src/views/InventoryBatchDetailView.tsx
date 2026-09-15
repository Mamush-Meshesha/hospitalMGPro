import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Clock, Edit2, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { inventoryApi } from '../api/inventory.api';

export default function InventoryBatchDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBatch = async () => {
      try {
        const data = await inventoryApi.getById(Number(id));
        setBatch(data);
      } catch (error) {
        console.error('Failed to load batch details', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadBatch();
  }, [id]);

  const getStatus = (item: any) => {
    const qty = Number(item.quantity || 0);
    const minQty = 100; // Mock min qty
    if (qty === 0) return 'OUT_OF_STOCK';
    if (qty <= minQty) return 'LOW_STOCK';
    
    if (item.expiration_date) {
      const expiryDate = new Date(item.expiration_date);
      const threeMonthsFromNow = new Date();
      threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
      if (expiryDate <= threeMonthsFromNow) return 'EXPIRING_SOON';
    }
    
    return 'IN_STOCK';
  };

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'IN_STOCK': return 'success';
      case 'LOW_STOCK': return 'warning';
      case 'OUT_OF_STOCK': return 'destructive';
      case 'EXPIRING_SOON': return 'destructive';
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

  if (!batch) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Batch not found.</p>
        <button onClick={() => navigate('/inventory')} className="text-primary hover:underline">Return to Inventory</button>
      </div>
    );
  }

  const status = getStatus(batch);
  const minQty = 100;

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/inventory')}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{batch.product?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-mono text-primary">{batch.product?.sku || 'N/A'}</span>
              <StatusBadge label={status.replace(/_/g, ' ')} variant={getStatusVariant(status)} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
            <Edit2 size={14} /> Adjust Quantity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="font-semibold text-lg text-foreground">Stock Level</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-muted/20 p-4 rounded-md border border-border">
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Available Quantity</span>
                <span className={`font-bold text-3xl ${batch.quantity <= minQty ? 'text-destructive' : 'text-foreground'}`}>
                  {batch.quantity}
                </span>
              </div>
              <div className="bg-muted/20 p-4 rounded-md border border-border">
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Minimum Reorder Level</span>
                <span className="font-mono text-xl text-foreground">{minQty}</span>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Location Tracking</h3>
            <div className="bg-muted/30 p-4 rounded-md border border-border space-y-4 text-sm">
              <div className="flex items-center gap-3 text-foreground">
                <MapPin size={16} className="text-muted-foreground" />
                <span>Warehouse: <span className="font-medium text-lg">{batch.bin?.zone?.warehouse?.name || 'Unknown Warehouse'}</span></span>
              </div>
              <div className="flex items-center gap-3 text-foreground pl-7">
                <span className="text-muted-foreground">Zone:</span>
                <span className="font-medium">{batch.bin?.zone?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3 text-foreground pl-7">
                <span className="text-muted-foreground">Bin / Shelf Location:</span>
                <span className="font-mono font-medium px-2 py-1 bg-background border border-border rounded">{batch.bin?.name || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="font-semibold text-lg text-foreground">Batch & Expiry</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-md">
                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Batch / Lot Number</span>
                <span className="font-mono font-bold text-foreground text-base">{batch.batch_number}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/20 border border-border rounded-md">
                <span className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Expiration Date</span>
                <span className={`font-medium flex items-center gap-2 text-base ${status === 'EXPIRING_SOON' ? 'text-destructive' : 'text-foreground'}`}>
                  <Clock size={16} /> {batch.expiration_date ? new Date(batch.expiration_date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
