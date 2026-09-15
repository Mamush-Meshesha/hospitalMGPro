import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, AlertTriangle, List, ArrowDownToLine, RefreshCw, Layers, Eye, Settings2, MapPin, Loader2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { inventoryApi } from '../api/inventory.api';
import { downloadCSV } from '../utils/export';

export default function InventoryView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING'>('ALL');
  const [inventory, setInventory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  // Selected Item
  const [selectedBatch, setSelectedBatch] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await inventoryApi.getAll();
      setInventory(data);
    } catch (error) {
      console.error('Failed to load inventory', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQty = Number(formData.get('quantity'));
    
    try {
      await inventoryApi.update(selectedBatch.batch_id, {
        quantity: newQty
      });
      setIsAdjustModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to adjust stock', error);
    }
  };

  const getStatus = (item: any) => {
    const qty = Number(item.quantity || 0);
    const minQty = 100; // Mock min qty
    const expiryDate = new Date(item.expiration_date);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    if (qty === 0) return 'OUT_OF_STOCK';
    if (qty <= minQty) return 'LOW_STOCK';
    if (expiryDate <= threeMonthsFromNow) return 'EXPIRING_SOON';
    return 'IN_STOCK';
  };

  const filteredInventory = inventory.filter(i => {
    const matchesSearch = i.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          i.batch_number?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    const status = getStatus(i);
    
    if (activeTab === 'ALL') return true;
    if (activeTab === 'LOW_STOCK') return status === 'LOW_STOCK';
    if (activeTab === 'OUT_OF_STOCK') return status === 'OUT_OF_STOCK';
    if (activeTab === 'EXPIRING') return status === 'EXPIRING_SOON';
    return true;
  });

  const getStatusVariant = (status: string) => {
    switch(status) {
      case 'IN_STOCK': return 'success';
      case 'LOW_STOCK': return 'warning';
      case 'OUT_OF_STOCK': return 'destructive';
      case 'EXPIRING_SOON': return 'destructive';
      default: return 'default';
    }
  };

  const navigate = useNavigate();

  const handleOpenView = (batch: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/inventory/${batch.batch_id}`);
  };

  const handleOpenAdjust = (batch: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBatch(batch);
    setIsAdjustModalOpen(true);
  };

  const columns = [
    { key: 'sku', label: 'SKU', render: (i: any) => <span className="font-mono text-xs text-primary">{i.product?.sku || 'N/A'}</span> },
    { key: 'product', label: 'Product', render: (i: any) => <span className="font-medium text-foreground">{i.product?.name || 'Unknown'}</span> },
    { key: 'warehouse', label: 'Warehouse', render: (i: any) => <span className="text-muted-foreground">{i.bin?.zone?.warehouse?.name || 'Unknown'}</span> },
    { key: 'batch', label: 'Batch / Lot', render: (i: any) => <span className="font-mono text-xs">{i.batch_number}</span> },
    { key: 'expiry', label: 'Expiry Date', render: (i: any) => <span className="text-muted-foreground">{new Date(i.expiration_date).toLocaleDateString()}</span> },
    {
      key: 'qty',
      label: 'Quantity',
      align: 'right' as const,
      render: (i: any) => {
        const qty = Number(i.quantity || 0);
        const minQty = 100; // Mock min qty
        return (
          <div className="flex flex-col items-end">
            <span className={`font-bold ${qty <= minQty ? 'text-destructive' : 'text-foreground'}`}>{qty}</span>
            <span className="text-[10px] text-muted-foreground">Min: {minQty}</span>
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center' as const,
      render: (i: any) => {
        const status = getStatus(i);
        return <StatusBadge label={status.replace(/_/g, ' ')} variant={getStatusVariant(status)} />;
      }
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (i: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => handleOpenView(i, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
          <button onClick={(e) => handleOpenAdjust(i, e)} title="Adjust Stock" className="p-1 text-muted-foreground hover:text-primary transition-colors"><Settings2 size={14} /></button>
          <div className="w-[14px] p-1 mx-1"></div>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Inventory Management</h1>
          <p className="text-xs text-muted-foreground mt-1">Real-time tracking of all stock across locations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={loadData} className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-colors">
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Sync Stock
          </button>
          <button 
            onClick={() => downloadCSV(filteredInventory, 'inventory_report.csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <ArrowDownToLine size={14} /> Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Items</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : inventory.length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-foreground"><Layers size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Healthy Stock</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : inventory.filter(i => getStatus(i) === 'IN_STOCK').length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/50"><Package size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Low Stock</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : inventory.filter(i => getStatus(i) === 'LOW_STOCK').length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 dark:bg-amber-950/50"><AlertTriangle size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-red-600 mb-1">Out / Expiring</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : inventory.filter(i => getStatus(i) === 'OUT_OF_STOCK' || getStatus(i) === 'EXPIRING_SOON').length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-red-50 flex items-center justify-center text-red-600 dark:bg-red-950/50"><List size={20} /></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
        {/* Internal Tabs */}
        <div className="flex items-center gap-1 p-1 border-b border-border overflow-x-auto">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === 'ALL' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            All Inventory
          </button>
          <button 
            onClick={() => setActiveTab('LOW_STOCK')}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'LOW_STOCK' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            <div className={`h-2 w-2 rounded-full ${activeTab === 'LOW_STOCK' ? 'bg-amber-500' : 'bg-muted-foreground/30'}`}></div>
            Low Stock Alerts
          </button>
          <button 
            onClick={() => setActiveTab('OUT_OF_STOCK')}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'OUT_OF_STOCK' ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            <div className={`h-2 w-2 rounded-full ${activeTab === 'OUT_OF_STOCK' ? 'bg-red-500' : 'bg-muted-foreground/30'}`}></div>
            Stockouts
          </button>
          <button 
            onClick={() => setActiveTab('EXPIRING')}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'EXPIRING' ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            <div className={`h-2 w-2 rounded-full ${activeTab === 'EXPIRING' ? 'bg-red-500' : 'bg-muted-foreground/30'}`}></div>
            Expiring Soon
          </button>
        </div>

        <div className="border-none shadow-none">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable 
              data={filteredInventory}
              columns={columns}
              keyExtractor={(i) => i.batch_id}
              searchPlaceholder="Search product or batch..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              onRowClick={(item) => handleOpenView(item)}
            />
          )}
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Adjust Stock Quantity"
        maxWidth="md"
        footer={
          <>
            <button 
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-3 py-1.5 bg-transparent text-muted-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              form="adjustForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              Confirm Adjustment
            </button>
          </>
        }
      >
        {selectedBatch && (
          <form id="adjustForm" onSubmit={handleAdjustSubmit} className="space-y-4">
            <div className="p-4 rounded-md bg-muted/30 border border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider font-semibold">Product</span>
                <span className="font-medium">{selectedBatch.product?.name}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider font-semibold">Batch / Lot</span>
                <span className="font-mono">{selectedBatch.batch_number}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider font-semibold">Current Qty</span>
                <span className="font-bold">{selectedBatch.quantity}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">New Quantity</label>
              <input name="quantity" required type="number" min="0" step="1" defaultValue={selectedBatch.quantity} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 font-mono" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Reason for Adjustment</label>
              <select name="reason" required className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                <option value="">Select Reason...</option>
                <option value="DAMAGE">Damaged Goods</option>
                <option value="EXPIRED">Expired</option>
                <option value="COUNT_CORRECTION">Physical Count Correction</option>
                <option value="THEFT_LOSS">Theft or Loss</option>
              </select>
            </div>
            
            <p className="text-[10px] text-muted-foreground">
              Adjusting stock will create an immutable stock movement record linked to your user account.
            </p>
          </form>
        )}
      </Modal>

    </div>
  );
}
