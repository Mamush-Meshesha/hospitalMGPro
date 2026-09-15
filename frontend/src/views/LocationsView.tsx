import React, { useState, useMemo, useEffect } from 'react';
import { Search, MapPin, Building2, Bed, Users, Filter, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
import { fetchApi } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface HospitalLocation {
  id: string;
  name: string;
  type: string;
  parentId: string | null;
  totalBeds: number;
  availableBeds: number;
  activeAdmissions: number;
}

const initialLocations: HospitalLocation[] = [];

export default function LocationsView() {
  const [locations, setLocations] = useState<HospitalLocation[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bedTypes, setBedTypes] = useState<any[]>([]);
  const [locationTags, setLocationTags] = useState<any[]>([]);
  const [allBeds, setAllBeds] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [locData, btData, ltData, bedsData] = await Promise.all([
        fetchApi('/location?v=full'),
        fetchApi('/bedtype'),
        fetchApi('/locationtag'),
        fetchApi('/bed')
      ]);

      if (locData && locData.results) {
        const mapped = locData.results.map((loc: any) => ({
          id: loc.location_id?.toString() || loc.uuid,
          name: loc.name,
          type: loc.tags?.length > 0 ? loc.tags[0].name : loc.description || 'Ward',
          parentId: loc.parent_location ? loc.parent_location.toString() : null,
          totalBeds: loc.total_capacity || 0,
          availableBeds: loc.available_beds || 0,
          activeAdmissions: loc.active_admissions || 0
        }));
        setLocations(mapped);
        
        if (mapped.length > 0 && expandedNodes.size === 0) {
          const firstRoot = mapped.find((l: any) => l.parentId === null);
          if (firstRoot) {
            setExpandedNodes(new Set([firstRoot.id]));
          }
        }
      }

      if (btData) setBedTypes(btData.results || btData || []);
      if (ltData) setLocationTags(ltData.results || ltData || []);
      if (bedsData) setAllBeds(bedsData.results || bedsData || []);
    } catch (err) {
      console.error("Failed to load location data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isManageBedsOpen, setIsManageBedsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<HospitalLocation | null>(null);

  // New Location Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('');
  const [newParentId, setNewParentId] = useState('none');
  const [newTotalBeds, setNewTotalBeds] = useState('0');
  
  // New Location Address State
  const [newAddress1, setNewAddress1] = useState('');
  const [newCityVillage, setNewCityVillage] = useState('');
  const [newStateProvince, setNewStateProvince] = useState('');

  // Manage Beds Form State
  const [manageTotalBeds, setManageTotalBeds] = useState('');
  const [newBedNumber, setNewBedNumber] = useState('');
  const [newBedTypeId, setNewBedTypeId] = useState('');
  
  const selectedLocationBeds = useMemo(() => {
    if (!selectedLocation) return [];
    return allBeds.filter(b => b.bed_location_map?.some((m: any) => m.location?.uuid === selectedLocation.id || m.location_id?.toString() === selectedLocation.id));
  }, [allBeds, selectedLocation]);

  // Derived KPIs
  const totalWards = useMemo(() => locations.filter(l => l.type === 'Ward').length, [locations]);
  const totalAvailableBeds = useMemo(() => locations.filter(l => l.type === 'Ward').reduce((acc, curr) => acc + (Number(curr.availableBeds) || 0), 0), [locations]);
  const totalInpatients = useMemo(() => locations.reduce((acc, curr) => acc + (Number(curr.activeAdmissions) || 0), 0), [locations]);

  // Aggregate locations for Buildings
  const computedLocations = useMemo(() => {
    const locMap = new Map(locations.map(l => [l.id, { ...l }]));
    
    const getAggregate = (id: string): { total: number, available: number, admitted: number } => {
      const children = locations.filter(l => l.parentId === id);
      let total = 0;
      let available = 0;
      let admitted = 0;
      
      for (const child of children) {
        const grandChildren = locations.filter(l => l.parentId === child.id);
        
        if (grandChildren.length > 0) {
          const childAgg = getAggregate(child.id);
          // Use child's own capacity if > 0, else use its aggregate
          total += child.totalBeds > 0 ? Number(child.totalBeds) : childAgg.total;
          available += child.totalBeds > 0 ? Number(child.availableBeds) : childAgg.available;
          admitted += child.activeAdmissions > 0 ? Number(child.activeAdmissions) : childAgg.admitted;
        } else {
          total += Number(child.totalBeds) || 0;
          available += Number(child.availableBeds) || 0;
          admitted += Number(child.activeAdmissions) || 0;
        }
      }
      return { total, available, admitted };
    };

    return locations.map(l => {
      const children = locations.filter(child => child.parentId === l.id);
      if (children.length > 0) {
        const agg = getAggregate(l.id);
        return { 
          ...l, 
          // Use own capacity if it exists, otherwise use aggregate
          totalBeds: l.totalBeds > 0 ? l.totalBeds : agg.total, 
          availableBeds: l.totalBeds > 0 ? l.availableBeds : agg.available, 
          activeAdmissions: l.activeAdmissions > 0 ? l.activeAdmissions : agg.admitted 
        };
      }
      return l;
    });
  }, [locations]);

  const toggleNode = (id: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedNodes(newExpanded);
  };

  const handleAddLocation = async () => {
    if (!newName) return;
    setIsSubmitting(true);
    try {
      await fetchApi('/location', {
        method: 'POST',
        body: JSON.stringify({
          name: newName,
          description: newType, // treating type as description or using tags
          parent_location: newParentId === 'none' ? null : Number(newParentId),
          address1: newAddress1 || null,
          city_village: newCityVillage || null,
          state_province: newStateProvince || null,
          capacity: parseInt(newTotalBeds, 10) || 0,
          creator: 1
        })
      });
      // Optionally we could auto-expand the parent if it was selected
      if (newParentId !== 'none' && !expandedNodes.has(newParentId)) {
        const newExpanded = new Set(expandedNodes);
        newExpanded.add(newParentId);
        setExpandedNodes(newExpanded);
      }
      setIsAddLocationOpen(false);
      setNewName(''); setNewType(''); setNewParentId('none'); setNewTotalBeds('0');
      setNewAddress1(''); setNewCityVillage(''); setNewStateProvince('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create location');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenManageBeds = (loc: HospitalLocation) => {
    setSelectedLocation(loc);
    setManageTotalBeds(loc.totalBeds?.toString() || '0');
    setIsManageBedsOpen(true);
  };

  const handleSaveBeds = async () => {
    if (selectedLocation) {
      setIsSubmitting(true);
      try {
        await fetchApi(`/location/${selectedLocation.id}/capacity`, {
          method: 'PUT',
          body: JSON.stringify({
            capacity: manageTotalBeds
          })
        });
        setIsManageBedsOpen(false);
        setSelectedLocation(null);
        loadData();
      } catch (err: any) {
        toast.error(err.message || 'Failed to update capacity');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleCreateBed = async () => {
    if (!selectedLocation || !newBedNumber) return;
    setIsSubmitting(true);
    try {
      await fetchApi('/bed', {
        method: 'POST',
        body: JSON.stringify({
          bedNumber: newBedNumber,
          locationId: selectedLocation.id,
          bedTypeId: newBedTypeId || null
        })
      });
      toast.success('Bed created successfully!');
      setNewBedNumber('');
      setNewBedTypeId('');
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to create bed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build tree
  // A node is a root if it has no parent, or its parent doesn't exist in the current list
  const rootLocations = computedLocations.filter(l => l.parentId === null || !computedLocations.some(parent => parent.id === l.parentId));

  const renderLocationNode = (loc: HospitalLocation, level: number = 0) => {
    const children = computedLocations.filter(l => l.parentId === loc.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedNodes.has(loc.id);

    return (
      <div key={loc.id} className={`${level === 0 ? 'border border-border rounded-lg overflow-hidden mb-4' : 'border-t border-border/50'}`}>
        <div 
          className={`p-3 flex items-center justify-between transition-colors ${level === 0 ? 'bg-muted/30 border-b border-border' : 'hover:bg-muted/30'} cursor-pointer`}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          onClick={() => hasChildren && toggleNode(loc.id)}
        >
          <div className="flex items-center gap-2">
            {hasChildren ? (
              isExpanded ? <ChevronDown size={16} className="text-muted-foreground" /> : <ChevronRight size={16} className="text-muted-foreground" />
            ) : (
              <span className="w-4" /> // placeholder
            )}
            
            {level === 0 ? (
              <Building2 size={18} className="text-primary" /> 
            ) : (
              <MapPin size={16} className="text-muted-foreground" />
            )}
            
            <span className={`${level === 0 ? 'font-semibold text-foreground' : 'text-sm text-foreground'}`}>
              {loc.name}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs">
            {loc.type === 'Ward' && (
              <>
                <span className={`px-2 py-0.5 rounded font-medium ${loc.availableBeds > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {loc.availableBeds} Available
                </span>
                <span className="text-muted-foreground">{loc.totalBeds} Total Beds</span>
                {loc.activeAdmissions > 0 && (
                  <span className="text-xs text-blue-500">{ loc.activeAdmissions } Admitted</span>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleOpenManageBeds(loc); }}
                  className="text-primary hover:underline"
                >
                  Manage Capacity
                </button>
              </>
            )}
            {loc.type !== 'Ward' && (
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">{loc.totalBeds} Beds Total (Aggregate)</span>
                {loc.activeAdmissions > 0 && (
                  <span className="text-xs text-blue-500">{ loc.activeAdmissions } Admitted</span>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Render children if expanded */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-background"
            >
              {children.map(child => renderLocationNode(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Facility Management</h1>
          <p className="text-muted-foreground text-sm">Ward layout, locations, and bed assignments</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddLocationOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={16} /> Add Location
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{totalWards}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Total Wards</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <Bed size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{totalAvailableBeds}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Available Beds</div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
            <Users size={20} />
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">{totalInpatients}</div>
            <div className="text-xs text-muted-foreground uppercase font-semibold">Current Inpatients</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col min-h-[400px]">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center bg-muted/30">
          <div className="relative w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Search locations..." 
              className="w-full pl-10 pr-4 py-1.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded-md text-sm outline-none transition-all text-foreground shadow-sm"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto flex-1 p-4">
          {/* Tree-style location list */}
          <div className="space-y-2">
            {rootLocations.map(loc => renderLocationNode(loc))}
          </div>
        </div>
      </div>

      {/* Add Location Modal */}
      <AnimatePresence>
        {isAddLocationOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddLocationOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Building2 size={20} className="text-primary"/> Add New Location
                </h2>
                <button 
                  onClick={() => setIsAddLocationOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    Location Name <span className="text-[10px] text-muted-foreground font-normal">location.name</span>
                  </label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g., ICU Ward B" />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground flex items-center justify-between">
                    Location Tag <span className="text-[10px] text-muted-foreground font-normal">location_tag</span>
                  </label>
                  <select value={newType} onChange={e => setNewType(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                    <option value="">Select Tag...</option>
                    {locationTags.map(tag => (
                      <option key={tag.location_tag_id} value={tag.name}>{tag.name}</option>
                    ))}
                    {!locationTags.length && (
                      <>
                        <option value="Ward">Ward</option>
                        <option value="Clinic / Outpatient">Clinic / Outpatient</option>
                        <option value="Department">Department</option>
                        <option value="Building">Building</option>
                        <option value="Pharmacy">Pharmacy</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      Parent Location <span className="text-[10px] text-muted-foreground font-normal">location.parent_location</span>
                    </label>
                    <select value={newParentId} onChange={e => setNewParentId(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all appearance-none">
                      <option value="none">None (Root Level)</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground flex items-center justify-between">
                      Total Beds <span className="text-[10px] text-muted-foreground font-normal">location_attribute</span>
                    </label>
                    <input type="number" value={newTotalBeds} onChange={e => setNewTotalBeds(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="0" />
                  </div>
                </div>

                <div className="pt-4 border-t border-border mt-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Address & Geography</h4>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-foreground flex items-center justify-between">
                        Address Line 1 <span className="text-[10px] text-muted-foreground font-normal">location.address1</span>
                      </label>
                      <input type="text" value={newAddress1} onChange={e => setNewAddress1(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="e.g., Building C, Floor 2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground flex items-center justify-between">
                          City / Village <span className="text-[10px] text-muted-foreground font-normal">location.city_village</span>
                        </label>
                        <input type="text" value={newCityVillage} onChange={e => setNewCityVillage(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="City" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-foreground flex items-center justify-between">
                          State / Province <span className="text-[10px] text-muted-foreground font-normal">location.state_province</span>
                        </label>
                        <input type="text" value={newStateProvince} onChange={e => setNewStateProvince(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="State" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsAddLocationOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddLocation}
                  disabled={!newName || isSubmitting}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Creating...' : 'Create Location'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Manage Beds Modal */}
      <AnimatePresence>
        {isManageBedsOpen && selectedLocation && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageBedsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl rounded-xl z-50 flex flex-col overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-muted/30">
                <h2 className="font-semibold text-lg text-foreground flex items-center gap-2">
                  <Bed size={20} className="text-primary"/> Manage Beds
                </h2>
                <button 
                  onClick={() => setIsManageBedsOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Location Capacity Setting</h3>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-foreground">Total Ward Capacity</label>
                    <div className="flex gap-2">
                      <input type="number" value={manageTotalBeds} onChange={e => setManageTotalBeds(e.target.value)} className="flex-1 px-3 py-2 bg-muted/50 border border-border rounded-md text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" />
                      <button 
                        onClick={handleSaveBeds}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50"
                      >
                        {isSubmitting ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">Sets a simple limit without creating individual bed records.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2 flex justify-between items-center">
                    <span>Individual Physical Beds</span>
                    <span className="text-xs font-normal text-muted-foreground">{selectedLocationBeds.length} bed(s) total</span>
                  </h3>
                  
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Bed Number</label>
                      <input type="text" placeholder="e.g. Bed 01" value={newBedNumber} onChange={e => setNewBedNumber(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm outline-none" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Bed Type</label>
                      <select value={newBedTypeId} onChange={e => setNewBedTypeId(e.target.value)} className="w-full px-3 py-2 bg-muted/50 border border-border rounded-md text-sm outline-none">
                        <option value="">Select Type...</option>
                        {bedTypes.map(bt => (
                          <option key={bt.bed_type_id} value={bt.bed_type_id}>{bt.name}</option>
                        ))}
                      </select>
                    </div>
                    <button onClick={handleCreateBed} disabled={isSubmitting || !newBedNumber} className="px-4 py-2 bg-emerald-500 text-white rounded-md text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 h-[38px] flex items-center gap-1">
                      <Plus size={16}/> Add
                    </button>
                  </div>

                  <div className="border border-border rounded-md overflow-hidden max-h-[200px] overflow-y-auto">
                    {selectedLocationBeds.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">No physical beds created yet.</div>
                    ) : (
                      <div className="divide-y divide-border">
                        {selectedLocationBeds.map(bed => (
                          <div key={bed.bed_id} className="p-3 bg-muted/30 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3">
                              <Bed size={16} className={bed.status === 'AVAILABLE' ? 'text-emerald-500' : 'text-blue-500'} />
                              <span className="font-medium text-foreground">{bed.bed_number}</span>
                              {bed.bed_type && <span className="text-xs px-2 py-0.5 bg-muted rounded-md border border-border">{bed.bed_type.name}</span>}
                            </div>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${bed.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}`}>
                              {bed.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
                <button 
                  onClick={() => setIsManageBedsOpen(false)}
                  className="px-4 py-2 bg-card border border-border text-foreground rounded-md text-sm font-medium hover:bg-muted transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
