import { useEffect, useMemo, useState } from 'react';
import { Destination, DestinationCategory } from '../models/Destination';
import LocationService, { UserLocation } from '../services/LocationService';
import StorageService from '../services/StorageService';

export const useDestinationViewModel = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<DestinationCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);

  useEffect(() => {
    // Paralléliser les chargements pour éviter les waterfalls
    Promise.all([
      loadDestinations(),
      loadCategories(),
      loadFavorites(),
      loadUserLocation(),
    ]).catch((error) => {
      console.error('Error loading initial data:', error);
    });
  }, []);

  const loadFavorites = async () => {
    const savedFavorites = await StorageService.getFavorites();
    setFavorites(new Set(savedFavorites));
  };

  const loadUserLocation = async () => {
    const location = await LocationService.getCurrentLocation();
    setUserLocation(location);
  };

  const loadDestinations = async () => {
    setIsLoading(true);
    try {
      const mockDestinations: Destination[] = [
        {
          id: '1',
          name: 'Bali Beach Resort',
          location: 'Seminyak',
          country: 'Indonesia',
          rating: 4.8,
          reviewCount: 234,
          price: 150,
          currency: 'USD',
          imageUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
          images: [
            'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
            'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
          ],
          description: 'Experience luxury beachfront living with stunning ocean views and world-class amenities.',
          amenities: ['WiFi', 'Pool', 'Beach Access', 'Restaurant', 'Spa'],
          category: 'beach',
          isFavorite: false,
          availableDates: [],
          coordinates: {
            latitude: -8.6705,
            longitude: 115.2126,
          },
        },
        {
          id: '2',
          name: 'Swiss Alps Chalet',
          location: 'Zermatt',
          country: 'Switzerland',
          rating: 4.9,
          reviewCount: 189,
          price: 280,
          currency: 'USD',
          imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          images: [
            'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          ],
          description: 'Cozy mountain retreat with breathtaking alpine views and ski-in/ski-out access.',
          amenities: ['WiFi', 'Fireplace', 'Ski Storage', 'Hot Tub', 'Mountain View'],
          category: 'mountain',
          isFavorite: false,
          availableDates: [],
          coordinates: {
            latitude: 45.9763,
            longitude: 7.6586,
          },
        },
        {
          id: '3',
          name: 'Tokyo City Hotel',
          location: 'Shibuya',
          country: 'Japan',
          rating: 4.7,
          reviewCount: 456,
          price: 120,
          currency: 'USD',
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
          images: [
            'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
          ],
          description: 'Modern hotel in the heart of Tokyo with easy access to shopping and entertainment.',
          amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar', 'City View'],
          category: 'city',
          isFavorite: false,
          availableDates: [],
          coordinates: {
            latitude: 35.6762,
            longitude: 139.6503,
          },
        },
        {
          id: '4',
          name: 'Santorini Villa',
          location: 'Oia',
          country: 'Greece',
          rating: 5.0,
          reviewCount: 312,
          price: 320,
          currency: 'USD',
          imageUrl: 'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
          images: [
            'https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800',
          ],
          description: 'Iconic white-washed villa with infinity pool and stunning caldera views.',
          amenities: ['WiFi', 'Private Pool', 'Sea View', 'Terrace', 'Kitchen'],
          category: 'beach',
          isFavorite: false,
          availableDates: [],
          coordinates: {
            latitude: 36.4618,
            longitude: 25.3753,
          },
        },
      ];
      setDestinations(mockDestinations);
    } catch (error) {
      console.error('Error loading destinations:', error);
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

  const filteredDestinations = useMemo(() => {
    return destinations.filter((dest) => {
      const matchesCategory = selectedCategory === 'all' || dest.category === selectedCategory;
      const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           dest.country.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [destinations, selectedCategory, searchQuery]);

  const toggleFavorite = async (destinationId: string) => {
    const isFavorite = favorites.has(destinationId);
    
    if (isFavorite) {
      await StorageService.removeFavorite(destinationId);
    } else {
      await StorageService.addFavorite(destinationId);
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

  return {
    destinations: filteredDestinations,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading,
    favorites,
    toggleFavorite,
    userLocation,
    refreshLocation: loadUserLocation,
  };
};
