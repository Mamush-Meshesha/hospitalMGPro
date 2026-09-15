import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Building2, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../utils/api';
import { toast } from 'sonner';

export default function LocationSelectView() {
  const [locations, setLocations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [rememberMe, setRememberMe] = useState(true);
  
  const { setLocation, locationId } = useAuth();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const from = (routerLocation.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // If we already have a location and we didn't force a re-select, navigate away
    // We only enforce this if there's no locationId yet.
    if (locationId && !routerLocation.pathname.includes('force')) {
      navigate(from, { replace: true });
      return;
    }

    fetchApi('/location?v=full')
      .then(data => {
        setLocations(data.results || data || []);
        setLoading(false);
      })
      .catch((_err) => {
        toast.error("Failed to fetch locations");
        setLoading(false);
      });
  }, [locationId, navigate, from, routerLocation]);

  const handleContinue = () => {
    if (!selectedId) return;
    const loc = locations.find(l => l.location_id === selectedId);
    if (loc) {
      setLocation(loc.location_id, loc.name);
      
      if (!rememberMe) {
        // If not remember me, we can optionally clear it on window close, but for now
        // we'll just trust the localStorage logic we built. A true session-only would 
        // require saving it to sessionStorage instead.
        sessionStorage.setItem('tempLocationId', loc.location_id.toString());
      }
      
      toast.success(`Session started at ${loc.name}`);
      navigate(from, { replace: true });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-card rounded-2xl shadow-xl overflow-hidden border border-border"
      >
        <div className="p-8 pb-6 border-b border-border bg-card">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="text-primary w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Select Session Location</h1>
          </div>
          <p className="text-muted-foreground mt-2">
            Please choose your current physical working location. Your data access will be restricted to this facility.
          </p>
        </div>

        <div className="p-8 bg-muted/10">
          <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
            {locations.map((loc) => {
              const id = loc.location_id || loc.uuid;
              return (
              <div 
                key={id}
                onClick={() => setSelectedId(loc.location_id)}
                className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedId === loc.location_id 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border bg-card hover:border-primary/40 hover:bg-card/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MapPin className={selectedId === loc.location_id ? 'text-primary' : 'text-muted-foreground'} />
                  <div>
                    <h3 className={`font-semibold ${selectedId === loc.location_id ? 'text-primary' : 'text-foreground'}`}>
                      {loc.name}
                    </h3>
                    {loc.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{loc.description}</p>
                    )}
                  </div>
                </div>
                
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedId === loc.location_id ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                }`}>
                  {selectedId === loc.location_id && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                </div>
              </div>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
              />
              <span className="text-sm text-muted-foreground">Remember my choice</span>
            </label>

            <button
              onClick={handleContinue}
              disabled={!selectedId}
              className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              Continue to Dashboard
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
