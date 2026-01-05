export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  favoriteDestinations: string[];
  bookings: string[];
}
