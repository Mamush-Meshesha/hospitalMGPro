import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Barcode, Database, Edit2, Trash2, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { productsApi } from '../api/products.api';

export default function ProductDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const data = await productsApi.getById(Number(id));
        setProduct(data);
      } catch (error) {
        console.error('Failed to load product details', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Product not found.</p>
        <button onClick={() => navigate('/products')} className="text-primary hover:underline">Return to Products</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/products')}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm font-mono text-primary">
              <span>{product.sku}</span>
              {product.concept_id && (
                <span className="bg-primary/10 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                  <Database size={10} /> EMR ID: {product.concept_id}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-colors">
            <Edit2 size={14} /> Edit
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-medium hover:bg-destructive/90 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Product Information</h3>
            
            <div className="grid grid-cols-2 gap-y-6 gap-x-8 text-sm">
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Category</span>
                <span className="font-medium text-foreground">{product.category || '-'}</span>
              </div>
              <div>
                <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Reorder Level</span>
                <span className="font-medium text-amber-600">{product.reorder_level} Units</span>
              </div>
              
              <div className="col-span-2 grid grid-cols-2 bg-muted/20 p-4 rounded-md border border-border">
                <div>
                  <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Purchase UOM</span>
                  <span className="font-medium text-foreground">{product.purchase_uom?.name || '-'}</span>
                </div>
                <div>
                  <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Store / Base UOM</span>
                  <span className="font-medium text-foreground">{product.store_uom?.name || '-'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg shadow-sm p-6">
            <h3 className="font-semibold text-lg text-foreground mb-4">Inventory Status</h3>
            {product.stock_batches && product.stock_batches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 border-b border-border text-xs uppercase text-muted-foreground tracking-wider">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Warehouse</th>
                      <th className="px-4 py-3 font-semibold">Batch No.</th>
                      <th className="px-4 py-3 font-semibold text-right">Quantity</th>
                      <th className="px-4 py-3 font-semibold text-right">Expiration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {product.stock_batches.map((batch: any) => (
                      <tr key={batch.batch_id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/inventory/${batch.batch_id}`)}>
                        <td className="px-4 py-3 font-medium text-foreground">{batch.bin?.zone?.warehouse?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{batch.batch_number}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-foreground">{batch.quantity}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">{new Date(batch.expiration_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border rounded-md text-muted-foreground">
                <p>No inventory batches found for this product.</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-4">
            <h3 className="font-semibold text-lg text-foreground">Attributes</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Type</span>
                {product.is_drug ? <StatusBadge label="Drug" variant="success" /> : <StatusBadge label="Supply" variant="info" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Expiration</span>
                {product.has_expiration ? <StatusBadge label="Tracked" variant="warning" /> : <StatusBadge label="Not Tracked" variant="default" />}
              </div>
            </div>
          </div>

          {product.barcode && (
            <div className="bg-card border border-border rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg text-foreground mb-4">Barcode</h3>
              <div className="p-6 bg-background border border-border rounded-md flex justify-center">
                <div className="flex flex-col items-center gap-2 opacity-80">
                  <Barcode size={64} className="text-foreground" strokeWidth={1} />
                  <span className="text-sm font-mono tracking-widest">{product.barcode}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
