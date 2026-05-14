import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Generic Supabase CRUD hook for clinic tables
 */
export function useFirestore(tableName) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all documents
  const getAll = useCallback(async (orderByField = 'created_at', direction = 'desc') => {
    if (!user) return [];
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from(tableName)
        .select('*')
        .eq('clinic_id', user.id)
        .order(orderByField, { ascending: direction === 'asc' });
        
      if (err) throw err;
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${tableName}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, tableName]);

  // Get single document
  const getById = useCallback(async (docId) => {
    if (!user) return null;
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from(tableName)
        .select('*')
        .eq('clinic_id', user.id)
        .eq('id', docId)
        .single();
        
      if (err) throw err;
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${tableName}/${docId}:`, err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [user, tableName]);

  // Get documents with custom query
  const getWhere = useCallback(async (field, operator, value, orderByField = 'created_at', direction = 'desc') => {
    if (!user) return [];
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from(tableName).select('*').eq('clinic_id', user.id);
      
      // Map Firestore operators to Supabase filters
      if (operator === '==') query = query.eq(field, value);
      else if (operator === '>') query = query.gt(field, value);
      else if (operator === '<') query = query.lt(field, value);
      else if (operator === '>=') query = query.gte(field, value);
      else if (operator === '<=') query = query.lte(field, value);
      
      const { data, error: err } = await query.order(orderByField, { ascending: direction === 'asc' });
        
      if (err) throw err;
      return data;
    } catch (err) {
      setError(err.message);
      console.error(`Error querying ${tableName}:`, err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user, tableName]);

  // Create document
  const create = useCallback(async (data) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    setError(null);
    try {
      const { data: inserted, error: err } = await supabase
        .from(tableName)
        .insert({
          ...data,
          clinic_id: user.id,
        })
        .select()
        .single();
        
      if (err) throw err;
      return inserted;
    } catch (err) {
      setError(err.message);
      console.error(`Error creating ${tableName}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, tableName]);

  // Update document
  const update = useCallback(async (docId, data) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    setError(null);
    try {
      // eslint-disable-next-line no-unused-vars
      const { id, ...updateData } = data;
      const { data: updated, error: err } = await supabase
        .from(tableName)
        .update(updateData)
        .eq('clinic_id', user.id)
        .eq('id', docId)
        .select()
        .single();
        
      if (err) throw err;
      return updated;
    } catch (err) {
      setError(err.message);
      console.error(`Error updating ${tableName}/${docId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, tableName]);

  // Delete document
  const remove = useCallback(async (docId) => {
    if (!user) throw new Error('User not authenticated');
    setLoading(true);
    setError(null);
    try {
      const { error: err } = await supabase
        .from(tableName)
        .delete()
        .eq('clinic_id', user.id)
        .eq('id', docId);
        
      if (err) throw err;
      return true;
    } catch (err) {
      setError(err.message);
      console.error(`Error deleting ${tableName}/${docId}:`, err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user, tableName]);

  // Subscribe to real-time updates
  const subscribe = useCallback((callback) => {
    if (!user) return () => {};
    const channel = supabase
      .channel(`public:${tableName}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: tableName, filter: `clinic_id=eq.${user.id}` }, () => {
        // Simple reload strategy for MVP
        getAll().then(callback);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, tableName, getAll]);

  return {
    loading,
    error,
    getAll,
    getById,
    getWhere,
    create,
    update,
    remove,
    subscribe,
  };
}
