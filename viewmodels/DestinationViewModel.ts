import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Destination, DestinationCategory } from '../models/Destination';
import { DEFAULT_FILTERS, SearchFilters } from '../models/SearchFilters';
import DatabaseService from '../services/DatabaseService';
import LocationService, { UserLocation } from '../services/LocationService';

export const useDestinationViewModel = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Paralléliser les chargements pour éviter les waterfalls
    Promise.all([
      loadDestinations(), 
      loadCategories(),
      loadFavorites(),
      loadUserLocation(),
    ]).catch((error) => {
      if (__DEV__) console.error('Error loading initial data:', error);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFavorites = async () => {
    const savedFavorites = await DatabaseService.getFavorites();
    setFavorites(new Set(savedFavorites));
  };

  const loadUserLocation = async () => {
    const location = await LocationService.getCurrentLocation();
    setUserLocation(location);
  };

  const loadDestinations = async () => {
    setIsLoading(true);
    try {
      const dbDestinations = await DatabaseService.getDestinationsByCategory(selectedCategory);
      setDestinations(dbDestinations);
    } catch (error) {
      if (__DEV__) console.error('Error loading destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = () => {
    const mockCategories: DestinationCategory[] = [
      { id: 'all', name: 'All', icon: '🌍', color: '#6366F1' },
      { id: 'beach', name: 'Beach', icon: '🏖️', color: '#3B82F6' },
      { id: 'mountain', name: 'Mountain', icon: '⛰️', color: '#8B5CF6' },
      { id: 'city', name: 'City', icon: '🏙️', color: '#EC4899' },
      { id: 'countryside', name: 'Countryside', icon: '🌾', color: '#10B981' },
    ];
    setCategories(mockCategories);
  };

  const performSearch = useCallback(async () => {
    setIsLoading(true);
    try {
      const results = await DatabaseService.searchDestinations(searchQuery, {
        category: selectedCategory,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        minRating: filters.minRating,
        amenities: filters.amenities,
        sortBy: filters.sortBy,
      });
      setDestinations(results);
    } catch (error) {
      if (__DEV__) console.error('Error searching destinations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, filters]);

  // Debounce de la recherche (300ms)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch();
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedCategory, filters, performSearch]);

  const filteredDestinations = useMemo(() => {
    return destinations;
  }, [destinations]);

  const toggleFavorite = async (destinationId: string) => {
    const isFavorite = favorites.has(destinationId);
    
    if (isFavorite) {
      await DatabaseService.removeFavorite(destinationId);
    } else {
      await DatabaseService.addFavorite(destinationId);
    }

    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(destinationId)) {
        newFavorites.delete(destinationId);
      } else {
        newFavorites.add(destinationId);
      }
      return newFavorites;
    });

    setDestinations((prev) =>
      prev.map((dest) =>
        dest.id === destinationId ? { ...dest, isFavorite: !dest.isFavorite } : dest
      )
    );
  };

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    destinations: filteredDestinations,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    resetFilters,
    toggleFavorite,
    favorites,
    userLocation,
    refreshLocation: loadUserLocation,
    isLoading,
    resultsCount: destinations.length,
  };
};
