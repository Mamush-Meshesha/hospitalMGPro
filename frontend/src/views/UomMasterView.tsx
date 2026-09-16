import React, { useState, useEffect } from 'react';
import { Plus, Tag, Scale, Loader2, Trash2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { uomApi } from '../api/uom.api';

export default function UomMasterView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [uoms, setUoms] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddUomModalOpen, setIsAddUomModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [selectedUom, setSelectedUom] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [uomData, categoryData] = await Promise.all([
        uomApi.getAll(),
        uomApi.getCategories()
      ]);
      setUoms(uomData);
      setCategories(categoryData);
    } catch (error) {
      console.error('Failed to load UOMs', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await uomApi.createCategory({ name: formData.get('name') });
      setIsAddCategoryModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save category failed', error);
    }
  };

  const handleSaveUom = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      category_id: Number(formData.get('category_id')),
      type: formData.get('type'),
      ratio: Number(formData.get('ratio'))
    };

    try {
      await uomApi.create(data);
      setIsAddUomModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save UOM failed', error);
    }
  };

  const handleDeleteUom = async () => {
    try {
      await uomApi.delete(selectedUom.uom_id);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Delete UOM failed', error);
    }
  };

  const filteredUoms = uoms.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDelete = (uom: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUom(uom);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Unit Name', render: (u: any) => <span className="font-medium text-foreground">{u.name}</span> },
    { key: 'category', label: 'Category', render: (u: any) => <span className="text-muted-foreground">{u.category?.name}</span> },
    {
      key: 'type',
      label: 'Type',
      render: (u: any) => {
        if (u.type === 'REFERENCE') return <StatusBadge label="Reference (Base)" variant="info" />;
        if (u.type === 'BIGGER') return <StatusBadge label="Bigger than Ref" variant="success" />;
        return <StatusBadge label="Smaller than Ref" variant="warning" />;
      }
    },
    { key: 'ratio', label: 'Ratio to Base', render: (u: any) => <span className="font-mono text-sm text-foreground">{Number(u.ratio).toFixed(4)}</span> },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (u: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => handleOpenDelete(u, e)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  const AddCategoryForm = (
    <form id="categoryForm" onSubmit={handleSaveCategory} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Category Name</label>
        <input name="name" required type="text" className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. Weight, Volume, Length" />
      </div>
    </form>
  );

  const AddUomForm = (
    <form id="uomForm" onSubmit={handleSaveUom} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Unit Name</label>
        <input name="name" required type="text" className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. Box, Carton, mg" />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
        <select name="category_id" required className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
          <option value="">Select Category...</option>
          {categories.map(c => (
            <option key={c.category_id} value={c.category_id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Type</label>
          <select name="type" required className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="REFERENCE">Reference (Base) Unit</option>
            <option value="BIGGER">Bigger than Base</option>
            <option value="SMALLER">Smaller than Base</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Ratio</label>
          <input name="ratio" required type="number" step="0.0001" defaultValue="1.0000" className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" />
          <p className="text-[10px] text-muted-foreground mt-1">e.g. 1 Box = 10 Pills (Ratio = 10)</p>
        </div>
      </div>
    </form>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Units of Measure (UOM)</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage product measurement units and conversions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Units</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : uoms.length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-foreground"><Scale size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Categories</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : categories.length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-foreground"><Tag size={20} /></div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-card">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable 
          data={filteredUoms}
          columns={columns}
          keyExtractor={(u) => u.uom_id}
          searchPlaceholder="Search by unit name or category..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          actions={
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAddCategoryModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground border border-border rounded-md text-xs font-medium hover:bg-accent transition-colors"
              >
                <Plus size={14} /> Add Category
              </button>
              <button 
                onClick={() => setIsAddUomModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} /> Add UOM
              </button>
            </div>
          }
        />
      )}

      {/* Add Category Modal */}
      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add UOM Category"
        maxWidth="sm"
        footer={
          <>
            <button 
              type="button"
              onClick={() => setIsAddCategoryModalOpen(false)}
              className="px-3 py-1.5 bg-transparent text-muted-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              form="categoryForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              Save Category
            </button>
          </>
        }
      >
        {AddCategoryForm}
      </Modal>

      {/* Add UOM Modal */}
      <Modal
        isOpen={isAddUomModalOpen}
        onClose={() => setIsAddUomModalOpen(false)}
        title="Add Unit of Measure"
        maxWidth="md"
        footer={
          <>
            <button 
              type="button"
              onClick={() => setIsAddUomModalOpen(false)}
              className="px-3 py-1.5 bg-transparent text-muted-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              form="uomForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              Save Unit
            </button>
          </>
        }
      >
        {AddUomForm}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteUom}
        title="Delete UOM"
        message={
          <span>Are you sure you want to delete <strong>{selectedUom?.name}</strong>? This action cannot be undone.</span>
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
