import React, { useState, useEffect } from 'react';
import { Building2, Plus, Search, Check, Globe } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Tenant {
  tenant_id: number;
  name: string;
  domain: string | null;
  active: boolean;
  created_at: string;
}

export default function TenantsView() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminFirstName, setAdminFirstName] = useState('');
  const [adminLastName, setAdminLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTenants = async () => {
    try {
      setIsLoading(true);
      const data = await fetchApi('/tenants');
      setTenants(data);
    } catch (err: any) {
      toast.error('Failed to load tenants: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !adminUsername || !adminPassword) {
      toast.error('Name, Admin Username, and Admin Password are required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await fetchApi('/tenants', {
        method: 'POST',
        body: JSON.stringify({
          name,
          domain,
          adminUsername,
          adminPassword,
          adminFirstName,
          adminLastName
        })
      });
      toast.success('Tenant created successfully!');
      setIsCreateModalOpen(false);
      
      // Reset form
      setName('');
      setDomain('');
      setAdminUsername('');
      setAdminPassword('');
      setAdminFirstName('');
      setAdminLastName('');
      
      loadTenants();
    } catch (err: any) {
      toast.error('Failed to create tenant: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = tenants.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.domain && t.domain.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Tenant Management</h1>
          <p className="text-muted-foreground text-sm">Manage hospital organizations, domains, and global instances</p>
        </div>

        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Create New Tenant
        </button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm flex-1 flex flex-col overflow-hidden relative">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-center justify-between gap-4 bg-muted/20">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              type="text"
              placeholder="Search tenants..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:border-primary transition-colors text-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <span className="text-muted-foreground flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                Loading tenants...
              </span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-12">
              <Building2 size={48} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No tenants found</p>
              <p className="text-sm opacity-70">Adjust your search or create a new tenant.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10 shadow-sm border-b border-border">
                <tr>
                  <th className="font-semibold p-4 w-16 text-center">ID</th>
                  <th className="font-semibold p-4">Tenant Name</th>
                  <th className="font-semibold p-4">Domain</th>
                  <th className="font-semibold p-4">Status</th>
                  <th className="font-semibold p-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((tenant) => (
                  <tr key={tenant.tenant_id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-center font-mono text-xs text-muted-foreground">
                      {tenant.tenant_id}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground flex items-center gap-2">
                        <Building2 size={14} className="text-primary opacity-70" />
                        {tenant.name}
                      </div>
                    </td>
                    <td className="p-4">
                      {tenant.domain ? (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Globe size={14} />
                          {tenant.domain}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/50 italic">None</span>
                      )}
                    </td>
                    <td className="p-4">
                      {tenant.active ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {new Date(tenant.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsCreateModalOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-border bg-muted/20">
                <h3 className="text-lg font-bold text-foreground">Create New Tenant</h3>
                <p className="text-sm text-muted-foreground">Provision a new isolated environment.</p>
              </div>

              <form onSubmit={handleCreate} className="overflow-y-auto p-5 space-y-6">
                
                {/* Organization Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Organization</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Hospital / Tenant Name *</label>
                    <input 
                      type="text" 
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. St. Mary's Hospital"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary transition-colors outline-none"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Custom Domain (Optional)</label>
                    <input 
                      type="text" 
                      value={domain}
                      onChange={e => setDomain(e.target.value)}
                      placeholder="e.g. stmarys.local"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary transition-colors outline-none"
                    />
                  </div>
                </div>

                {/* Primary Admin Details */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Initial Administrator Account</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">First Name</label>
                      <input 
                        type="text" 
                        value={adminFirstName}
                        onChange={e => setAdminFirstName(e.target.value)}
                        placeholder="Admin"
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary transition-colors outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Last Name</label>
                      <input 
                        type="text" 
                        value={adminLastName}
                        onChange={e => setAdminLastName(e.target.value)}
                        placeholder="User"
                        className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary transition-colors outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Admin Username *</label>
                    <input 
                      type="text" 
                      required
                      value={adminUsername}
                      onChange={e => setAdminUsername(e.target.value)}
                      placeholder="e.g. admin_stmarys"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary transition-colors outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Temporary Password *</label>
                    <input 
                      type="password" 
                      required
                      value={adminPassword}
                      onChange={e => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:border-primary transition-colors outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-5 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                        Provisioning...
                      </span>
                    ) : (
                      <>
                        <Check size={16} />
                        Create Tenant
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
