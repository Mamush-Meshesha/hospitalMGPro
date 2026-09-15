import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate, Navigate, useLocation } from 'react-router-dom';
import {
  Activity, Users, Pill, Bell, Search, LayoutDashboard, Settings,
  ChevronLeft, ChevronRight, Moon, Sun, ChevronDown, Stethoscope,
  Microscope, FileText, CreditCard, Shield, Database, StethoscopeIcon,
  ClipboardList, UserPlus, MapPin, FormInput, Network, Building2,
  Syringe, HeartPulse, LogOut, Package, Bed, PieChart, ShoppingCart, Barcode,
  Truck, Map, ArrowLeftRight, Receipt, Layers, Calendar as CalendarIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, isCollapsed }: { icon: any, label: string, to: string, isCollapsed: boolean }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `
        relative flex items-center gap-3 py-2 mx-2 rounded-md transition-colors group overflow-hidden
        ${isCollapsed ? 'justify-center px-3' : 'pl-8 pr-3'}
        ${isActive
          ? 'bg-primary/10 text-primary font-medium'
          : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
        }
      `}
      title={isCollapsed ? label : ''}
    >
      {({ isActive }) => (
        <>
          {/* Active Indicator Line */}
          {isActive && (
            <motion.div
              layoutId="sidebar-active-indicator"
              className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-md"
            />
          )}
          <Icon size={isCollapsed ? 20 : 18} className={`flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="whitespace-nowrap tracking-wide text-[13px]"
            >
              {label}
            </motion.span>
          )}
        </>
      )}
    </NavLink>
  );
};

const SidebarGroup = ({ title, icon: Icon, children, isSidebarCollapsed }: { title: string, icon: any, children: React.ReactNode, isSidebarCollapsed: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (isSidebarCollapsed) {
    return (
      <div className="mb-2">
        <div className="flex justify-center mb-1 py-2 text-sidebar-foreground/40">
          <Icon size={18} />
        </div>
        <div className="space-y-1">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 text-sidebar-foreground/50 hover:text-sidebar-foreground transition-colors group"
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="group-hover:text-primary transition-colors" />
          <span className="text-[11px] font-bold uppercase tracking-widest">{title}</span>
        </div>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-1 mt-1"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function DashboardLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { theme, setTheme } = useTheme();
  const { user, logout, hasPrivilege, token, locationId, locationName, hasSubscription } = useAuth();
  const location = useLocation();

  // Location Dropdown State
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);

  // Close location menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (locationMenuRef.current && !locationMenuRef.current.contains(event.target as Node)) {
        setIsLocationMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!locationId) {
    return <Navigate to="/location-select" state={{ from: location }} replace />;
  }

  const handleSignOut = () => {
    logout();
  };

  const toggleTheme = () => {
    if (theme === 'dark') setTheme('light');
    else if (theme === 'light') setTheme('system');
    else setTheme('dark');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background transition-colors duration-300">

      {/* Rich Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 256 : 64 }}
        className="relative bg-sidebar flex flex-col border-r border-sidebar-border z-20 flex-shrink-0 no-print"
      >
        {/* The elegant cut-out collapse button */}
        <div
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-16 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border shadow-md flex items-center justify-center text-sidebar-foreground cursor-pointer hover:text-primary hover:bg-accent transition-colors z-50"
        >
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </div>

        <div className="h-16 flex items-center px-6 mb-4 border-b border-sidebar-border/50">
          <div className="flex items-center gap-3 text-sidebar-foreground font-bold text-xl tracking-tight">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center shadow-sm">
              <Activity className="text-primary-foreground flex-shrink-0" size={18} />
            </div>
            {!isSidebarOpen ? null : (
              <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                Hospital-MG<span className="font-light opacity-60">Pro</span>
              </motion.span>
            )}
          </div>
        </div>

        <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
          <div className="mb-2">
            {hasPrivilege('VIEW_DASHBOARD') && (
              <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" isCollapsed={!isSidebarOpen} />
            )}
          </div>

          {(hasPrivilege(['VIEW_PATIENTS', 'VIEW_VISITS', 'VIEW_ENCOUNTERS', 'VIEW_OBS', 'VIEW_ORDERS', 'VIEW_PROGRAMS', 'VIEW_COHORTS', 'VIEW_QUEUES'])) && (
            <SidebarGroup title="Clinical & Care" icon={Stethoscope} isSidebarCollapsed={!isSidebarOpen}>
              {hasPrivilege('VIEW_PATIENTS') && hasSubscription('REGISTRATION') && <SidebarItem icon={Users} label="Patients Hub" to="/patients" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_VISITS') && hasSubscription('INPATIENT') && <SidebarItem icon={Bed} label="Active Visits & Ward" to="/active-visits" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_ENCOUNTERS') && hasSubscription('OUTPATIENT') && <SidebarItem icon={Activity} label="Encounters & ADT" to="/encounters" isCollapsed={!isSidebarOpen} />}
              
              {hasPrivilege('VIEW_OBS') && hasSubscription('OUTPATIENT') && <SidebarItem icon={HeartPulse} label="Clinical Observations" to="/obs" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_ORDERS') && hasSubscription('OUTPATIENT') && <SidebarItem icon={Syringe} label="CPOE Engine" to="/cpoe" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_PROGRAMS') && hasSubscription('OUTPATIENT') && <SidebarItem icon={Network} label="Patient Programs" to="/programs" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_COHORTS') && hasSubscription('OUTPATIENT') && <SidebarItem icon={Users} label="Patient Cohorts" to="/cohorts" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_QUEUES') && hasSubscription('OUTPATIENT') && <SidebarItem icon={Activity} label="Hospital Queues" to="/queues" isCollapsed={!isSidebarOpen} />}
            </SidebarGroup>
          )}

          {(hasPrivilege(['VIEW_DASHBOARD']) && hasSubscription('REGISTRATION')) && (
            <SidebarGroup title="Scheduling & Calendars" icon={CalendarIcon} isSidebarCollapsed={!isSidebarOpen}>
              <SidebarItem icon={CalendarIcon} label="Master Schedule" to="/scheduling" isCollapsed={!isSidebarOpen} />
              <SidebarItem icon={Activity} label="OT Schedule" to="/ot-schedule" isCollapsed={!isSidebarOpen} />
              <SidebarItem icon={FileText} label="Duty Rosters" to="/rosters" isCollapsed={!isSidebarOpen} />
            </SidebarGroup>
          )}

          {(hasPrivilege(['VIEW_PHARMACY', 'VIEW_INVENTORY']) && hasSubscription('PHARMACY')) && (
            <SidebarGroup title="Pharmacy & Inventory" icon={Pill} isSidebarCollapsed={!isSidebarOpen}>
              {hasPrivilege('VIEW_PHARMACY') && <SidebarItem icon={Pill} label="Pharmacy Dispense" to="/pharmacy" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_INVENTORY') && <SidebarItem icon={Package} label="Inventory Mgmt" to="/inventory" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('MANAGE_PRODUCT_MASTER') && <SidebarItem icon={Barcode} label="Product Master" to="/products" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('MANAGE_PRODUCT_MASTER') && <SidebarItem icon={Layers} label="Categories & UOMs" to="/categories" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('MANAGE_PURCHASE_ORDERS') && <SidebarItem icon={ShoppingCart} label="Purchase Orders" to="/po" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('MANAGE_SUPPLIERS') && <SidebarItem icon={Truck} label="Suppliers & Vendors" to="/suppliers" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('MANAGE_WAREHOUSES') && <SidebarItem icon={Map} label="Warehouses & Bins" to="/warehouses" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('MANAGE_STOCK_MOVEMENTS') && <SidebarItem icon={ArrowLeftRight} label="Stock Movements" to="/movements" isCollapsed={!isSidebarOpen} />}
            </SidebarGroup>
          )}

          {hasPrivilege(['VIEW_LAB', 'VIEW_ORDERS', 'VIEW_BILLING', 'MANAGE_PURCHASE_ORDERS', 'VIEW_SYSTEM_CONFIG']) && (
            <SidebarGroup title="Operations & Depts" icon={Building2} isSidebarCollapsed={!isSidebarOpen}>
              {hasPrivilege('VIEW_LAB') && hasSubscription('LAB_RADIOLOGY') && (
                <SidebarItem icon={Microscope} label="Laboratory" to="/lab" isCollapsed={!isSidebarOpen} />
              )}
              {hasPrivilege('VIEW_ORDERS') && hasSubscription('LAB_RADIOLOGY') && <SidebarItem icon={StethoscopeIcon} label="Radiology" to="/radiology" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_BILLING') && hasSubscription('BILLING') && <SidebarItem icon={CreditCard} label="Patient Billing" to="/billing" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('MANAGE_PURCHASE_ORDERS') && hasSubscription('FINANCING') && <SidebarItem icon={Receipt} label="Supplier Invoices" to="/invoices" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && <SidebarItem icon={MapPin} label="Facility Management" to="/locations" isCollapsed={!isSidebarOpen} />}
            </SidebarGroup>
          )}

          {hasPrivilege(['VIEW_SYSTEM_RBAC', 'VIEW_SYSTEM_CONFIG']) && (
            <SidebarGroup title="System & Admin" icon={Settings} isSidebarCollapsed={!isSidebarOpen}>
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && hasSubscription('RECORDS_REPORTS') && <SidebarItem icon={PieChart} label="Reports" to="/reports" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && <SidebarItem icon={Database} label="Reference Data" to="/reference-data" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && <SidebarItem icon={Database} label="Concept Dictionary" to="/concepts" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && <SidebarItem icon={FormInput} label="Form Builder" to="/forms" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && <SidebarItem icon={ClipboardList} label="Decision Support (CDS)" to="/cds" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_RBAC') && <SidebarItem icon={Shield} label="Users & RBAC" to="/users" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && <SidebarItem icon={UserPlus} label="Provider Directory" to="/providers" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && <SidebarItem icon={Building2} label="Tenant Management" to="/tenants" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && <SidebarItem icon={Settings} label="System Config" to="/config" isCollapsed={!isSidebarOpen} />}
              {hasPrivilege('VIEW_SYSTEM_CONFIG') && <SidebarItem icon={Settings} label="Subscriptions" to="/subscriptions" isCollapsed={!isSidebarOpen} />}
            </SidebarGroup>
          )}
        </nav>

        {/* User Profile Card (Flush to bottom) */}
        <div className="p-3 border-t border-sidebar-border bg-sidebar mt-auto flex items-center gap-3">
          <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs flex-shrink-0">
            {user?.username?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          {!isSidebarOpen ? null : (
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold text-sidebar-foreground truncate">{user?.username || 'User'}</p>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{user?.roles?.[0] || 'Role'}</p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background">

        {/* Classic Enterprise Top Header */}
        <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6 z-10 sticky top-0 transition-colors duration-300 no-print">
          <div className="flex-1 flex items-center">
            {/* Global Search - Classic Style */}
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
              <input
                type="text"
                placeholder="Search patient name, MRN, or National ID..."
                className="w-full pl-9 pr-4 py-2 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded shadow-sm text-sm outline-none transition-all text-foreground"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium"
              title={`Current Theme: ${theme}`}
            >
              {theme === 'dark' ? <Moon size={18} /> : theme === 'light' ? <Sun size={18} /> : <Settings size={18} />}
            </button>

            {/* Notifications */}
            <button className="relative text-muted-foreground hover:text-primary transition-colors flex items-center">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center rounded-full shadow-sm">
                3
              </span>
            </button>

            <div className="h-6 w-px bg-border mx-1"></div>

            {/* Quick Actions / Facility */}
            <div className="relative" ref={locationMenuRef}>
              <div 
                className="flex items-center gap-2 px-3 py-1.5 rounded bg-muted hover:bg-muted/80 cursor-pointer transition-colors"
                onClick={() => setIsLocationMenuOpen(!isLocationMenuOpen)}
              >
                <MapPin size={14} className="text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{locationName || 'Unknown Location'}</span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </div>

              {/* Location Dropdown */}
              <AnimatePresence>
                {isLocationMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-md shadow-lg overflow-hidden z-50"
                  >
                    <div className="py-1">
                      <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                        Change Location
                      </div>
                      <button
                        onClick={() => {
                          navigate('/location-select');
                          setIsLocationMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent transition-colors"
                      >
                        Switch Session Location
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sign Out Button */}
            <div className="h-6 w-px bg-border mx-1 hidden sm:block"></div>

            <button
              onClick={handleSignOut}
              className="text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2 text-sm font-medium p-1.5 rounded-md hover:bg-destructive/10"
              title="Sign Out"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-auto p-6 relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
