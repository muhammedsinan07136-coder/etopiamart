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
            // Secure check: verify user exists in admin_users table
            const { data: adminRecord } = await supabase
              .from('admin_users')
              .select('id, role')
              .eq('id', session.user.id)
              .single();

            if (adminRecord) {
              setIsAdminAuthenticated(true);
              setAdminEmail(session.user.email || 'admin@etopiamart.com');
            } else {
              setIsAdminAuthenticated(false);
              setAdminEmail(null);
            }
          } else {
            setIsAdminAuthenticated(false);
            setAdminEmail(null);
          }
        } catch (e) {
          console.warn('Supabase auth session check failed', e);
          setIsAdminAuthenticated(false);
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
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: adminRecord } = await supabase
            .from('admin_users')
            .select('id, role')
            .eq('id', session.user.id)
            .single();

          if (adminRecord) {
            setIsAdminAuthenticated(true);
            setAdminEmail(session.user.email || 'admin@etopiamart.com');
          } else {
            setIsAdminAuthenticated(false);
            setAdminEmail(null);
          }
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
          // Verify admin role in admin_users table
          const { data: adminRecord, error: adminErr } = await supabase
            .from('admin_users')
            .select('id, role')
            .eq('id', data.user.id)
            .single();

          if (adminErr || !adminRecord) {
            await supabase.auth.signOut();
            showToast('Access Denied', 'Your account does not have administrator privileges in admin_users.', 'error');
            setLoading(false);
            return false;
          }

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

    // Strict local admin credentials check if Supabase is unconfigured or for demo preview
    const isAllowedEmail = 
      email.toLowerCase().trim() === 'admin@etopiamart.com' || 
      email.toLowerCase().trim() === 'muhammedsinan07136@gmail.com';
    const isAllowedPassword = 
      pass === 'admin123' || 
      pass === 'sinan123';

    if (isAllowedEmail && isAllowedPassword) {
      const sessionData = { email: email.toLowerCase().trim(), loggedInAt: new Date().toISOString() };
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(sessionData));
      setIsAdminAuthenticated(true);
      setAdminEmail(email.toLowerCase().trim());
      showToast('Admin Logged In', 'Welcome to EtopiaMart Dashboard', 'success');
      setLoading(false);
      return true;
    }

    showToast('Invalid Credentials', 'Wrong email or password. Access denied.', 'error');
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
