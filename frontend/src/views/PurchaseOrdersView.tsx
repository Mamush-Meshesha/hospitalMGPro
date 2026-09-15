import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ShoppingCart, FileText, CheckCircle, Clock, Eye, Edit2, Trash2, Package, Loader2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { poApi } from '../api/po.api';
import { suppliersApi } from '../api/suppliers.api';
import { productsApi } from '../api/products.api';

export default function PurchaseOrdersView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [poItems, setPoItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected Item
  const [selectedPO, setSelectedPO] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [posData, suppliersData, productsData] = await Promise.all([
        poApi.getAll(),
        suppliersApi.getAll(),
        productsApi.getAll()
      ]);
      setPos(posData);
      setSuppliers(suppliersData);
      setProducts(productsData);
    } catch (error) {
      console.error('Failed to load data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const total_amount = poItems.reduce((sum, item) => sum + (Number(item.quantity_ordered) * Number(item.unit_price)), 0);

    const data = {
      supplier_id: Number(formData.get('supplier_id')),
      total_amount,
      items: poItems.map(item => ({
        product_id: Number(item.product_id),
        quantity_ordered: Number(item.quantity_ordered),
        unit_price: Number(item.unit_price)
      }))
    };

    try {
      if (modalMode === 'add') {
        await poApi.create(data);
      } else {
        await poApi.update(selectedPO.po_id, data);
      }
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handleDelete = async () => {
    try {
      await poApi.delete(selectedPO.po_id);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const filteredPOs = pos.filter(po => 
    po.po_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    po.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPOs = pos.filter(po => po.status === 'APPROVED' || po.status === 'SENT').length;

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedPO(null);
    setPoItems([]);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (po: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedPO(po);
    setPoItems(po.items || []);
    setIsAddModalOpen(true);
  };

  const handleOpenView = (po: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/po/${po.po_id}`);
  };

  const handleOpenDelete = (po: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedPO(po);
    setIsDeleteModalOpen(true);
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

  const columns = [
    { key: 'po_number', label: 'PO Number', render: (po: any) => <span className="font-mono font-bold text-foreground">{po.po_number}</span> },
    { key: 'supplier', label: 'Supplier', render: (po: any) => <span className="font-medium text-foreground">{po.supplier?.name}</span> },
    { key: 'date', label: 'Date', render: (po: any) => <span className="text-muted-foreground flex items-center gap-1.5"><Clock size={14} className="opacity-70" /> {new Date(po.created_at).toLocaleDateString()}</span> },
    { key: 'items', label: 'Items', render: (po: any) => <span className="text-muted-foreground">{po.items?.length || 0} items</span> },
    { key: 'total', label: 'Total Amount', align: 'right' as const, render: (po: any) => <span className="font-semibold text-foreground">${Number(po.total_amount || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}</span> },
    {
      key: 'status',
      label: 'Status',
      align: 'center' as const,
      render: (po: any) => <StatusBadge label={po.status} variant={getStatusVariant(po.status)} />
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (po: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => handleOpenView(po, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
          
          {/* Only allow editing or deleting DRAFT POs */}
          {po.status === 'DRAFT' ? (
            <>
              <button onClick={(e) => handleOpenEdit(po, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={14} /></button>
              <button onClick={(e) => handleOpenDelete(po, e)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
            </>
          ) : (
            <>
              <div className="w-[14px] p-1 mx-1"></div>
              <div className="w-[14px] p-1 mx-1"></div>
            </>
          )}
        </div>
      )
    }
  ];

  const AddEditForm = (
    <form id="poForm" onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Supplier</label>
          <select name="supplier_id" required defaultValue={selectedPO?.supplier_id || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="">Select Supplier...</option>
            {suppliers.map(s => (
              <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">PO Status</label>
          <select defaultValue={selectedPO?.status || 'DRAFT'} disabled={modalMode === 'add'} className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm text-muted-foreground outline-none cursor-not-allowed">
            <option value="DRAFT">DRAFT</option>
            <option value="APPROVED">APPROVED</option>
            <option value="SENT">SENT</option>
          </select>
        </div>
      </div>
      
      {/* Dynamic Line Items Table for the Form */}
      <div className="border border-border rounded-md overflow-hidden mt-4">
        <div className="bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border flex justify-between items-center">
          <span>Line Items</span>
          <button 
            type="button" 
            onClick={() => setPoItems([...poItems, { product_id: '', quantity_ordered: 1, unit_price: 0 }])}
            className="text-primary hover:underline lowercase capitalize flex items-center gap-1"
          >
            <Plus size={12} /> Add Item
          </button>
        </div>
        <div className="p-0 bg-background max-h-64 overflow-y-auto">
          {poItems.length === 0 ? (
            <div className="p-4 flex flex-col items-center justify-center text-center gap-2">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                <Package size={16} />
              </div>
              <p className="text-sm text-muted-foreground">No items added yet.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/10 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Product</th>
                  <th className="px-3 py-2 w-24">Qty</th>
                  <th className="px-3 py-2 w-32">Unit Price</th>
                  <th className="px-3 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {poItems.map((item, index) => (
                  <tr key={index}>
                    <td className="px-3 py-2">
                      <select 
                        required
                        className="w-full bg-background border border-border rounded-md px-2 py-1 outline-none focus:border-primary"
                        value={item.product_id}
                        onChange={(e) => {
                          const newItems = [...poItems];
                          newItems[index].product_id = e.target.value;
                          setPoItems(newItems);
                        }}
                      >
                        <option value="">Select...</option>
                        {products.map(p => (
                          <option key={p.product_id} value={p.product_id}>{p.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="number" 
                        required min="1" step="0.01"
                        className="w-full bg-background border border-border rounded-md px-2 py-1 outline-none focus:border-primary"
                        value={item.quantity_ordered}
                        onChange={(e) => {
                          const newItems = [...poItems];
                          newItems[index].quantity_ordered = e.target.value;
                          setPoItems(newItems);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input 
                        type="number" 
                        required min="0" step="0.01"
                        className="w-full bg-background border border-border rounded-md px-2 py-1 outline-none focus:border-primary"
                        value={item.unit_price}
                        onChange={(e) => {
                          const newItems = [...poItems];
                          newItems[index].unit_price = e.target.value;
                          setPoItems(newItems);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button 
                        type="button"
                        onClick={() => {
                          const newItems = poItems.filter((_, i) => i !== index);
                          setPoItems(newItems);
                        }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className="bg-muted/10 px-3 py-2 border-t border-border flex justify-end">
          <span className="text-sm font-semibold text-foreground">
            Total: ${poItems.reduce((sum, item) => sum + (Number(item.quantity_ordered) * Number(item.unit_price)), 0).toFixed(2)}
          </span>
        </div>
      </div>
    </form>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Purchase Orders</h1>
          <p className="text-xs text-muted-foreground mt-1">Create and track procurement orders sent to suppliers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total POs</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : pos.length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-foreground"><ShoppingCart size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Drafts</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : pos.filter(po => po.status === 'DRAFT').length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-950/50"><FileText size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-600 mb-1">Pending Delivery</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : pendingPOs}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-amber-50 flex items-center justify-center text-amber-600 dark:bg-amber-950/50"><Clock size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Completed</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : pos.filter(po => po.status === 'COMPLETED').length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/50"><CheckCircle size={20} /></div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-card">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable 
          data={filteredPOs}
          columns={columns}
          keyExtractor={(po) => po.po_id}
          searchPlaceholder="Search PO number or supplier..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onRowClick={(item) => handleOpenView(item)}
          actions={
            <button 
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} /> Create PO
            </button>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={modalMode === 'add' ? 'Create Purchase Order' : 'Edit Draft PO'}
        maxWidth="2xl"
        footer={
          <>
            <button 
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 bg-transparent text-muted-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              form="poForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              {modalMode === 'add' ? 'Save as Draft' : 'Update PO'}
            </button>
          </>
        }
      >
        {AddEditForm}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Draft PO"
        message={
          <span>Are you sure you want to delete draft <strong>{selectedPO?.po_number}</strong>? This action cannot be undone.</span>
        }
        confirmLabel="Delete Draft"
        variant="danger"
      />
    </div>
  );
}
