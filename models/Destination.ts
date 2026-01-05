export interface Destination {
  id: string;
  name: string;
  location: string;
  country: string;
  rating: number;
  reviewCount: number;
  price: number;
  currency: string;
  imageUrl: string;
  images: string[];
  description: string;
  amenities: string[];
  category: 'beach' | 'mountain' | 'city' | 'countryside';
  isFavorite: boolean;
  availableDates: Date[];
}

export interface DestinationCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}
