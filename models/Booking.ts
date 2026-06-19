export interface Booking {
  id: string;
  destinationId: string;
  userId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: Date;
}

export interface BookingRequest {
  destinationId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  pricePerNight?: number;
}
