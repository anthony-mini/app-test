export interface SearchFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  amenities?: string[];
  sortBy?: 'rating' | 'price_asc' | 'price_desc' | 'name';
}

export const DEFAULT_FILTERS: SearchFilters = {
  category: 'all',
  minPrice: 0,
  maxPrice: 1000,
  minRating: 0,
  amenities: [],
  sortBy: 'rating',
};

export const AVAILABLE_AMENITIES = [
  'WiFi',
  'Pool',
  'Beach Access',
  'Restaurant',
  'Spa',
  'Bar',
  'Water Sports',
  'Gym',
  'Fireplace',
  'Ski Storage',
  'Hot Tub',
  'Mountain View',
  'Hiking Trails',
  'City View',
  'Concierge',
  'Business Center',
  'Rooftop',
  'Garden',
  'Terrace',
  'Kitchen',
  'BBQ',
  'Wine Cellar',
  'Bike Rental',
];
