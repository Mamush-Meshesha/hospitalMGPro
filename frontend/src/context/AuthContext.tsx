import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export type SubscriptionModule = 
  | 'OUTPATIENT'
  | 'LAB_RADIOLOGY'
  | 'REGISTRATION'
  | 'RECORDS_REPORTS'
  | 'BILLING'
  | 'FINANCING'
  | 'PHARMACY'
  | 'INPATIENT';

export const ALL_SUBSCRIPTIONS: SubscriptionModule[] = [
  'OUTPATIENT', 'LAB_RADIOLOGY', 'REGISTRATION', 'RECORDS_REPORTS',
  'BILLING', 'FINANCING', 'PHARMACY', 'INPATIENT'
];

interface User {
  id: number;
  username: string;
  roles: string[];
  privileges?: string[];
  tenantId?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  locationId: number | null;
  locationName: string | null;
  activeSubscriptions: SubscriptionModule[];
  login: (token: string, userData: User, subscriptions?: SubscriptionModule[]) => void;
  logout: () => void;
  setLocation: (id: number, name: string) => void;
  clearLocation: () => void;
  hasRole: (role: string | string[]) => boolean;
  hasPrivilege: (privilege: string | string[]) => boolean;
  hasSubscription: (module: SubscriptionModule | SubscriptionModule[]) => boolean;
  toggleSubscription: (module: SubscriptionModule) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = sessionStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState<string | null>(() => sessionStorage.getItem('token'));
  
  const [locationId, setLocationIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem('locationId');
    return saved ? parseInt(saved) : null;
  });
  
  const [locationName, setLocationNameState] = useState<string | null>(() => localStorage.getItem('locationName'));

  const [activeSubscriptions, setActiveSubscriptions] = useState<SubscriptionModule[]>(() => {
    const saved = localStorage.getItem('activeSubscriptions');
    return saved ? JSON.parse(saved) : ALL_SUBSCRIPTIONS; // Default to all if none saved
  });

  useEffect(() => {
    const handleUnauthorized = () => {
      logout();
    };
    window.addEventListener('auth-unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth-unauthorized', handleUnauthorized);
  }, []);

  const login = (newToken: string, userData: User, subscriptions?: SubscriptionModule[]) => {
    sessionStorage.setItem('token', newToken);
    sessionStorage.setItem('user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    
    if (subscriptions) {
      setActiveSubscriptions(subscriptions);
      localStorage.setItem('activeSubscriptions', JSON.stringify(subscriptions));
    }
  };

  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    // Clear location so new users on the same device must select a location
    clearLocation();
    setToken(null);
    setUser(null);
    navigate('/auth/login');
  };

  const setLocation = (id: number, name: string) => {
    localStorage.setItem('locationId', id.toString());
    localStorage.setItem('locationName', name);
    setLocationIdState(id);
    setLocationNameState(name);
  };

  const clearLocation = () => {
    localStorage.removeItem('locationId');
    localStorage.removeItem('locationName');
    setLocationIdState(null);
    setLocationNameState(null);
  };

  const hasRole = (roleOrRoles: string | string[]) => {
    if (!user) return false;
    const rolesToCheck = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
    // Admin has access to everything for demo purposes
    if (user.roles.includes('System Developer') || user.roles.includes('Admin') || user.roles.includes('Super Admin')) return true;
    return rolesToCheck.some(r => user.roles.includes(r));
  };

  const hasPrivilege = (privilegeOrPrivileges: string | string[]) => {
    if (!user) return false;
    // Super Admin / Admin overrides
    if (user.roles.includes('System Developer') || user.roles.includes('Super Admin') || user.roles.includes('Admin')) return true;
    
    if (!user.privileges || user.privileges.length === 0) return false;

    const privsToCheck = Array.isArray(privilegeOrPrivileges) ? privilegeOrPrivileges : [privilegeOrPrivileges];
    return privsToCheck.some(p => user.privileges!.includes(p));
  };

  const hasSubscription = (moduleOrModules: SubscriptionModule | SubscriptionModule[]) => {
    const modulesToCheck = Array.isArray(moduleOrModules) ? moduleOrModules : [moduleOrModules];
    // If it's a super admin, you could bypass this too, but for testing the UI, let's strictly check it
    return modulesToCheck.some(m => activeSubscriptions.includes(m));
  };

  const toggleSubscription = async (module: SubscriptionModule) => {
    // Optimistic UI update
    const isActive = activeSubscriptions.includes(module);
    
    setActiveSubscriptions(prev => {
      const newSubs = isActive 
        ? prev.filter(m => m !== module)
        : [...prev, module];
      localStorage.setItem('activeSubscriptions', JSON.stringify(newSubs));
      return newSubs;
    });

    if (user?.tenantId) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api/v1';
        let response;
        if (isActive) {
          // Deactivate
          response = await fetch(`${baseUrl}/tenants/${user.tenantId}/subscriptions/${module}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          // Activate
          response = await fetch(`${baseUrl}/tenants/${user.tenantId}/subscriptions`, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ moduleId: module })
          });
        }
        
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Backend failed to update subscription');
        }
      } catch (err: any) {
        console.error("Failed to toggle subscription on backend", err);
        // Revert the optimistic update on failure
        setActiveSubscriptions(prev => {
          const reverted = isActive 
            ? [...prev, module] // Put it back if we tried to remove it
            : prev.filter(m => m !== module); // Remove it if we tried to add it
          localStorage.setItem('activeSubscriptions', JSON.stringify(reverted));
          return reverted;
        });
        // You could also trigger a global toast here if desired, e.g., dispatch an event
        window.dispatchEvent(new CustomEvent('auth-toast', { detail: { message: err.message, type: 'error' } }));
      }
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, locationId, locationName, activeSubscriptions,
      login, logout, setLocation, clearLocation, 
      hasRole, hasPrivilege, hasSubscription, toggleSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
