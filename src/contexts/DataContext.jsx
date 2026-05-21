import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();

  const [pets, setPets] = useState([]);
  const [tutors, setTutors] = useState([]);
  const [products, setProducts] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  // Track if initial load has been done to avoid re-fetching
  const hasLoaded = useRef(false);

  // In-flight promise refs — prevents concurrent duplicate fetches
  // When refreshX() is called while another refreshX() is already running,
  // the second call reuses the first's promise instead of firing a new request.
  const inflightPets = useRef(null);
  const inflightTutors = useRef(null);
  const inflightProducts = useRef(null);
  const inflightAppointments = useRef(null);

  // Generic fetch helper
  const fetchTable = useCallback(async (tableName, orderBy = 'created_at', direction = 'asc') => {
    if (!user) return [];
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('clinic_id', user.id)
        .order(orderBy, { ascending: direction === 'asc' });
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error(`Error fetching ${tableName}:`, err);
      return [];
    }
  }, [user]);

  // Load all data at once
  const loadAll = useCallback(async () => {
    if (!user) return;
    setInitialLoading(true);
    try {
      const [petsData, tutorsData, productsData, appointmentsData] = await Promise.all([
        fetchTable('pets', 'name', 'asc'),
        fetchTable('tutors', 'name', 'asc'),
        fetchTable('products', 'name', 'asc'),
        fetchTable('appointments', 'date', 'asc'),
      ]);
      setPets(petsData);
      setTutors(tutorsData);
      setProducts(productsData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setInitialLoading(false);
    }
  }, [user, fetchTable]);

  // Individual reload functions (for after create/update/delete)
  // Each uses an in-flight ref so concurrent calls share the same fetch promise.
  const refreshPets = useCallback(async () => {
    if (inflightPets.current) return inflightPets.current;
    inflightPets.current = fetchTable('pets', 'name', 'asc')
      .then(data => { setPets(data); return data; })
      .finally(() => { inflightPets.current = null; });
    return inflightPets.current;
  }, [fetchTable]);

  const refreshTutors = useCallback(async () => {
    if (inflightTutors.current) return inflightTutors.current;
    inflightTutors.current = fetchTable('tutors', 'name', 'asc')
      .then(data => { setTutors(data); return data; })
      .finally(() => { inflightTutors.current = null; });
    return inflightTutors.current;
  }, [fetchTable]);

  const refreshProducts = useCallback(async () => {
    if (inflightProducts.current) return inflightProducts.current;
    inflightProducts.current = fetchTable('products', 'name', 'asc')
      .then(data => { setProducts(data); return data; })
      .finally(() => { inflightProducts.current = null; });
    return inflightProducts.current;
  }, [fetchTable]);

  const refreshAppointments = useCallback(async () => {
    if (inflightAppointments.current) return inflightAppointments.current;
    inflightAppointments.current = fetchTable('appointments', 'date', 'asc')
      .then(data => { setAppointments(data); return data; })
      .finally(() => { inflightAppointments.current = null; });
    return inflightAppointments.current;
  }, [fetchTable]);

  // Load all data once when user becomes available
  useEffect(() => {
    if (user && !hasLoaded.current) {
      hasLoaded.current = true;
      loadAll();
    }
    if (!user) {
      hasLoaded.current = false;
      setPets([]);
      setTutors([]);
      setProducts([]);
      setAppointments([]);
      setInitialLoading(false);
    }
  }, [user, loadAll]);

  // Set up real-time subscriptions for all tables
  useEffect(() => {
    if (!user) return;

    const channels = ['pets', 'tutors', 'products', 'appointments'].map(table => {
      return supabase
        .channel(`data_${table}_${user.id}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: table,
          filter: `clinic_id=eq.${user.id}`,
        }, () => {
          // Refresh the specific table on any change
          if (table === 'pets') refreshPets();
          else if (table === 'tutors') refreshTutors();
          else if (table === 'products') refreshProducts();
          else if (table === 'appointments') refreshAppointments();
        })
        .subscribe();
    });

    return () => {
      channels.forEach(ch => supabase.removeChannel(ch));
    };
  }, [user, refreshPets, refreshTutors, refreshProducts, refreshAppointments]);

  const value = {
    pets,
    tutors,
    products,
    appointments,
    initialLoading,
    refreshPets,
    refreshTutors,
    refreshProducts,
    refreshAppointments,
    refreshAll: loadAll,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
