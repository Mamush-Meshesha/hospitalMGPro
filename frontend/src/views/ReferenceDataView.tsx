import React, { useState, useEffect, useMemo } from 'react';
import { Database, Bed, Activity, CalendarClock, Plus, Edit, Trash2, ShieldAlert, Users, Tags, Stethoscope, Search, Folder, ChevronRight, ChevronDown, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

const CATEGORIES = [
  {
    id: 'clinical',
    name: 'Clinical & Encounters',
    icon: Stethoscope,
    tabs: [
      { id: 'visit_types', label: 'Visit Types', api: '/visittype' },
      { id: 'encounter_types', label: 'Encounter Types', api: '/encountertype' },
      { id: 'encounter_roles', label: 'Encounter Roles', api: '/encounterrole' },
      { id: 'order_types', label: 'Order Types', api: '/ordertype' },
      { id: 'order_frequencies', label: 'Order Frequencies', api: '/orderfrequency' }
    ]
  },
  {
    id: 'patient',
    name: 'Patient Demographics',
    icon: Users,
    tabs: [
      { id: 'patient_identifiers', label: 'Identifier Types', api: '/patientidentifiertype' },
      { id: 'relationship_types', label: 'Relationship Types', api: '/relationshiptype' }
    ]
  },
  {
    id: 'facility',
    name: 'Facilities & Locations',
    icon: Bed,
    tabs: [
      { id: 'bed_types', label: 'Bed Types', api: '/bedtype' },
      { id: 'location_tags', label: 'Location Tags', api: '/locationtag' }
    ]
  },
  {
    id: 'attributes',
    name: 'Custom Attributes',
    icon: Tags,
    tabs: [
      { id: 'person_attributes', label: 'Person Attributes', api: '/personattributetype' },
      { id: 'location_attributes', label: 'Location Attributes', api: '/locationattributetype' },
      { id: 'provider_attributes', label: 'Provider Attributes', api: '/providerattributetype' }
    ]
  }
];

export default function ReferenceDataView() {
  const [activeTab, setActiveTab] = useState(CATEGORIES[0].tabs[0]);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['clinical']));
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState({ uuid: '', name: '', description: '', display_name: '' });
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchApi(activeTab.api);
      setData(res.results || res || []);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleOpenModal = (item?: any) => {
    if (item) {
      setFormState({ 
        uuid: item.uuid, 
        name: item.name, 
        description: item.description || '', 
        display_name: item.display_name || '' 
      });
    } else {
      setFormState({ uuid: '', name: '', description: '', display_name: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formState };
      if (!payload.display_name) delete (payload as any).display_name;

      if (formState.uuid) {
        await fetchApi(`${activeTab.api}/${formState.uuid}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
      } else {
        await fetchApi(activeTab.api, {
          method: 'POST',
          body: JSON.stringify(payload)
        });
      }
      setIsModalOpen(false);
      loadData();
      toast.success(`Record ${formState.uuid ? 'updated' : 'created'} successfully`);
    } catch (err: any) {
      toast.error(err.message || 'Submission failed');
      console.error('Submission failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetire = async (uuid: string) => {
    if (!confirm('Are you sure you want to retire this record?')) return;
    try {
      await fetchApi(`${activeTab.api}/${uuid}`, { method: 'DELETE' });
      loadData();
      toast.success('Record deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete record');
      console.error('Retire failed', err);
    }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Reference Data</h1>
          <p className="text-muted-foreground text-sm">Manage Visit Types, Encounter Types, and Bed Types</p>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden min-h-[600px]">
        {/* Sidebar */}
        <div className="w-72 shrink-0 bg-card border border-border rounded-xl shadow-sm flex flex-col h-max sticky top-6 overflow-hidden">
          <div className="p-3 border-b border-border bg-muted/20">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
              <input 
                type="text" 
                placeholder="Search dictionaries..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1 max-h-[70vh]">
            {CATEGORIES.map((category) => {
              const filteredTabs = category.tabs.filter(t => t.label.toLowerCase().includes(searchQuery.toLowerCase()));
              if (searchQuery && filteredTabs.length === 0) return null;
              
              const isExpanded = expandedCategories.has(category.id) || searchQuery.length > 0;
              const toggleCategory = () => {
                if (searchQuery) return;
                const newExpanded = new Set(expandedCategories);
                if (isExpanded) newExpanded.delete(category.id);
                else newExpanded.add(category.id);
                setExpandedCategories(newExpanded);
              };

              const CategoryIcon = category.icon;

              return (
                <div key={category.id} className="flex flex-col">
                  <button 
                    onClick={toggleCategory}
                    className="flex items-center justify-between px-2 py-2 text-sm font-semibold text-foreground hover:bg-muted/50 rounded-md transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CategoryIcon size={16} className="text-primary" />
                      {category.name}
                    </div>
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex flex-col gap-0.5 mt-1 overflow-hidden ml-6"
                      >
                        {(searchQuery ? filteredTabs : category.tabs).map(tab => {
                          const isActive = activeTab.id === tab.id;
                          return (
                            <button
                              key={tab.id}
                              onClick={() => setActiveTab(tab)}
                              className={`
                                flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-all
                                ${isActive 
                                  ? 'bg-primary text-primary-foreground font-medium shadow-sm' 
                                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                }
                              `}
                            >
                              <FileText size={16} className={isActive ? 'opacity-100' : 'opacity-70'} />
                              <span>{tab.label}</span>
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between bg-muted/20">
            <h3 className="font-semibold text-lg text-foreground flex items-center gap-2">
              <Database size={18} className="text-primary" /> {activeTab.label}
            </h3>
            <button 
              onClick={() => handleOpenModal()}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus size={16} /> Create New
            </button>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : data.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ShieldAlert size={48} className="mx-auto mb-4 opacity-20" />
                <p>No records found.</p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase text-muted-foreground bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Name</th>
                    {activeTab.id === 'bed_types' && <th className="px-4 py-3">Display Name</th>}
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.map((item) => (
                    <tr key={item.uuid} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4 font-medium text-foreground">{item.name}</td>
                      {activeTab.id === 'bed_types' && <td className="px-4 py-4 text-muted-foreground">{item.display_name}</td>}
                      <td className="px-4 py-4 text-muted-foreground">{item.description || '-'}</td>
                      <td className="px-4 py-4 text-right space-x-2">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-1.5 text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => handleRetire(item.uuid)}
                          className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-card w-full max-w-md rounded-xl shadow-lg border border-border overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
                <h3 className="font-semibold text-lg text-foreground">
                  {formState.uuid ? 'Edit' : 'Create'} {activeTab.label.slice(0, -1)}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Name</label>
                  <input
                    required
                    type="text"
                    value={formState.name}
                    onChange={e => setFormState({...formState, name: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                    placeholder="e.g. Inpatient, Intensive Care"
                  />
                </div>
                
                {activeTab.id === 'bed_types' && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Display Name</label>
                    <input
                      required
                      type="text"
                      maxLength={10}
                      value={formState.display_name}
                      onChange={e => setFormState({...formState, display_name: e.target.value})}
                      className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground"
                      placeholder="e.g. ICU (Max 10 chars)"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={formState.description}
                    onChange={e => setFormState({...formState, description: e.target.value})}
                    className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4 border-t border-border">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-muted text-foreground rounded-md font-medium hover:bg-muted/80 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting} className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50">
                    {submitting ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
