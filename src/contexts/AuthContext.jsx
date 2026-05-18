import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [clinicData, setClinicData] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadClinicData(user) {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error && error.code === 'PGRST116') { // Record not found
        const clinicName = user.user_metadata?.clinic_name || 'Minha Clínica';
        const slug = clinicName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        const { data: newClinic, error: createError } = await supabase
          .from('clinics')
          .insert({
            id: user.id,
            name: clinicName,
            slug: slug,
            email: user.email || '',
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
        loadClinicData(session.user);
      } else {
        setLoading(false);
      }
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        loadClinicData(session.user);
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
      // Passando o clinicName no metadata (opcional, mas bom ter)
      options: {
        data: {
          clinic_name: clinicName
        }
      }
    });
    
    if (error) throw error;

    // Não tentamos mais inserir a clínica aqui, pois o usuário ainda não confirmou o e-mail.
    // A inserção no banco estava causando o erro de RLS.
    // A clínica será criada automaticamente pela função loadClinicData 
    // assim que o usuário confirmar o e-mail e fizer o login.
    
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
