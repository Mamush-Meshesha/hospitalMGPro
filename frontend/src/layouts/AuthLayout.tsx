import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Activity, ShieldCheck, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex bg-background">
      {/* Left side - Branding & Graphic (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden text-white bg-slate-900">

        {/* Photographic Background */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/auth-bg.png')" }}
        ></div>

        {/* Dark Gradient Overlay for Readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-900/40"></div>

        <div className="relative z-10 flex items-center gap-3 font-bold text-2xl tracking-tight">
          <div className="h-10 w-10 rounded bg-white flex items-center justify-center shadow-lg shadow-black/20">
            <Activity className="text-primary flex-shrink-0" size={24} />
          </div>
          <span>Hospital-MG<span className="font-light opacity-80">Pro</span></span>
        </div>

        <div className="relative z-10 max-w-lg mt-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-sm font-medium mb-6 backdrop-blur-sm border border-white/10">
              <ShieldCheck size={16} />
              Enterprise Security Grade
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Secure Staff & Provider Portal
            </h1>
            <p className="text-primary-foreground/80 text-lg leading-relaxed">
              Access the clinical core. Manage patient encounters, verify diagnostics, and coordinate care across the facility securely.
            </p>
          </motion.div>

          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <HeartPulse className="text-white" size={24} />
              <h3 className="font-semibold text-white">Clinical Precision</h3>
              <p className="text-sm text-primary-foreground/70">Real-time vitals and CPOE systems.</p>
            </div>
            <div className="flex flex-col gap-2">
              <ShieldCheck className="text-white" size={24} />
              <h3 className="font-semibold text-white">HIPAA Compliant</h3>
              <p className="text-sm text-primary-foreground/70">End-to-end encrypted medical records.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-primary-foreground/50 font-medium">
          &copy; {new Date().getFullYear()} Hospital-MG Pro Healthcare Systems. All rights reserved.
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 bg-background relative">
        <div className="absolute top-6 right-6 lg:hidden flex items-center gap-2 text-foreground font-bold text-xl tracking-tight">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center shadow-sm">
            <Activity className="text-primary-foreground flex-shrink-0" size={18} />
          </div>
          <span>Hospital-MG<span className="font-light opacity-60">Pro</span></span>
        </div>

        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
