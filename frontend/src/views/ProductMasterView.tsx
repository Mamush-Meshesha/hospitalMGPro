import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Barcode, Tags, Package, Edit2, Trash2, Eye, Loader2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { productsApi } from '../api/products.api';

export default function ProductMasterView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected Item
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const navigate = useNavigate();

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      sku: formData.get('sku'),
      barcode: formData.get('barcode'),
      category: formData.get('category'),
      reorder_level: Number(formData.get('reorder_level')),
      concept_id: formData.get('concept_id') ? Number(formData.get('concept_id')) : null,
      is_drug: formData.get('is_drug') === 'on',
      has_expiration: formData.get('has_expiration') === 'on',
      purchase_uom_id: formData.get('purchase_uom_id') ? Number(formData.get('purchase_uom_id')) : undefined,
      store_uom_id: formData.get('store_uom_id') ? Number(formData.get('store_uom_id')) : undefined
    };

    try {
      if (modalMode === 'add') {
        await productsApi.create(data);
      } else {
        await productsApi.update(selectedProduct.product_id, data);
      }
      setIsAddModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handleDelete = async () => {
    try {
      await productsApi.delete(selectedProduct.product_id);
      setIsDeleteModalOpen(false);
      loadProducts();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.barcode && p.barcode.includes(searchTerm))
  );

  const totalProducts = products.length;
  const totalDrugs = products.filter(p => p.is_drug).length;
  const totalSupplies = totalProducts - totalDrugs;

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedProduct(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedProduct(product);
    setIsAddModalOpen(true);
  };

  const handleOpenView = (product: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/products/${product.product_id}`);
  };

  const handleOpenDelete = (product: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    {
      key: 'sku',
      label: 'SKU',
      render: (p: any) => <span className="font-mono text-xs font-semibold text-muted-foreground">{p.sku}</span>
    },
    { key: 'name', label: 'Product Name', render: (p: any) => <span className="font-medium text-foreground">{p.name}</span> },
    { key: 'category', label: 'Category', render: (p: any) => <span className="text-muted-foreground">{p.category}</span> },
    {
      key: 'type',
      label: 'Type',
      render: (p: any) => p.is_drug ? 
        <StatusBadge label="Drug" variant="success" /> : 
        <StatusBadge label="Supply" variant="info" />
    },
    { key: 'store_uom', label: 'Base UOM', render: (p: any) => <span className="text-muted-foreground font-medium">{p.store_uom?.name || '-'}</span> },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (p: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => handleOpenView(p, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
          <button onClick={(e) => handleOpenEdit(p, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={14} /></button>
          <button onClick={(e) => handleOpenDelete(p, e)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  const AddEditForm = (
    <form id="productForm" onSubmit={handleSave} className="grid grid-cols-2 gap-4">
      <div className="col-span-2">
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Product Name</label>
        <input name="name" required type="text" defaultValue={selectedProduct?.name || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. Paracetamol 500mg" />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">SKU / Identifier</label>
        <input name="sku" type="text" defaultValue={selectedProduct?.sku || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. DRG-PCM-500" />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Barcode (UPC/EAN)</label>
        <input name="barcode" type="text" defaultValue={selectedProduct?.barcode || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="Scan or type barcode" />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
        <select name="category" defaultValue={selectedProduct?.category || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
          <option value="">Select Category...</option>
          <option>Antibiotics</option>
          <option>Analgesics</option>
          <option>Medical Supplies</option>
          <option>PPE</option>
        </select>
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Reorder Level (Min Stock)</label>
        <input name="reorder_level" type="number" step="1" defaultValue={selectedProduct?.reorder_level || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. 500" />
      </div>

      <div className="col-span-2 grid grid-cols-2 gap-4 bg-muted/20 p-3 rounded-md border border-border/50 mt-2">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Purchase UOM</label>
          <select name="purchase_uom_id" defaultValue={selectedProduct?.purchase_uom_id || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="">Select UOM...</option>
            {/* Options will be loaded from UOM API in future */}
          </select>
          <p className="text-[10px] text-muted-foreground mt-1">How you buy it from suppliers.</p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Store (Base) UOM</label>
          <select name="store_uom_id" defaultValue={selectedProduct?.store_uom_id || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="">Select UOM...</option>
             {/* Options will be loaded from UOM API in future */}
          </select>
          <p className="text-[10px] text-muted-foreground mt-1">How you dispense it to patients.</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">EMR Concept ID</label>
        <input name="concept_id" type="number" defaultValue={selectedProduct?.concept_id || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="Optional" />
      </div>

      <div className="flex items-center gap-6 pt-6">
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input name="is_drug" type="checkbox" defaultChecked={selectedProduct ? selectedProduct.is_drug : true} className="rounded border-border text-primary focus:ring-1 focus:ring-primary/50" />
          <span>Pharmaceutical Drug</span>
        </label>
        <label className="flex items-center gap-2 text-sm text-foreground cursor-pointer">
          <input name="has_expiration" type="checkbox" defaultChecked={selectedProduct ? selectedProduct.has_expiration : true} className="rounded border-border text-primary focus:ring-1 focus:ring-primary/50" />
          <span>Has Expiration</span>
        </label>
      </div>
    </form>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Product Master</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage the master catalog of all drugs and supplies.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Products</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : totalProducts}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-foreground"><Barcode size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Pharmaceuticals</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : totalDrugs}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/50"><Tags size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Consumables</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : totalSupplies}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-950/50"><Package size={20} /></div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-card">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable 
          data={filteredProducts}
          columns={columns}
          keyExtractor={(p) => p.product_id}
          searchPlaceholder="Search by SKU, name, or barcode..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onRowClick={(item) => handleOpenView(item)}
          actions={
            <button 
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} /> Add Product
            </button>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Product' : 'Edit Product'}
        maxWidth="lg"
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
              form="productForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              {modalMode === 'add' ? 'Save Product' : 'Update Product'}
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
        title="Delete Product"
        message={
          <span>Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action cannot be undone.</span>
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
