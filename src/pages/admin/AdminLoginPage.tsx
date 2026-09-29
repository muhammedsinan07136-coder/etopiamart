import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { loginAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    const success = await loginAdmin(email, password);
    setIsSubmitting(false);

    if (success) {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <img src="/logo.png" alt="EtopiaMart" className="h-10 w-auto" />
            <span className="font-extrabold text-2xl tracking-tight text-white">
              Etopia<span className="text-brand-500">Mart</span>
            </span>
          </div>
          <p className="text-xs text-dark-400 font-semibold uppercase tracking-wider">
            Secure Admin Portal Authorization
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-dark-900 border border-dark-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 border-b border-dark-800 pb-4">
            <div className="p-2.5 bg-brand-500/10 text-brand-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white">Admin Sign In</h2>
              <p className="text-xs text-dark-400">Enter your credentials to access the store dashboard</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Admin Email Address"
              type="email"
              placeholder="e.g. admin@etopiamart.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="gold"
              size="lg"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full font-extrabold mt-2 shadow-md"
            >
              Sign In To Dashboard
            </Button>
          </form>

          {/* Demo Login Tip */}
          <div className="bg-dark-950 p-4 rounded-2xl border border-dark-800 text-xs text-dark-400 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-brand-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Demo Quick Login Credentials:</span>
            </div>
            <p>Email: <code className="text-white">admin@etopiamart.com</code></p>
            <p>Password: <code className="text-white">admin123</code></p>
          </div>
        </div>

        <div className="text-center">
          <a href="/" className="text-xs text-dark-400 hover:text-white transition-colors">
            ← Back to Customer Storefront
          </a>
        </div>

      </div>
    </div>
  );
};
