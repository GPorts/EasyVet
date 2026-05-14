import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [clinicData, setClinicData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadClinicData(userId, email) {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error && error.code === 'PGRST116') { // Record not found
        const slug = `clinica-${userId.substring(0, 5)}`;
        const { data: newClinic, error: createError } = await supabase
          .from('clinics')
          .insert({
            id: userId,
            name: 'Minha Clínica',
            slug: slug,
            email: email || '',
            phone: '',
            address: '',
          })
          .select()
          .single();
        
        if (!createError) setClinicData(newClinic);
      } else if (!error && data) {
        setClinicData(data);
      }
    } catch (error) {
      console.error('Error loading clinic data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadClinicData(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadClinicData(session.user.id, session.user.email);
      } else {
        setClinicData(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  };

  const signUp = async (email, password, clinicName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) throw error;

    const slug = clinicName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Create clinic document
    const { error: clinicError } = await supabase
      .from('clinics')
      .insert({
        id: data.user.id,
        name: clinicName,
        slug: slug,
        email: email,
        phone: '',
        address: '',
      });

    if (clinicError) {
      console.error('Error creating clinic:', clinicError);
      throw clinicError;
    }

    setClinicData({
      id: data.user.id,
      name: clinicName,
      slug: slug,
      email: email,
      phone: '',
      address: '',
    });

    return data.user;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setClinicData(null);
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });
    if (error) throw error;
    return data;
  };

  const value = {
    user,
    clinicData,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
