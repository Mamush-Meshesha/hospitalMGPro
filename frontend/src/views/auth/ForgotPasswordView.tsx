import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { fetchApi } from '../../utils/api';

export default function ForgotPasswordView() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);

    try {
      await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      setIsSent(true);
    } catch (err) {
      console.error(err);
      // Even on failure, for security reasons we might just say sent, or show an error
      setIsSent(true); 
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="w-full flex flex-col space-y-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle2 className="text-primary" size={32} />
          </div>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">Check your email</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            We have sent a password recovery link to <span className="font-medium text-foreground">{email}</span>. Please check your inbox and spam folder.
          </p>
        </div>
        <div className="pt-4">
          <Link to="/auth/login" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="text-center sm:text-left space-y-2 mb-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Reset Password</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Enter the email address associated with your staff account and we'll send you a link to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="dr.house@openmrs.local"
              required
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary rounded shadow-sm outline-none transition-all text-foreground"
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={isLoading || !email}
          className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors py-2.5 rounded font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      <div className="pt-6 border-t border-border mt-6 text-center text-sm">
        <Link to="/auth/login" className="inline-flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </div>
    </div>
  );
}
