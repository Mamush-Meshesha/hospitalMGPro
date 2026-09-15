import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, TrendingUp, TrendingDown, ArrowRight, Move, Clock, Eye, ShieldCheck, User, Loader2 } from 'lucide-react';
import { DataTable } from '../components/ui/DataTable';
import { StatusBadge } from '../components/ui/StatusBadge';
import { movementsApi } from '../api/movements.api';

export default function StockMovementsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'RECEIPT' | 'TRANSFER' | 'DISPENSE' | 'ADJUSTMENT'>('ALL');
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await movementsApi.getAll();
      
      const getDerivedType = (m: any) => {
        if (m.reference?.toLowerCase().includes('adjust')) return 'ADJUSTMENT';
        if (m.source_wh_id && m.dest_wh_id) return 'TRANSFER';
        if (m.source_wh_id && !m.dest_wh_id) return 'DISPENSE';
        if (!m.source_wh_id && m.dest_wh_id) return 'RECEIPT';
        return 'UNKNOWN';
      };

      const enriched = data.map((m: any) => ({
        ...m,
        movement_type: getDerivedType(m),
        created_at: m.date_moved,
        reference_type: m.reference
      }));

      setMovements(enriched);
    } catch (error) {
      console.error('Failed to load movements', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMovements = movements.filter(m => {
    const matchesSearch = m.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.reference_type?.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    
    if (activeTab === 'ALL') return true;
    return m.movement_type === activeTab;
  });

  const getMovementIcon = (type: string) => {
    switch(type) {
      case 'RECEIPT': return <TrendingUp size={14} className="text-emerald-600" />;
      case 'DISPENSE': return <TrendingDown size={14} className="text-amber-600" />;
      case 'TRANSFER': return <ArrowLeftRight size={14} className="text-blue-600" />;
      case 'ADJUSTMENT': return <Move size={14} className="text-destructive" />;
      default: return <Move size={14} className="text-muted-foreground" />;
    }
  };

  const getMovementVariant = (type: string) => {
    switch(type) {
      case 'RECEIPT': return 'success';
      case 'DISPENSE': return 'warning';
      case 'TRANSFER': return 'info';
      case 'ADJUSTMENT': return 'destructive';
      default: return 'default';
    }
  };

  const navigate = useNavigate();

  const handleOpenView = (movement: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigate(`/movements/${movement.movement_id}`);
  };

  const columns = [
    {
      key: 'type',
      label: 'Type',
      render: (m: any) => (
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded bg-muted/50`}>{getMovementIcon(m.movement_type)}</div>
          <span className="font-semibold text-xs text-foreground uppercase tracking-wider">{m.movement_type}</span>
        </div>
      )
    },
    { key: 'date', label: 'Date & Time', render: (m: any) => <span className="text-muted-foreground font-mono text-xs flex items-center gap-1.5"><Clock size={12} className="opacity-70" /> {new Date(m.created_at).toLocaleString()}</span> },
    { key: 'product', label: 'Product', render: (m: any) => <span className="font-medium text-foreground">{m.product?.name || 'Unknown'}</span> },
    {
      key: 'route',
      label: 'Route / Location',
      render: (m: any) => (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted-foreground truncate max-w-[100px]">{m.source_warehouse?.name || '-'}</span>
          <ArrowRight size={12} className="text-muted-foreground/50 flex-shrink-0" />
          <span className="text-foreground font-medium truncate max-w-[100px]">{m.destination_warehouse?.name || '-'}</span>
        </div>
      )
    },
    {
      key: 'qty',
      label: 'Quantity',
      align: 'right' as const,
      render: (m: any) => (
        <span className={`font-mono font-bold ${Number(m.quantity) > 0 ? 'text-emerald-600' : 'text-destructive'}`}>
          {Number(m.quantity) > 0 ? '+' : ''}{m.quantity}
        </span>
      )
    },
    { key: 'reference', label: 'Reference', render: (m: any) => <span className="font-mono text-xs text-primary">{m.reference_type || 'N/A'}</span> },
    {
      key: 'actions',
      label: '',
      align: 'right' as const,
      render: (m: any) => (
        <div className="flex items-center justify-end">
          <button onClick={(e) => handleOpenView(m, e)} className="p-1 text-muted-foreground hover:text-primary transition-colors"><Eye size={14} /></button>
        </div>
      )
    }
  ];

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Stock Ledger (Movements)</h1>
          <p className="text-xs text-muted-foreground mt-1">Immutable audit trail of all inventory transactions.</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col">
        {/* Internal Tabs */}
        <div className="flex items-center gap-1 p-1 border-b border-border overflow-x-auto">
          <button 
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${activeTab === 'ALL' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            All Movements
          </button>
          <button 
            onClick={() => setActiveTab('RECEIPT')}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'RECEIPT' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            Receipts (In)
          </button>
          <button 
            onClick={() => setActiveTab('DISPENSE')}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'DISPENSE' ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            Dispense (Out)
          </button>
          <button 
            onClick={() => setActiveTab('TRANSFER')}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'TRANSFER' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            Internal Transfers
          </button>
          <button 
            onClick={() => setActiveTab('ADJUSTMENT')}
            className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-2 ${activeTab === 'ADJUSTMENT' ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}
          >
            Adjustments
          </button>
        </div>

        <div className="border-none shadow-none">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 size={32} className="animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable 
              data={filteredMovements}
              columns={columns}
              keyExtractor={(m) => m.movement_id}
              searchPlaceholder="Search product, reference..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              onRowClick={(item) => handleOpenView(item)}
            />
          )}
        </div>
      </div>

    </div>
  );
}
