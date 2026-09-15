import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building, Truck, Mail, Phone, Edit2, Trash2, Eye, Loader2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { suppliersApi } from '../api/suppliers.api';

export default function SuppliersView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected Item
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await suppliersApi.getAll();
      setSuppliers(data);
    } catch (error) {
      console.error('Failed to load suppliers', error);
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
      tax_id: formData.get('tax_id'),
      contact_email: formData.get('email'),
      contact_phone: formData.get('phone')
    };

    try {
      if (modalMode === 'add') {
        await suppliersApi.create(data);
      } else {
        await suppliersApi.update(selectedSupplier.supplier_id, data);
      }
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handleDelete = async () => {
    try {
      await suppliersApi.delete(selectedSupplier.supplier_id);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedSupplier(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (supplier: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedSupplier(supplier);
    setIsAddModalOpen(true);
  };

  const handleOpenView = (supplier: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/suppliers/${supplier.supplier_id}`);
  };

  const handleOpenDelete = (supplier: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedSupplier(supplier);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Supplier Name',
      render: (s: any) => (
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded border border-border bg-muted/50 flex items-center justify-center text-primary font-bold text-[10px] uppercase">
            {s.name?.substring(0,2)}
          </div>
          <span className="font-semibold text-foreground">{s.name}</span>
        </div>
      )
    },
    { key: 'tax_id', label: 'Tax ID', render: (s: any) => <span className="font-mono text-xs text-muted-foreground">{s.tax_id}</span> },
    {
      key: 'email',
      label: 'Contact Email',
      render: (s: any) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Mail size={14} className="opacity-70" /> {s.contact_email}
        </div>
      )
    },
    {
      key: 'phone',
      label: 'Phone Number',
      render: (s: any) => (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Phone size={14} className="opacity-70" /> {s.contact_phone}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (s: any) => s.is_active !== false ? 
        <StatusBadge label="Active" variant="success" /> : 
        <StatusBadge label="Inactive" variant="default" />
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (s: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => handleOpenView(s, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
          <button onClick={(e) => handleOpenEdit(s, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={14} /></button>
          <button onClick={(e) => handleOpenDelete(s, e)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  const AddEditForm = (
    <form id="supplierForm" onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Company / Supplier Name</label>
        <input name="name" required type="text" defaultValue={selectedSupplier?.name || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. PharmaCorp Global" />
      </div>
      
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Tax ID / Business Number</label>
        <input name="tax_id" type="text" defaultValue={selectedSupplier?.tax_id || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. TAX-89234" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Contact Email</label>
          <input name="email" type="email" defaultValue={selectedSupplier?.contact_email || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="sales@company.com" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Contact Phone</label>
          <input name="phone" type="tel" defaultValue={selectedSupplier?.contact_phone || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="+1 (555) 000-0000" />
        </div>
      </div>
    </form>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Suppliers & Vendors</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage the supplier directory and their procurement accounts.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Suppliers</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : suppliers.length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-foreground"><Building size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1 flex items-center gap-2">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
              Active Vendors
            </div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : suppliers.filter(s => s.is_active !== false).length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/50"><Truck size={20} /></div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-card">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable 
          data={filteredSuppliers}
          columns={columns}
          keyExtractor={(s) => s.supplier_id}
          searchPlaceholder="Search suppliers..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onRowClick={(item) => handleOpenView(item)}
          actions={
            <button 
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} /> Add Supplier
            </button>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Supplier' : 'Edit Supplier'}
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
              form="supplierForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              {modalMode === 'add' ? 'Save Supplier' : 'Update Supplier'}
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
        title="Delete Supplier"
        message={
          <span>Are you sure you want to delete <strong>{selectedSupplier?.name}</strong>? This will remove them from the active vendor list.</span>
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
