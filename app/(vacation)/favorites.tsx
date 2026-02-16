import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Destination } from '../../models/Destination';
import { useDestinationViewModel } from '../../viewmodels/DestinationViewModel';

export default function FavoritesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { destinations, favorites, toggleFavorite, isLoading } = useDestinationViewModel();

  const favoriteDestinations = destinations.filter((dest) => favorites.has(dest.id));

  const handleBackPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFavoritePress = async (destinationId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(destinationId);
  };

  const renderFavoriteItem = ({ item }: { item: Destination }) => (
    <TouchableOpacity
      style={[styles.favoriteCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(vacation)/destination/${item.id}`)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.favoriteImage} />
      <View style={styles.favoriteInfo}>
        <View style={styles.favoriteHeader}>
          <Text style={[styles.favoriteName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <TouchableOpacity
            onPress={() => handleFavoritePress(item.id)}
            style={styles.favoriteButton}
          >
            <Ionicons name="heart" size={24} color="#EF4444" />
          </TouchableOpacity>
        </View>
        <View style={styles.favoriteLocation}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.favoriteLocationText, { color: colors.textSecondary }]}>
            {item.location}, {item.country}
          </Text>
        </View>
        <View style={styles.favoriteBottom}>
          <View style={styles.favoriteRating}>
            <Ionicons name="star" size={14} color="#FCD34D" />
            <Text style={[styles.favoriteRatingText, { color: colors.text }]}>
              {item.rating.toFixed(1)}
            </Text>
            <Text style={[styles.favoriteReviews, { color: colors.textSecondary }]}>
              ({item.reviewCount})
            </Text>
          </View>
          <Text style={[styles.favoritePrice, { color: colors.primary }]}>
            ${item.price}/night
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="heart-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Favorites Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Start adding destinations to your favorites by tapping the heart icon
      </Text>
      <TouchableOpacity
        style={[styles.exploreButton, { backgroundColor: colors.primary }]}
        onPress={() => router.push('/(vacation)/home')}
      >
        <Text style={styles.exploreButtonText}>Explore Destinations</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Favorites</Text>
        <View style={styles.headerRight} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={favoriteDestinations}
          renderItem={renderFavoriteItem}
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
  },
  favoriteCard: {
    flexDirection: 'row',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  favoriteImage: {
    width: 120,
    height: 120,
  },
  favoriteInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  favoriteLocationText: {
    fontSize: 13,
    marginLeft: 4,
  },
  favoriteBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  favoriteRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  favoriteRatingText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  favoriteReviews: {
    fontSize: 12,
    marginLeft: 4,
  },
  favoritePrice: {
    fontSize: 16,
    fontWeight: 'bold',
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
