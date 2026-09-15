import React from 'react';
import { motion } from 'framer-motion';
import { Check, Info, Settings, ShieldAlert, Star } from 'lucide-react';
import { useAuth, ALL_SUBSCRIPTIONS } from '../context/AuthContext';
import type { SubscriptionModule } from '../context/AuthContext';

const SUBSCRIPTION_DETAILS: Record<SubscriptionModule, { name: string, price: string, features: string[] }> = {
  'OUTPATIENT': {
    name: 'Outpatient Management',
    price: '70,000 ETB',
    features: ['Medical Alerts', 'Duty Roster', 'Triage & Appointments', 'Clinical Services & Observation']
  },
  'LAB_RADIOLOGY': {
    name: 'Laboratory and Radiology',
    price: '40,000 ETB',
    features: ['Online Verification', 'Sample/Test Entry', 'Investigation Requests', 'External Lab Integration']
  },
  'REGISTRATION': {
    name: 'Registration and Medical Recording',
    price: '20,000 ETB',
    features: ['Patient Registration', 'Inpatient/Outpatient', 'Schedules & Demographics']
  },
  'RECORDS_REPORTS': {
    name: 'Hospital Record and Reports',
    price: '34,000 ETB',
    features: ['Delivery/Birth Records', 'Generator Record', 'Daily/Indoor/OT Registers', 'Summaries']
  },
  'BILLING': {
    name: 'Billing',
    price: '20,000 ETB',
    features: ['Patient Billing', 'Package Installments', 'Billing Cycles', 'Recurring Charges']
  },
  'FINANCING': {
    name: 'Financing Accounting',
    price: '45,000 ETB',
    features: ['Cash/Bank Transfers', 'Receipts/Payments', 'Journal Voucher', 'General Ledger']
  },
  'PHARMACY': {
    name: 'Pharmacy Management',
    price: '40,000 ETB',
    features: ['Dispensing Workflow', 'Inventory', 'Usage-Based Ordering', 'Advanced Reporting']
  },
  'INPATIENT': {
    name: 'Inpatient Management',
    price: '45,000 ETB',
    features: ['Admission Workflows', 'Doctor Transfer', 'Nursing Notes', 'Surgery Scheduling']
  }
};

export default function SubscriptionSettingsView() {
  const { hasSubscription, toggleSubscription } = useAuth();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-full flex flex-col">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Star className="text-yellow-500" size={32} />
            Subscription Settings
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Manage your hospital's lifetime active subscriptions here. Toggling these modules will immediately update the sidebar navigation for all users to only display included features.
          </p>
        </div>
        <div className="bg-primary/10 text-primary px-4 py-2 rounded-md flex items-center gap-2 border border-primary/20">
          <ShieldAlert size={20} />
          <span className="font-semibold text-sm">System Admin Access Only</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
        {ALL_SUBSCRIPTIONS.map((module) => {
          const details = SUBSCRIPTION_DETAILS[module];
          const isActive = hasSubscription(module);

          return (
            <motion.div
              key={module}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative flex flex-col bg-card rounded-xl border transition-all duration-300 overflow-hidden ${
                isActive 
                  ? 'border-primary shadow-md ring-1 ring-primary/20' 
                  : 'border-border shadow-sm hover:border-border/80'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg z-10 flex items-center gap-1">
                  <Check size={12} /> Active
                </div>
              )}
              
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-bold text-lg leading-tight pr-6 ${isActive ? 'text-primary' : 'text-foreground'}`}>
                    {details.name}
                  </h3>
                </div>
                
                <div className="text-2xl font-black text-foreground mb-4 font-mono tracking-tighter">
                  {details.price}
                </div>

                <ul className="space-y-2 mb-6">
                  {details.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check size={14} className="mt-0.5 text-primary/70 shrink-0" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-muted/30 border-t border-border mt-auto">
                <button
                  onClick={() => toggleSubscription(module)}
                  className={`w-full py-2.5 rounded-md text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                    isActive
                      ? 'bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground border border-destructive/20'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
                  }`}
                >
                  {isActive ? 'Deactivate Module' : 'Activate Module'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
