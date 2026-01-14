import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

interface Vehicle {
  id: string;
  name: string;
  type: string;
  plateNumber?: string;
  doorNo?: string;
  asset?: string;
  chassisNo?: string;
  category?: string;
  plateNumberArabic?: string;
  builtInTrailer?: boolean;
  builtInReefer?: boolean;
  trailerCategory?: string;
  isInUse?: boolean;
}

interface UsePaginatedVehiclesOptions {
  type?: 'Vehicle' | 'Attachment' | 'Equipment' | 'Accessory';
  pageSize?: number;
  excludeOrderId?: string; // Exclude vehicles/attachments assigned to pending orders, except this order (for edit mode)
}

export function usePaginatedVehicles({
  type,
  pageSize = 20,
  excludeOrderId,
}: UsePaginatedVehiclesOptions = {}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fetchVehicles = useCallback(
    async (pageNum: number, reset: boolean = false, search: string = '') => {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          page: pageNum.toString(),
          limit: pageSize.toString(),
        });

        if (type) {
          params.append('type', type);
        }

        if (search && search.trim()) {
          params.append('search', search.trim());
        }

        if (excludeOrderId) {
          params.append('excludeOrderId', excludeOrderId);
        }

        const response = await api.get(`/vehicles?${params.toString()}`, {
          signal: abortControllerRef.current.signal,
        });

        if (response.data.success && Array.isArray(response.data.results)) {
          const newVehicles = response.data.results;
          
          if (reset) {
            setVehicles(newVehicles);
          } else {
            setVehicles((prev) => [...prev, ...newVehicles]);
          }

          const totalPages = response.data.pagination?.totalPages || 1;
          setHasMore(pageNum < totalPages);
          setPage(pageNum);
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch vehicles');
          console.error('Error fetching vehicles:', err);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [type, pageSize],
  );

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchVehicles(page + 1, false, searchQuery);
    }
  }, [isLoading, hasMore, page, searchQuery, fetchVehicles]);

  const reset = useCallback(() => {
    setVehicles([]);
    setPage(1);
    setHasMore(true);
    fetchVehicles(1, true, searchQuery);
  }, [fetchVehicles, searchQuery]);

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search - wait 300ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      setVehicles([]);
      setPage(1);
      setHasMore(true);
      fetchVehicles(1, true, value);
    }, 300);
  }, [fetchVehicles]);

  // Reset when type changes
  useEffect(() => {
    setSearchQuery('');
    reset();
  }, [type]);

  // Initial load
  useEffect(() => {
    if (vehicles.length === 0 && !searchQuery) {
      fetchVehicles(1, true, '');
    }
  }, []);

  // Method to ensure a specific vehicle is loaded (for edit mode)
  const ensureVehicleLoaded = useCallback(
    async (vehicleId: string) => {
      // Check if vehicle is already in the list
      if (vehicles.some((v) => v.id === vehicleId)) {
        return;
      }

      // Fetch the specific vehicle
      try {
        const response = await api.get(`/vehicles/${vehicleId}`);
        if (response.data.success && response.data.result) {
          const vehicle = response.data.result;
          // Only add if it matches the type filter
          if (!type || vehicle.type === type) {
            setVehicles((prev) => {
              // Avoid duplicates
              if (prev.some((v) => v.id === vehicleId)) {
                return prev;
              }
              return [vehicle, ...prev];
            });
          }
        }
      } catch (err) {
        console.error('Error fetching vehicle:', err);
      }
    },
    [vehicles, type],
  );

  // Cleanup
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    vehicles,
    isLoading,
    hasMore,
    loadMore,
    reset,
    error,
    searchQuery,
    setSearchQuery: handleSearchChange,
    ensureVehicleLoaded,
  };
}

