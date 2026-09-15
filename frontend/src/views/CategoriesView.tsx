import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Layers, GitBranch, Edit2, Trash2, ArrowRight, Eye, Loader2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { categoriesApi } from '../api/categories.api';

export default function CategoriesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected Item
  const [selectedUOM, setSelectedUOM] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data: any = await categoriesApi.getAll();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories', error);
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
    const data = {
      name: formData.get('name'),
      category_id: Number(formData.get('category_id')),
      type: formData.get('type'),
      ratio: Number(formData.get('ratio'))
    };

    try {
      if (modalMode === 'add') {
        await categoriesApi.createUom(data);
      } else {
        await categoriesApi.updateUom(selectedUOM.uom_id, data);
      }
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save', error);
    }
  };

  const handleSaveCategory = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await categoriesApi.create({ name: formData.get('name') });
      setIsAddCategoryModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to save category', error);
    }
  };

  const handleDelete = async () => {
    try {
      await categoriesApi.deleteUom(selectedUOM.uom_id);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  // Flatten categories into UOMs for the table
  const uoms = categories.flatMap(cat => 
    (cat.uoms || []).map((u: any) => ({ ...u, category_name: cat.name }))
  );

  const filteredUOMs = uoms.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalCategories = categories.length;

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedUOM(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (uom: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedUOM(uom);
    setIsAddModalOpen(true);
  };

  const handleOpenView = (uom: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/categories/${uom.category_id}`);
  };

  const handleOpenDelete = (uom: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedUOM(uom);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Unit Name', render: (u: any) => <span className="font-medium text-foreground">{u.name}</span> },
    { key: 'category_name', label: 'Category', render: (u: any) => <span className="text-muted-foreground font-medium">{u.category_name}</span> },
    {
      key: 'type',
      label: 'Type',
      render: (u: any) => u.type === 'REFERENCE' ? 
        <StatusBadge label="Base Ref" variant="success" /> : 
        <StatusBadge label={u.type} variant="info" />
    },
    {
      key: 'ratio',
      label: 'Ratio / Conversion',
      render: (u: any) => u.type === 'REFERENCE' ? (
        <span className="text-xs opacity-50">1 : 1</span>
      ) : (
        <span className="flex items-center gap-2 text-xs font-mono">
          1 {u.name} <ArrowRight size={12} className="text-muted-foreground" /> {u.ratio} Base Unit(s)
        </span>
      )
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (u: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => handleOpenView(u, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
          <button onClick={(e) => handleOpenEdit(u, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={14} /></button>
          <button onClick={(e) => handleOpenDelete(u, e)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  const AddEditForm = (
    <form id="uomForm" onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Unit Name</label>
        <input name="name" required type="text" defaultValue={selectedUOM?.name || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. Pallet" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Category</label>
          <select name="category_id" required defaultValue={selectedUOM?.category_id || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="">Select Category...</option>
            {categories.map(c => (
              <option key={c.category_id} value={c.category_id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Type</label>
          <select name="type" required defaultValue={selectedUOM?.type || 'BIGGER'} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="BIGGER">Bigger than Base</option>
            <option value="REFERENCE">Base Reference Unit</option>
            <option value="SMALLER">Smaller than Base</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Ratio (vs Base Unit)</label>
        <input name="ratio" required type="number" step="0.01" defaultValue={selectedUOM?.ratio || '1.0'} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. 100" />
      </div>
    </form>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Categories & Units</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage product categories, UOMs, and conversions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">UOM Categories</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : totalCategories}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary"><Layers size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Defined Units</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : uoms.length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/50"><GitBranch size={20} /></div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-card">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          <div className="lg:col-span-1 bg-card border border-border rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/20 flex justify-between items-center">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Layers size={16} className="text-primary"/> Categories
              </h3>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {categories.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-sm">No categories found.</div>
              ) : (
                categories.map(c => (
                  <div key={c.category_id} className="p-3 flex justify-between items-center hover:bg-muted/30 transition-colors">
                    <span className="font-medium text-sm text-foreground">{c.name}</span>
                    <span className="text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full">{(c.uoms || []).length}</span>
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="lg:col-span-3">
            <DataTable 
              data={filteredUOMs}
              columns={columns}
              keyExtractor={(u) => u.uom_id}
              searchPlaceholder="Search units or categories..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              onRowClick={(item) => handleOpenView(item)}
              actions={
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsAddCategoryModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-colors"
                  >
                    <Layers size={14} /> New Category
                  </button>
                  <button 
                    onClick={handleOpenAdd}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
                  >
                    <Plus size={14} /> New UOM
                  </button>
                </div>
              }
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={modalMode === 'add' ? 'Add Unit of Measure' : 'Edit Unit of Measure'}
        maxWidth="md"
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
              form="uomForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              {modalMode === 'add' ? 'Save UOM' : 'Update UOM'}
            </button>
          </>
        }
      >
        {AddEditForm}
      </Modal>

      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add Category"
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
        <form id="categoryForm" onSubmit={handleSaveCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Category Name</label>
            <input name="name" required type="text" className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. Weight, Volume, Length" />
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Unit"
        message={
          <span>Are you sure you want to delete <strong>{selectedUOM?.name}</strong>? This will affect any products linked to this UOM.</span>
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
