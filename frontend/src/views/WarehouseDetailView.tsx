import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Package, Edit2, Trash2, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { warehousesApi } from '../api/warehouses.api';

export default function WarehouseDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadWarehouse = async () => {
      try {
        const data = await warehousesApi.getById(Number(id));
        setWarehouse(data);
      } catch (error) {
        console.error('Failed to load warehouse details', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadWarehouse();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Location not found.</p>
        <button onClick={() => navigate('/warehouses')} className="text-primary hover:underline">Return to Locations</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/warehouses')}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{warehouse.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">{warehouse.type?.replace('_', ' ')}</span>
              <StatusBadge label="Active" variant="success" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-colors">
            <Edit2 size={14} /> Edit Location
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-medium hover:bg-destructive/90 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
            <h3 className="font-semibold text-lg text-foreground">Location Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <Building2 size={16} />
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Assigned Branch</span>
                  <span className="font-medium text-foreground">{warehouse.branch?.name || 'Unknown'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <MapPin size={16} />
                </div>
                <div>
                  <span className="block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Physical Zone</span>
                  <span className="text-muted-foreground italic">Not specified</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm">
            <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Package size={16} className="text-muted-foreground" /> Current Inventory Overview
              </h3>
              <button 
                onClick={() => navigate('/inventory')}
                className="text-xs text-primary hover:underline"
              >
                View Full Inventory
              </button>
            </div>
            <div className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center gap-3">
              <Package size={32} className="opacity-20" />
              <p>Inventory snapshot loading...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
