import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

/**
 * Hook for tutor management - uses global cache
 */
export function useTutors() {
  const { user } = useAuth();
  const { tutors, refreshTutors, initialLoading } = useData();

  const loadTutors = useCallback(async () => {
    return await refreshTutors();
  }, [refreshTutors]);

  const createTutor = useCallback(async (data) => {
    if (!user) throw new Error('User not authenticated');
    const { data: inserted, error } = await supabase
      .from('tutors')
      .insert({ ...data, clinic_id: user.id })
      .select()
      .single();
    if (error) throw error;
    return inserted;
  }, [user]);

  const updateTutor = useCallback(async (id, data) => {
    if (!user) throw new Error('User not authenticated');
    // eslint-disable-next-line no-unused-vars
    const { id: _, ...updateData } = data;
    const { error } = await supabase
      .from('tutors')
      .update(updateData)
      .eq('clinic_id', user.id)
      .eq('id', id);
    if (error) throw error;
  }, [user]);

  const deleteTutor = useCallback(async (id) => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase
      .from('tutors')
      .delete()
      .eq('clinic_id', user.id)
      .eq('id', id);
    if (error) throw error;
  }, [user]);

  const searchTutors = useCallback((searchTerm) => {
    if (!searchTerm) return tutors;
    const term = searchTerm.toLowerCase();
    return tutors.filter(t => 
      t.name?.toLowerCase().includes(term) ||
      t.email?.toLowerCase().includes(term) ||
      t.phone?.includes(term) ||
      t.cpf?.includes(term)
    );
  }, [tutors]);

  return {
    tutors,
    loading: initialLoading,
    loadTutors,
    createTutor,
    updateTutor,
    deleteTutor,
    searchTutors,
  };
}
