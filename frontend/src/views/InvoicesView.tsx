import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Receipt, DollarSign, CreditCard, ExternalLink, Calendar, Eye, Edit2, Trash2, Loader2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Modal } from '../components/ui/Modal';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { invoicesApi } from '../api/invoices.api';
import { suppliersApi } from '../api/suppliers.api';
import { poApi } from '../api/po.api';

export default function InvoicesView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [pos, setPos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // Selected Item
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

  const navigate = useNavigate();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invData, supData, poData] = await Promise.all([
        invoicesApi.getAll(),
        suppliersApi.getAll(),
        poApi.getAll()
      ]);
      setInvoices(invData);
      setSuppliers(supData);
      setPos(poData);
    } catch (error) {
      console.error('Failed to load invoices', error);
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
      invoice_number: formData.get('invoice_number'),
      supplier_id: Number(formData.get('supplier_id')),
      po_id: formData.get('po_id') ? Number(formData.get('po_id')) : null,
      total_amount: Number(formData.get('total_amount'))
    };

    try {
      if (modalMode === 'add') {
        await invoicesApi.create(data);
      } else {
        await invoicesApi.update(selectedInvoice.invoice_id, data);
      }
      setIsAddModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handleDelete = async () => {
    try {
      await invoicesApi.delete(selectedInvoice.invoice_id);
      setIsDeleteModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Delete failed', error);
    }
  };

  const handlePayConfirm = async () => {
    try {
      await invoicesApi.update(selectedInvoice.invoice_id, { status: 'PAID' });
      setIsPayModalOpen(false);
      loadData();
    } catch (error) {
      console.error('Payment failed', error);
    }
  };

  const filteredInvoices = invoices.filter(i => 
    i.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    i.supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.po?.po_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUnpaid = invoices.filter(i => i.status === 'UNPAID')
                              .reduce((acc, curr) => acc + Number(curr.total_amount), 0);

  const handleOpenAdd = () => {
    setModalMode('add');
    setSelectedInvoice(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (invoice: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setModalMode('edit');
    setSelectedInvoice(invoice);
    setIsAddModalOpen(true);
  };

  const handlePayClick = (invoice: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoice(invoice);
    setIsPayModalOpen(true);
  };

  const handleOpenView = (invoice: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/invoices/${invoice.invoice_id}`);
  };

  const handleOpenDelete = (invoice: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoice(invoice);
    setIsDeleteModalOpen(true);
  };

  const columns = [
    { key: 'invoice_number', label: 'Invoice Number', render: (i: any) => <span className="font-mono font-bold text-foreground">{i.invoice_number}</span> },
    { key: 'supplier', label: 'Supplier', render: (i: any) => <span className="font-medium text-foreground">{i.supplier?.name}</span> },
    { key: 'po_reference', label: 'PO Reference', render: (i: any) => <span className="font-mono text-xs text-primary">{i.purchase_order?.po_number || 'N/A'}</span> },
    { key: 'date', label: 'Date Received', render: (i: any) => <span className="text-muted-foreground flex items-center gap-1.5"><Calendar size={14} className="opacity-70" /> {new Date(i.created_at).toLocaleDateString()}</span> },
    { key: 'amount', label: 'Amount', align: 'right' as const, render: (i: any) => <span className="font-semibold text-foreground">${Number(i.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span> },
    {
      key: 'status',
      label: 'Status',
      align: 'center' as const,
      render: (i: any) => i.status === 'UNPAID' ? 
        <StatusBadge label="Unpaid" variant="destructive" /> : 
        <StatusBadge label="Paid" variant="success" />
    },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (i: any) => (
        <div className="flex items-center justify-end gap-1">
          <button onClick={(e) => handleOpenView(i, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
          
          {i.status === 'UNPAID' ? (
            <>
              <button 
                onClick={(e) => handlePayClick(i, e)}
                className="text-xs font-semibold text-primary hover:underline px-2 py-1 bg-primary/10 rounded-md transition-colors ml-2"
              >
                Mark Paid
              </button>
              <button onClick={(e) => handleOpenEdit(i, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors ml-2"><Edit2 size={14} /></button>
              <button onClick={(e) => handleOpenDelete(i, e)} className="p-1 text-muted-foreground hover:text-destructive transition-colors"><Trash2 size={14} /></button>
            </>
          ) : (
            <div className="flex items-center ml-2">
              <span className="text-[10px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Settled</span>
            </div>
          )}
        </div>
      )
    }
  ];

  const AddEditForm = (
    <form id="invoiceForm" onSubmit={handleSave} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Supplier</label>
          <select name="supplier_id" required defaultValue={selectedInvoice?.supplier_id || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="">Select Supplier...</option>
            {suppliers.map(s => (
              <option key={s.supplier_id} value={s.supplier_id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">PO Reference</label>
          <select name="po_id" defaultValue={selectedInvoice?.po_id || ''} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
            <option value="">Link to PO... (Optional)</option>
            {pos.map(po => (
              <option key={po.po_id} value={po.po_id}>{po.po_number}</option>
            ))}
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Invoice Number</label>
          <input name="invoice_number" required type="text" defaultValue={selectedInvoice?.invoice_number || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="e.g. INV-2023-123" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Total Amount</label>
          <input name="total_amount" required type="number" step="0.01" defaultValue={selectedInvoice?.total_amount || ''} className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20" placeholder="0.00" />
        </div>
      </div>
    </form>
  );

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Invoices & Payables</h1>
          <p className="text-xs text-muted-foreground mt-1">Track supplier invoices and manage accounts payable.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Invoices</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : invoices.length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-muted/50 flex items-center justify-center text-foreground"><Receipt size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-destructive mb-1">Accounts Payable</div>
            <div className="text-2xl font-bold text-destructive">{isLoading ? <Loader2 size={20} className="animate-spin" /> : `$${totalUnpaid.toLocaleString('en-US', {minimumFractionDigits: 2})}`}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-red-50 flex items-center justify-center text-red-600 dark:bg-red-950/50"><DollarSign size={20} /></div>
        </div>
        <div className="bg-background border border-border p-4 rounded-lg flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 mb-1">Paid This Month</div>
            <div className="text-2xl font-bold text-foreground">{isLoading ? <Loader2 size={20} className="animate-spin" /> : invoices.filter(i => i.status === 'PAID').length}</div>
          </div>
          <div className="h-10 w-10 rounded-md bg-emerald-50 flex items-center justify-center text-emerald-600 dark:bg-emerald-950/50"><CreditCard size={20} /></div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center border border-border rounded-lg bg-card">
          <Loader2 size={32} className="animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable 
          data={filteredInvoices}
          columns={columns}
          keyExtractor={(i) => i.invoice_id}
          searchPlaceholder="Search invoice, PO, or supplier..."
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          onRowClick={(item) => handleOpenView(item)}
          actions={
            <button 
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <Plus size={14} /> Log Invoice
            </button>
          }
        />
      )}

      {/* Add / Edit Invoice Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={modalMode === 'add' ? 'Log New Invoice' : 'Edit Invoice'}
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
              form="invoiceForm"
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              {modalMode === 'add' ? 'Save Invoice' : 'Update Invoice'}
            </button>
          </>
        }
      >
        {AddEditForm}
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Record Payment"
        maxWidth="sm"
        footer={
          <>
            <button 
              type="button"
              onClick={() => setIsPayModalOpen(false)}
              className="px-3 py-1.5 bg-transparent text-muted-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="button"
              onClick={handlePayConfirm}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md text-sm font-medium transition-colors"
            >
              Confirm Payment
            </button>
          </>
        }
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="p-4 rounded-md bg-muted/30 border border-border space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider font-semibold">Invoice</span>
                <span className="font-mono font-semibold">{selectedInvoice.invoice_number}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground uppercase tracking-wider font-semibold">Supplier</span>
                <span className="font-medium">{selectedInvoice.supplier?.name}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                <span className="font-bold text-foreground">Total Due</span>
                <span className="font-bold text-destructive">${Number(selectedInvoice.total_amount).toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Payment Method</label>
              <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20">
                <option>Bank Transfer (EFT)</option>
                <option>Credit Card</option>
                <option>Cash / Petty Cash</option>
                <option>Cheque</option>
              </select>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Invoice"
        message={
          <span>Are you sure you want to delete invoice <strong>{selectedInvoice?.invoice_number}</strong>? This action cannot be undone.</span>
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
