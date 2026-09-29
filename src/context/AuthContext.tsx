import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useToast } from './ToastContext';

interface AuthContextType {
  isAdminAuthenticated: boolean;
  adminEmail: string | null;
  loading: boolean;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => Promise<void>;
}

const ADMIN_STORAGE_KEY = 'etopiamart_admin_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      if (isSupabaseConfigured) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setIsAdminAuthenticated(true);
            setAdminEmail(session.user.email || 'admin@etopiamart.com');
          } else {
            setIsAdminAuthenticated(false);
            setAdminEmail(null);
          }
        } catch (e) {
          console.warn('Supabase auth session check failed', e);
        }
      } else {
        // Fallback local session check
        const savedSession = localStorage.getItem(ADMIN_STORAGE_KEY);
        if (savedSession) {
          const data = JSON.parse(savedSession);
          setIsAdminAuthenticated(true);
          setAdminEmail(data.email || 'admin@etopiamart.com');
        }
      }
      setLoading(false);
    };

    checkSession();

    if (isSupabaseConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setIsAdminAuthenticated(true);
          setAdminEmail(session.user.email || 'admin@etopiamart.com');
        } else {
          setIsAdminAuthenticated(false);
          setAdminEmail(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    setLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          showToast('Login Failed', error.message, 'error');
          setLoading(false);
          return false;
        }

        if (data.user) {
          setIsAdminAuthenticated(true);
          setAdminEmail(data.user.email || email);
          showToast('Admin Logged In', 'Welcome to EtopiaMart Dashboard', 'success');
          setLoading(false);
          return true;
        }
      } catch (e: any) {
        showToast('Auth Error', e.message || 'Unable to connect to Supabase Auth', 'error');
      }
    }

    // Demo admin bypass if Supabase is unconfigured or for development preview
    if (email === 'admin@etopiamart.com' || email === 'admin' || (email && pass.length >= 6)) {
      const sessionData = { email, loggedInAt: new Date().toISOString() };
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(sessionData));
      setIsAdminAuthenticated(true);
      setAdminEmail(email);
      showToast('Admin Logged In', 'Welcome to EtopiaMart Admin Panel (Demo Mode)', 'success');
      setLoading(false);
      return true;
    }

    showToast('Invalid Credentials', 'Please check your admin email and password.', 'error');
    setLoading(false);
    return false;
  };

  const logoutAdmin = async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Supabase signOut error', e);
      }
    }
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAdminAuthenticated(false);
    setAdminEmail(null);
    showToast('Logged Out', 'You have been logged out of the admin panel.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        isAdminAuthenticated,
        adminEmail,
        loading,
        loginAdmin,
        logoutAdmin,
      }}
    >
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
