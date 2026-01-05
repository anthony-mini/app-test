import { useState } from 'react';
import { Booking, BookingRequest } from '../models/Booking';

export const useBookingViewModel = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const createBooking = async (request: BookingRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const newBooking: Booking = {
        id: Date.now().toString(),
        destinationId: request.destinationId,
        userId: 'user-1',
        checkInDate: request.checkInDate,
        checkOutDate: request.checkOutDate,
        guests: request.guests,
        totalPrice: calculateTotalPrice(request),
        status: 'pending',
        createdAt: new Date(),
      };
      
      setBookings((prev) => [...prev, newBooking]);
      return true;
    } catch {
      setError('Failed to create booking');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPrice = (request: BookingRequest): number => {
    const days = Math.ceil(
      (request.checkOutDate.getTime() - request.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return days * 150;
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      setBookings((prev) =>
        prev.map((booking) =>
          booking.id === bookingId ? { ...booking, status: 'cancelled' } : booking
        )
      );
      return true;
    } catch {
      setError('Failed to cancel booking');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    bookings,
    isLoading,
    error,
    createBooking,
    cancelBooking,
  };
};
