import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import SearchFilters from '../../components/SearchFilters';
import { Colors } from '../../constants/Colors';
import { Destination } from '../../models/Destination';
import { useDestinationViewModel } from '../../viewmodels/DestinationViewModel';

export default function AllDestinationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    destinations,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    resetFilters,
    toggleFavorite,
    favorites,
    isLoading,
  } = useDestinationViewModel();

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const handleBackPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleFavoritePress = async (destinationId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(destinationId);
  };

  const renderDestinationItem = ({ item }: { item: Destination }) => (
    <TouchableOpacity
      style={[styles.destinationCard, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/(vacation)/destination/${item.id}`)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.destinationImage} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleFavoritePress(item.id)}
      >
        <Ionicons
          name={favorites.has(item.id) ? 'heart' : 'heart-outline'}
          size={24}
          color={favorites.has(item.id) ? '#EF4444' : '#fff'}
        />
      </TouchableOpacity>
      <View style={styles.destinationInfo}>
        <Text style={[styles.destinationName, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.destinationLocation}>
          <Ionicons name="location-outline" size={14} color={colors.textSecondary} />
          <Text style={[styles.destinationLocationText, { color: colors.textSecondary }]}>
            {item.location}, {item.country}
          </Text>
        </View>
        <View style={styles.destinationBottom}>
          <View style={styles.destinationRating}>
            <Ionicons name="star" size={14} color="#FCD34D" />
            <Text style={[styles.destinationRatingText, { color: colors.text }]}>
              {item.rating.toFixed(1)}
            </Text>
            <Text style={[styles.destinationReviews, { color: colors.textSecondary }]}>
              ({item.reviewCount})
            </Text>
          </View>
          <Text style={[styles.destinationPrice, { color: colors.primary }]}>
            ${item.price}/night
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search-outline" size={80} color={colors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Destinations Found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Try adjusting your search or filters
      </Text>
      <TouchableOpacity
        style={[styles.resetButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          setSearchQuery('');
          resetFilters();
        }}
      >
        <Text style={styles.resetButtonText}>Reset Search</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>All Destinations</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card }]}>
        <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search destinations..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isLoading && (
          <View style={styles.loadingIndicator}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>🔍</Text>
          </View>
        )}
        {searchQuery.length > 0 && !isLoading && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsFiltersOpen(true);
          }}
        >
          <Ionicons name="options-outline" size={20} color="#6366F1" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={destinations}
          renderItem={renderDestinationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={renderEmptyState}
          showsVerticalScrollIndicator={false}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
        />
      )}

      <SearchFilters
        visible={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={filters}
        onApply={updateFilters}
        onReset={resetFilters}
      />
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  loadingIndicator: {
    marginRight: 8,
  },
  clearButton: {
    marginRight: 8,
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  destinationCard: {
    width: '48%',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  destinationImage: {
    width: '100%',
    height: 140,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationInfo: {
    padding: 12,
  },
  destinationName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  destinationLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  destinationLocationText: {
    fontSize: 12,
    marginLeft: 4,
  },
  destinationBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationRatingText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  destinationReviews: {
    fontSize: 11,
    marginLeft: 4,
  },
  destinationPrice: {
    fontSize: 14,
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
  resetButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
