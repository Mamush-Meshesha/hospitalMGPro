import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardView from './views/DashboardView';
import { Toaster, toast } from 'sonner';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Core Clinical Pipeline
import PatientsHubView from './views/PatientsHubView';
import ActiveVisitsView from './views/ActiveVisitsView';
import EncountersADTView from './views/EncountersADTView';
import CPOEView from './views/CPOEView';
import PharmacyQueueView from './views/PharmacyQueueView';
import InventoryView from './views/InventoryView';
import BillingView from './views/BillingView';
import BillingDetailView from './views/BillingDetailView';
import QueuesHubView from './views/QueuesHubView';
import QueueDetailView from './views/QueueDetailView';
import ReportsView from './views/ReportsView';
import ProductMasterView from './views/ProductMasterView';
import UomMasterView from './views/UomMasterView';
import ProductDetailView from './views/ProductDetailView';
import PurchaseOrdersView from './views/PurchaseOrdersView';
import PurchaseOrderDetailView from './views/PurchaseOrderDetailView';
import SuppliersView from './views/SuppliersView';
import SupplierDetailView from './views/SupplierDetailView';
import WarehousesView from './views/WarehousesView';
import WarehouseDetailView from './views/WarehouseDetailView';
import StockMovementsView from './views/StockMovementsView';
import StockMovementDetailView from './views/StockMovementDetailView';
import InvoicesView from './views/InvoicesView';
import InvoiceDetailView from './views/InvoiceDetailView';
import CategoriesView from './views/CategoriesView';
import CategoryDetailView from './views/CategoryDetailView';
import InventoryBatchDetailView from './views/InventoryBatchDetailView';
import SchedulingHubView from './views/SchedulingHubView';
import OTScheduleView from './views/OTScheduleView';
import DutyRosterView from './views/DutyRosterView';

// Scaffold Admin Views
import ClinicalObsView from './views/ClinicalObsView';
import ProgramsView from './views/ProgramsView';
import CohortsView from './views/CohortsView';
import LaboratoryView from './views/LaboratoryView';
import LaboratoryDetailView from './views/LaboratoryDetailView';
import RadiologyView from './views/RadiologyView';
import LocationsView from './views/LocationsView';
import UsersRBACView from './views/UsersRBACView';
import ProvidersView from './views/ProvidersView';
import ConceptDictionaryView from './views/ConceptDictionaryView';
import FormBuilderView from './views/FormBuilderView';
import CDSConfigView from './views/CDSConfigView';
import SystemConfigView from './views/SystemConfigView';
import ReferenceDataView from './views/ReferenceDataView';
import SubscriptionSettingsView from './views/SubscriptionSettingsView';
import TenantsView from './views/TenantsView';

// Auth Views
import AuthLayout from './layouts/AuthLayout';
import LoginView from './views/auth/LoginView';
import ForgotPasswordView from './views/auth/ForgotPasswordView';
import ResetPasswordView from './views/auth/ResetPasswordView';
import { AuthProvider } from './context/AuthContext';
import { useParams } from 'react-router-dom';

function PurchaseOrderRedirect() {
  const { id } = useParams();
  return <Navigate to={`/po/${id}`} replace />;
}

import LocationSelectView from './views/LocationSelectView';
import React, { useEffect } from 'react';

function GlobalAuthToaster() {
  useEffect(() => {
    const handleToast = (e: any) => {
      const { message, type } = e.detail;
      if (type === 'error') toast.error(message);
      else if (type === 'success') toast.success(message);
      else toast(message);
    };
    window.addEventListener('auth-toast', handleToast);
    return () => window.removeEventListener('auth-toast', handleToast);
  }, []);
  return null;
}

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <GlobalAuthToaster />
      <AuthProvider>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<Navigate to="/auth/login" replace />} />
            <Route path="login" element={<LoginView />} />
            <Route path="forgot-password" element={<ForgotPasswordView />} />
            <Route path="reset-password" element={<ResetPasswordView />} />
          </Route>

          {/* Protected Dashboard Routes */}
          <Route path="/location-select" element={<ProtectedRoute requiredPrivileges={[]}><LocationSelectView /></ProtectedRoute>} />
          
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            
            {/* Dashboard: Available to everyone with VIEW_DASHBOARD */}
            <Route path="dashboard" element={
              <ProtectedRoute requiredPrivileges={['VIEW_DASHBOARD']}><DashboardView /></ProtectedRoute>
            } />
            
            {/* Clinical routes */}
            <Route path="patients" element={<ProtectedRoute requiredPrivileges={['VIEW_PATIENTS']}><PatientsHubView /></ProtectedRoute>} />
            <Route path="active-visits" element={<ProtectedRoute requiredPrivileges={['VIEW_VISITS']}><ActiveVisitsView /></ProtectedRoute>} />
            <Route path="encounters" element={<ProtectedRoute requiredPrivileges={['VIEW_ENCOUNTERS']}><EncountersADTView /></ProtectedRoute>} />
            
            {/* Strict Clinical */}
            <Route path="obs" element={<ProtectedRoute requiredPrivileges={['VIEW_OBS']}><ClinicalObsView /></ProtectedRoute>} />
            <Route path="cpoe" element={<ProtectedRoute requiredPrivileges={['VIEW_ORDERS']}><CPOEView /></ProtectedRoute>} />
            <Route path="programs" element={<ProtectedRoute requiredPrivileges={['VIEW_PROGRAMS']}><ProgramsView /></ProtectedRoute>} />
            <Route path="cohorts" element={<ProtectedRoute requiredPrivileges={['VIEW_COHORTS']}><CohortsView /></ProtectedRoute>} />
            <Route path="queues" element={<ProtectedRoute requiredPrivileges={['VIEW_QUEUES']}><QueuesHubView /></ProtectedRoute>} />
            <Route path="queues/:id" element={<ProtectedRoute requiredPrivileges={['VIEW_QUEUES']}><QueueDetailView /></ProtectedRoute>} />
            
            {/* Pharmacy & Inventory Routes */}
            <Route path="pharmacy" element={<ProtectedRoute requiredPrivileges={['VIEW_PHARMACY']}><PharmacyQueueView /></ProtectedRoute>} />
            <Route path="inventory" element={<ProtectedRoute requiredPrivileges={['VIEW_INVENTORY']}><InventoryView /></ProtectedRoute>} />
            <Route path="inventory/:id" element={<ProtectedRoute requiredPrivileges={['VIEW_INVENTORY']}><InventoryBatchDetailView /></ProtectedRoute>} />
            <Route path="products" element={<ProtectedRoute requiredPrivileges={['MANAGE_PRODUCT_MASTER']}><ProductMasterView /></ProtectedRoute>} />
            <Route path="uom" element={<ProtectedRoute requiredPrivileges={['MANAGE_PRODUCT_MASTER']}><UomMasterView /></ProtectedRoute>} />
            <Route path="products/:id" element={<ProtectedRoute requiredPrivileges={['MANAGE_PRODUCT_MASTER']}><ProductDetailView /></ProtectedRoute>} />
            <Route path="po" element={<ProtectedRoute requiredPrivileges={['MANAGE_PURCHASE_ORDERS']}><PurchaseOrdersView /></ProtectedRoute>} />
            <Route path="po/:id" element={<ProtectedRoute requiredPrivileges={['MANAGE_PURCHASE_ORDERS']}><PurchaseOrderDetailView /></ProtectedRoute>} />
            <Route path="purchase-orders" element={<Navigate to="/po" replace />} />
            <Route path="purchase-orders/:id" element={<ProtectedRoute requiredPrivileges={['MANAGE_PURCHASE_ORDERS']}><PurchaseOrderRedirect /></ProtectedRoute>} />
            <Route path="suppliers" element={<ProtectedRoute requiredPrivileges={['MANAGE_SUPPLIERS']}><SuppliersView /></ProtectedRoute>} />
            <Route path="suppliers/:id" element={<ProtectedRoute requiredPrivileges={['MANAGE_SUPPLIERS']}><SupplierDetailView /></ProtectedRoute>} />
            <Route path="warehouses" element={<ProtectedRoute requiredPrivileges={['MANAGE_WAREHOUSES']}><WarehousesView /></ProtectedRoute>} />
            <Route path="warehouses/:id" element={<ProtectedRoute requiredPrivileges={['MANAGE_WAREHOUSES']}><WarehouseDetailView /></ProtectedRoute>} />
            <Route path="movements" element={<ProtectedRoute requiredPrivileges={['MANAGE_STOCK_MOVEMENTS']}><StockMovementsView /></ProtectedRoute>} />
            <Route path="movements/:id" element={<ProtectedRoute requiredPrivileges={['MANAGE_STOCK_MOVEMENTS']}><StockMovementDetailView /></ProtectedRoute>} />
            <Route path="categories" element={<ProtectedRoute requiredPrivileges={['MANAGE_PRODUCT_MASTER']}><CategoriesView /></ProtectedRoute>} />
            <Route path="categories/:id" element={<ProtectedRoute requiredPrivileges={['MANAGE_PRODUCT_MASTER']}><CategoryDetailView /></ProtectedRoute>} />
            
            {/* Operations & Departments */}
            <Route path="lab" element={<ProtectedRoute requiredPrivileges={['VIEW_LAB']}><LaboratoryView /></ProtectedRoute>} />
            <Route path="lab/:id" element={<ProtectedRoute requiredPrivileges={['VIEW_LAB']}><LaboratoryDetailView /></ProtectedRoute>} />
            <Route path="radiology" element={<ProtectedRoute requiredPrivileges={['VIEW_ORDERS']}><RadiologyView /></ProtectedRoute>} />
            <Route path="billing" element={<ProtectedRoute requiredPrivileges={['VIEW_BILLING']}><BillingView /></ProtectedRoute>} />
            <Route path="billing/:id" element={<ProtectedRoute requiredPrivileges={['VIEW_BILLING']}><BillingDetailView /></ProtectedRoute>} />
            <Route path="invoices" element={<ProtectedRoute requiredPrivileges={['MANAGE_PURCHASE_ORDERS']}><InvoicesView /></ProtectedRoute>} />
            <Route path="invoices/:id" element={<ProtectedRoute requiredPrivileges={['MANAGE_PURCHASE_ORDERS']}><InvoiceDetailView /></ProtectedRoute>} />
            <Route path="locations" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><LocationsView /></ProtectedRoute>} />
            
            {/* Admin & System Config */}
            <Route path="reports" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><ReportsView /></ProtectedRoute>} />
            <Route path="users" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_RBAC']}><UsersRBACView /></ProtectedRoute>} />
            <Route path="providers" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><ProvidersView /></ProtectedRoute>} />
            <Route path="concepts" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><ConceptDictionaryView /></ProtectedRoute>} />
            <Route path="reference-data" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><ReferenceDataView /></ProtectedRoute>} />
            <Route path="forms" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><FormBuilderView /></ProtectedRoute>} />
            <Route path="cds" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><CDSConfigView /></ProtectedRoute>} />
            <Route path="config" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><SystemConfigView /></ProtectedRoute>} />
            <Route path="tenants" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><TenantsView /></ProtectedRoute>} />
            <Route path="subscriptions" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_CONFIG']}><SubscriptionSettingsView /></ProtectedRoute>} />

            {/* Scheduling & Calendars */}
            <Route path="scheduling" element={<ProtectedRoute requiredPrivileges={['VIEW_VISITS']}><SchedulingHubView /></ProtectedRoute>} />
            <Route path="ot-schedule" element={<ProtectedRoute requiredPrivileges={['VIEW_VISITS']}><OTScheduleView /></ProtectedRoute>} />
            <Route path="rosters" element={<ProtectedRoute requiredPrivileges={['VIEW_SYSTEM_RBAC']}><DutyRosterView /></ProtectedRoute>} />

            {/* Catch-all 404 Route */}
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center w-full h-full min-h-[500px] text-center space-y-4">
                <h1 className="text-4xl font-bold text-muted-foreground">404</h1>
                <p className="text-lg text-muted-foreground">Page not found</p>
              </div>
            } />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
