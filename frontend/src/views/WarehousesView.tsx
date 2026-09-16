import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Map, Archive, Edit2, Trash2, Box, Eye, Building, Loader2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { warehousesApi } from '../api/warehouses.api';

export default function WarehousesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddBranchModalOpen, setIsAddBranchModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected Item
  const [selectedWarehouse, setSelectedWarehouse] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [whData, branchData] = await Promise.all([
        warehousesApi.getAll(),
        warehousesApi.getBranches()
      ]);
      setWarehouses(whData);
      setBranches(branchData);
    } catch (error) {
      console.error('Failed to load warehouses', error);
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
      type: formData.get('type'),
      branch_id: Number(formData.get('branch_id'))
    };

    try {
      if (modalMode === 'add') {
        await warehousesApi.create(data);
      } else {
        await warehousesApi.update(selectedWarehouse.warehouse_id, data);
      }
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handleSaveBranch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await warehousesApi.createBranch({ name: formData.get('name') });
      setIsAddBranchModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save branch failed', error);
    }
  };

  const handleDelete = async () => {
    try {
      await warehousesApi.delete(selectedWarehouse.warehouse_id);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const filteredWarehouses = warehouses.filter(w => 
    w.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.branch?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedWarehouse(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (warehouse: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedWarehouse(warehouse);
    setIsAddModalOpen(true);
  };

  const handleOpenView = (warehouse: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/warehouses/${warehouse.warehouse_id}`);
  };

  const handleOpenDelete = (warehouse: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedWarehouse(warehouse);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    { key: 'name', label: 'Warehouse Name', render: (w: any) => <span className="font-bold text-foreground">{w.name}</span> },
    {
      key: 'type',
      label: 'Type',
      render: (w: any) => {
        let variant: 'default' | 'success' | 'warning' | 'destructive' | 'info' = 'default';
        if (w.type === 'INTERNAL') variant = 'info';
        if (w.type === 'SUPPLIER_DOCK') variant = 'warning';
        if (w.type === 'CUSTOMER_ZONE') variant = 'success';
        if (w.type === 'QUARANTINE') variant = 'destructive';
        return <StatusBadge label={w.type?.replace('_', ' ') || 'Unknown'} variant={variant} />;
      }
    },
    { key: 'branch', label: 'Assigned Branch', render: (w: any) => <span className="text-muted-foreground flex items-center gap-1.5"><Building size={14} className="opacity-70" /> {w.branch?.name || '-'}</span> },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (w: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => handleOpenView(w, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
          <button onClick={(e) => handleOpenEdit(w, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={14} /></button>
          <button onClick={(e) => handleOpenDelete(w, e)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
        </div>
      )
    }
  ];

  const AddEditForm = (
    <form id="whForm" onSubmit={handleSave} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Warehouse Name</label>
        <input name="name" required type="text" defaultValue={selectedWarehouse?.name || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. Main Hospital Storage" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Warehouse Type</label>
          <select name="type" required defaultValue={selectedWarehouse?.type || 'INTERNAL'} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="INTERNAL">Internal Storage</option>
            <option value="SUPPLIER_DOCK">Supplier Receiving Dock</option>
            <option value="CUSTOMER_ZONE">Customer Dispensing Zone</option>
            <option value="QUARANTINE">Quarantine / Recall</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Assigned Branch</label>
          <select name="branch_id" required defaultValue={selectedWarehouse?.branch_id || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="">Select Branch...</option>
            {branches.map(b => (
              <option key={b.branch_id} value={b.branch_id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>
    </form>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Warehouses & Bins</h1>
          <p className="text-xs text-muted-foreground mt-1">Manage physical inventory locations and storage structures.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Locations</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : warehouses.length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-foreground"><Map size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Internal Storage</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : warehouses.filter(w => w.type === 'INTERNAL').length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/50"><Archive size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-blue-600 mb-1">Transit Zones</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : warehouses.filter(w => w.type !== 'INTERNAL' && w.type !== 'QUARANTINE').length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-blue-50 flex items-center justify-center text-blue-600 dark:bg-blue-950/50"><Box size={20} /></div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-card">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable 
          data={filteredWarehouses}
          columns={columns}
          keyExtractor={(w) => w.warehouse_id}
          searchPlaceholder="Search locations..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onRowClick={(item) => handleOpenView(item)}
          actions={
            <div className="flex gap-2">
              <button 
                onClick={() => setIsAddBranchModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-foreground border border-border rounded-md text-xs font-medium hover:bg-accent transition-colors"
              >
                <Plus size={14} /> Add Branch
              </button>
              <button 
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
              >
                <Plus size={14} /> Add Location
              </button>
            </div>
          }
        />
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={modalMode === 'add' ? 'Add New Location' : 'Edit Location'}
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
              form="whForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              {modalMode === 'add' ? 'Save Location' : 'Update Location'}
            </button>
          </>
        }
      >
        {AddEditForm}
      </Modal>

      {/* Add Branch Modal */}
      <Modal
        isOpen={isAddBranchModalOpen}
        onClose={() => setIsAddBranchModalOpen(false)}
        title="Add New Branch"
        maxWidth="sm"
        footer={
          <>
            <button 
              type="button"
              onClick={() => setIsAddBranchModalOpen(false)}
              className="px-3 py-1.5 bg-transparent text-muted-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              form="branchForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              Save Branch
            </button>
          </>
        }
      >
        <form id="branchForm" onSubmit={handleSaveBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Branch Name</label>
            <input name="name" required type="text" className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. Main Hospital, Outpatient Clinic" />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Location"
        message={
          <span>Are you sure you want to delete <strong>{selectedWarehouse?.name}</strong>? Ensure all inventory is transferred out first.</span>
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
