import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Booking } from '../../models/Booking';
import DatabaseService from '../../services/DatabaseService';
import { useBookingViewModel } from '../../viewmodels/BookingViewModel';

const STATUS_COLORS: Record<Booking['status'], string> = {
  pending: '#F59E0B',
  confirmed: '#10B981',
  cancelled: '#EF4444',
  completed: '#6366F1',
};

const STATUS_LABELS: Record<Booking['status'], string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  completed: 'Terminée',
};

export default function BookingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  const { bookings, isLoading, cancelBooking, deleteBooking } = useBookingViewModel();
  const [destinationNames, setDestinationNames] = useState<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    DatabaseService.getAllDestinations()
      .then((destinations) => {
        if (!mounted) return;
        const map: Record<string, string> = {};
        destinations.forEach((dest) => {
          map[dest.id] = dest.name;
        });
        setDestinationNames(map);
      })
      .catch((error) => {
        if (__DEV__) console.error('Error loading destination names:', error);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const handleBackPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCancel = async (bookingId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const ok = await cancelBooking(bookingId);
    if (!ok) {
      Alert.alert('Erreur', "L'annulation de la réservation a échoué. Veuillez réessayer.");
    }
  };

  const handleDelete = (bookingId: string) => {
    Alert.alert(
      'Supprimer la réservation',
      'Êtes-vous sûr de vouloir supprimer cette réservation ? Cette action est irréversible.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            const ok = await deleteBooking(bookingId);
            if (!ok) {
              Alert.alert('Erreur', 'La suppression de la réservation a échoué. Veuillez réessayer.');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date): string =>
    date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

  const renderBookingItem = ({ item }: { item: Booking }) => {
    const statusColor = STATUS_COLORS[item.status];
    const isCancelled = item.status === 'cancelled';

    return (
      <View style={[styles.bookingCard, { backgroundColor: colors.card }]}>
        <View style={styles.bookingHeader}>
          <Text style={[styles.bookingName, { color: colors.text }]} numberOfLines={1}>
            {destinationNames[item.destinationId] ?? item.destinationId}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: `${statusColor}1A` }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {STATUS_LABELS[item.status]}
            </Text>
          </View>
        </View>

        <View style={styles.bookingRow}>
          <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.bookingRowText, { color: colors.textSecondary }]}>
            {formatDate(item.checkInDate)} - {formatDate(item.checkOutDate)}
          </Text>
        </View>

        <View style={styles.bookingRow}>
          <Ionicons name="people-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.bookingRowText, { color: colors.textSecondary }]}>
            {item.guests} {item.guests > 1 ? 'invités' : 'invité'}
          </Text>
        </View>

        <View style={styles.bookingFooter}>
          <Text style={[styles.bookingPrice, { color: colors.primary }]}>
            ${item.totalPrice}
          </Text>
          <View style={styles.actions}>
            {!isCancelled && (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.border }]}
                onPress={() => handleCancel(item.id)}
              >
                <Ionicons name="close-circle-outline" size={18} color={colors.text} />
                <Text style={[styles.actionText, { color: colors.text }]}>Annuler</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.error }]}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color={colors.error} />
              <Text style={[styles.actionText, { color: colors.error }]}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Aucune réservation</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Vous n&apos;avez pas encore de réservation. Explorez nos destinations pour réserver votre prochain séjour.
      </Text>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(vacation)/home')}
      >
        <Text style={styles.exploreButtonText}>Explorer les destinations</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mes réservations</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading && bookings.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBookingItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
    flexGrow: 1,
  },
  bookingCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bookingRowText: {
    fontSize: 14,
    marginLeft: 8,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  bookingPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  exploreButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
