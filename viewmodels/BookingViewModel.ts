import { useEffect, useState } from 'react';
import { Booking, BookingRequest } from '../models/Booking';
import DatabaseService from '../services/DatabaseService';

const DEFAULT_PRICE_PER_NIGHT = 150;

export const useBookingViewModel = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await DatabaseService.getBookings();
      setBookings(data);
    } catch {
      setError('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotalPrice = (request: BookingRequest): number => {
    const nights = Math.ceil(
      (request.checkOutDate.getTime() - request.checkInDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const pricePerNight = request.pricePerNight ?? DEFAULT_PRICE_PER_NIGHT;
    return nights * pricePerNight;
  };

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
        status: 'confirmed',
        createdAt: new Date(),
      };

      await DatabaseService.createBooking(newBooking);
      setBookings((prev) => [newBooking, ...prev]);
      return true;
    } catch {
      setError('Failed to create booking');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await DatabaseService.updateBookingStatus(bookingId, 'cancelled');
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

  const deleteBooking = async (bookingId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await DatabaseService.deleteBooking(bookingId);
      setBookings((prev) => prev.filter((booking) => booking.id !== bookingId));
      return true;
    } catch {
      setError('Failed to delete booking');
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
    deleteBooking,
  };
};
