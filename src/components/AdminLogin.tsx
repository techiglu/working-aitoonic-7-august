import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Lock, Mail, Eye, EyeOff, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      if (data.user) {
        toast.success('Login successful!');
        onLoginSuccess();
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('dc556316@gmail.com');
    setPassword('Deepak@@@qwer1234Monu@@@');
    
    // Auto-submit after setting demo credentials
    setTimeout(() => {
      const form = document.getElementById('admin-login-form') as HTMLFormElement;
      if (form) {
        form.requestSubmit();
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-royal-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Sparkles className="w-12 h-12 text-royal-gold" />
          </div>
          <h2 className="mt-6 text-3xl font-bold gradient-text">
            Admin Panel Login
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Sign in to access the Aitoonic admin panel
          </p>
        </div>

        <div className="bg-royal-dark-card rounded-xl p-8 border border-royal-dark-lighter">
          <form id="admin-login-form" className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold transition-colors"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-royal-dark border border-royal-dark-lighter rounded-lg text-white focus:outline-none focus:border-royal-gold transition-colors"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-royal-gold text-royal-dark px-6 py-3 rounded-lg font-bold hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-royal-dark-lighter" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-royal-dark-card text-gray-400">Demo Access</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full border-2 border-royal-gold text-royal-gold px-6 py-3 rounded-lg font-bold hover:bg-royal-gold hover:text-royal-dark transition-all"
              >
                Use Demo Credentials
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <div className="text-sm text-gray-400">
              <p className="mb-2">Admin Credentials:</p>
              <p className="font-mono text-xs bg-royal-dark rounded px-2 py-1 inline-block">
                Email: dc556316@gmail.com
              </p>
              <br />
              <p className="font-mono text-xs bg-royal-dark rounded px-2 py-1 inline-block mt-1">
                Password: Deepak@@@qwer1234Monu@@@
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}