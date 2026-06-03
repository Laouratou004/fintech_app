import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../services/supabase';

// Contexte d'authentification connecté à Supabase
// Gère la session, le profil étendu (table profiles) et les actions auth
const AuthContext = createContext(null);

const buildInitials = (fullName) =>
  (fullName || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('') || '??';

// Convertit la ligne Supabase (snake_case) vers le shape attendu par l'UI (camelCase)
const mapProfile = (row, authUser) => {
  if (!row) return null;
  return {
    id: row.id,
    email: authUser?.email || '',
    fullName: row.full_name,
    phone: row.phone || '',
    country: row.country || 'France',
    preferredCurrency: row.preferred_currency || 'EUR',
    language: row.language || 'fr',
    notificationsEnabled: row.notifications_enabled ?? true,
    biometricEnabled: row.biometric_enabled ?? false,
    pin: row.pin_hash || null,
    kycLevel: row.kyc_level || 'pending',
    monthlyLimit: Number(row.monthly_limit) || 2000,
    monthlyUsed: Number(row.monthly_used) || 0,
    avatarInitials: row.avatar_initials || buildInitials(row.full_name),
  };
};

// Inverse: camelCase -> snake_case pour les updates
const toDbPatch = (patch) => {
  const map = {
    fullName: 'full_name',
    phone: 'phone',
    country: 'country',
    preferredCurrency: 'preferred_currency',
    language: 'language',
    notificationsEnabled: 'notifications_enabled',
    biometricEnabled: 'biometric_enabled',
    pin: 'pin_hash',
    monthlyLimit: 'monthly_limit',
    monthlyUsed: 'monthly_used',
    avatarInitials: 'avatar_initials',
  };
  const out = {};
  for (const k of Object.keys(patch)) {
    if (map[k]) out[map[k]] = patch[k];
  }
  return out;
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Charge le profil depuis la table profiles
  const fetchProfile = async (authUser) => {
    if (!authUser) {
      setUser(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (error) {
      console.warn('[AuthContext] fetchProfile error:', error.message);
      setUser({ id: authUser.id, email: authUser.email, fullName: authUser.email, avatarInitials: '??' });
      return;
    }
    setUser(mapProfile(data, authUser));
  };

  // Initialisation: récupère la session existante + écoute les changements
  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      await fetchProfile(data.session?.user);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
        await fetchProfile(newSession?.user);
      }
    );

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = async ({ email, password }) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (error) {
      setAuthError(error.message === 'Invalid login credentials'
        ? 'Identifiants incorrects'
        : error.message);
      return false;
    }
    return true;
  };

  const signup = async ({ fullName, email, password, phone, country }) => {
    setAuthError(null);
    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: fullName.trim(), phone, country },
      },
    });
    if (error) {
      setAuthError(
        error.message.includes('already')
          ? 'Un compte existe déjà avec cet e-mail'
          : error.message
      );
      return false;
    }
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setAuthError(null);
  };

  // Met à jour le profil dans la table profiles ET dans le state local
  const updateProfile = async (partial) => {
    if (!user) return;
    setUser((prev) => ({ ...prev, ...partial }));

    const patch = toDbPatch(partial);
    if (Object.keys(patch).length === 0) return;
    patch.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('profiles')
      .update(patch)
      .eq('id', user.id);
    if (error) console.warn('[AuthContext] updateProfile error:', error.message);
  };

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isAuthenticated: !!session && !!user,
      authError,
      clearAuthError: () => setAuthError(null),
      login,
      signup,
      logout,
      updateProfile,
    }),
    [user, session, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};
