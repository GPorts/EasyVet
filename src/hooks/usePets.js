import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

/**
 * Hook for pet management - uses global cache
 */
export function usePets() {
  const { user } = useAuth();
  const { pets, refreshPets, initialLoading } = useData();

  const loadPets = useCallback(async () => {
    return await refreshPets();
  }, [refreshPets]);

  const getPetById = useCallback(async (id) => {
    // Try cache first
    const cached = pets.find(p => p.id === id);
    if (cached) return cached;
    // Fallback to direct fetch
    if (!user) return null;
    const { data, error } = await supabase
      .from('pets')
      .select('*')
      .eq('clinic_id', user.id)
      .eq('id', id)
      .single();
    if (error) return null;
    return data;
  }, [pets, user]);

  const getPetsByTutor = useCallback((tutorId) => {
    return pets.filter(p => p.tutorId === tutorId);
  }, [pets]);

  const createPet = useCallback(async (data) => {
    if (!user) throw new Error('User not authenticated');
    const { data: inserted, error } = await supabase
      .from('pets')
      .insert({ ...data, clinic_id: user.id })
      .select()
      .single();
    if (error) throw error;
    await refreshPets();
    return inserted;
  }, [user, refreshPets]);

  const updatePet = useCallback(async (id, data) => {
    if (!user) throw new Error('User not authenticated');
    // eslint-disable-next-line no-unused-vars
    const { id: _, ...updateData } = data;
    const { error } = await supabase
      .from('pets')
      .update(updateData)
      .eq('clinic_id', user.id)
      .eq('id', id);
    if (error) throw error;
    await refreshPets();
  }, [user, refreshPets]);

  const deletePet = useCallback(async (id) => {
    if (!user) throw new Error('User not authenticated');
    const { error } = await supabase
      .from('pets')
      .delete()
      .eq('clinic_id', user.id)
      .eq('id', id);
    if (error) throw error;
    await refreshPets();
  }, [user, refreshPets]);

  // Add vaccine record to pet
  const addVaccine = useCallback(async (petId, vaccine) => {
    const pet = await getPetById(petId);
    if (!pet) throw new Error('Pet not found');
    const vaccines = pet.vaccines || [];
    vaccines.push({
      ...vaccine,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    await updatePet(petId, { vaccines });
  }, [getPetById, updatePet]);

  // Add medical record
  const addMedicalRecord = useCallback(async (petId, record) => {
    const pet = await getPetById(petId);
    if (!pet) throw new Error('Pet not found');
    const records = pet.medicalRecords || [];
    records.push({
      ...record,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    });
    await updatePet(petId, { medicalRecords: records });
  }, [getPetById, updatePet]);

  // Get pets with pending vaccines (booster date approaching)
  const getPendingVaccines = useCallback(() => {
    const now = new Date();
    const pending = [];
    pets.forEach(pet => {
      (pet.vaccines || []).forEach(vaccine => {
        if (vaccine.boosterAt) {
          const boosterDate = new Date(vaccine.boosterAt);
          const daysUntil = Math.ceil((boosterDate - now) / (1000 * 60 * 60 * 24));
          if (daysUntil >= 0 && daysUntil <= 7) {
            pending.push({ pet, vaccine, daysUntil });
          }
        }
      });
    });
    return pending.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [pets]);

  const searchPets = useCallback((searchTerm) => {
    if (!searchTerm) return pets;
    const term = searchTerm.toLowerCase();
    return pets.filter(p =>
      p.name?.toLowerCase().includes(term) ||
      p.species?.toLowerCase().includes(term) ||
      p.breed?.toLowerCase().includes(term)
    );
  }, [pets]);

  return {
    pets,
    loading: initialLoading,
    loadPets,
    getPetById,
    getPetsByTutor,
    createPet,
    updatePet,
    deletePet,
    addVaccine,
    addMedicalRecord,
    getPendingVaccines,
    searchPets,
  };
}
