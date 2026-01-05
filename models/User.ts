export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  favoriteDestinations: string[];
  bookings: string[];
  joinedDate: Date;
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}
