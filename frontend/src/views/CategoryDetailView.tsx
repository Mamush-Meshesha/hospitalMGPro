import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tags, Edit2, Trash2, Loader2 } from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';
import { categoriesApi } from '../api/categories.api';

export default function CategoryDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategory = async () => {
      try {
        const data = await categoriesApi.getById(Number(id));
        setCategory(data);
      } catch (error) {
        console.error('Failed to load category', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) loadCategory();
  }, [id]);

  if (isLoading) {
    return (
      <div className="w-full h-full min-h-[500px] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-4">
        <p className="text-muted-foreground">Category not found.</p>
        <button onClick={() => navigate('/categories')} className="text-primary hover:underline">Return to Categories</button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/categories')}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">{category.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">Category</span>
              <StatusBadge label="Active" variant="success" />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground rounded-md text-xs font-medium hover:bg-muted transition-colors">
            <Edit2 size={14} /> Edit Category
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-medium hover:bg-destructive/90 transition-colors">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm p-6 space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Tags size={20} />
          </div>
          <div>
            <span className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Assigned Units</span>
            <span className="font-medium text-foreground">{category.uoms?.length || 0} Units Linked</span>
          </div>
        </div>
      </div>
    </div>
  );
}
