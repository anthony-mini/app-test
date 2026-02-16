import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import FloppyButton from '../../components/FloppyButton';
import FloppyChat from '../../components/FloppyChat';
import SearchFilters from '../../components/SearchFilters';
import { Colors } from '../../constants/Colors';
import { Destination } from '../../models/Destination';
import { useDestinationViewModel } from '../../viewmodels/DestinationViewModel';
import { useUserProfileViewModel } from '../../viewmodels/UserProfileViewModel';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const {
    destinations,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    filters,
    updateFilters,
    resetFilters,
    toggleFavorite,
    favorites,
    userLocation,
    isLoading,
  } = useDestinationViewModel();

  const { profile } = useUserProfileViewModel();
  const [isFloppyOpen, setIsFloppyOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleCategoryPress = useCallback(async (categoryId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCategory(categoryId);
  }, [setSelectedCategory]);

  const handleFavoritePress = useCallback(async (destinationId: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(destinationId);
  }, [toggleFavorite]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Le ViewModel recharge automatiquement les données
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const renderCategoryItem = useCallback(({ item }: any) => (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        { backgroundColor: colors.card },
        selectedCategory === item.id && { backgroundColor: colors.primary },
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text
        style={[
          { fontSize: 14, fontWeight: '600', color: colors.text },
          selectedCategory === item.id && { color: '#fff' },
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  ), [colors.card, colors.primary, colors.text, selectedCategory, handleCategoryPress]);

  const renderDestinationCard = useCallback(({ item }: { item: Destination }) => (
    <TouchableOpacity
      style={styles.destinationCard}
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
          color={favorites.has(item.id) ? '#FF6B6B' : '#fff'}
        />
      </TouchableOpacity>
      <View style={styles.destinationInfo}>
        <Text style={styles.destinationName}>{item.name}</Text>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.locationText}>
            {item.location}, {item.country}
          </Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.ratingText}>{item.rating}</Text>
            <Text style={styles.reviewText}>({item.reviewCount})</Text>
          </View>
          <Text style={styles.priceText}>
            ${item.price}
            <Text style={styles.priceUnit}>/night</Text>
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [router, handleFavoritePress, favorites]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Hello, Traveler! 👋</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {userLocation ? `${userLocation.city || 'Your location'}` : 'Where do you want to go?'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.messageButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(vacation)/conversations');
            }}
          >
            <Ionicons name="chatbubbles-outline" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(vacation)/profile');
            }}
          >
            {profile.avatar ? (
              <Image
                source={{ uri: profile.avatar }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.profilePlaceholder, { backgroundColor: colors.primary }]}>
                <Ionicons name="person" size={24} color="#fff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
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

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <FlatList
            data={categories}
            renderItem={renderCategoryItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
            removeClippedSubviews
            maxToRenderPerBatch={5}
            initialNumToRender={5}
            windowSize={5}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Destinations</Text>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/(vacation)/all-destinations');
              }}
            >
              <Text style={styles.seeAllText}>See all</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={destinations}
            renderItem={renderDestinationCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.destinationsList}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            removeClippedSubviews
            maxToRenderPerBatch={3}
            initialNumToRender={2}
            windowSize={3}
            getItemLayout={(data, index) => ({
              length: CARD_WIDTH + 16,
              offset: (CARD_WIDTH + 16) * index,
              index,
            })}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          {destinations.slice(0, 2).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.recommendedCard}
              onPress={() => router.push(`/(vacation)/destination/${item.id}`)}
            >
              <Image source={{ uri: item.imageUrl }} style={styles.recommendedImage} />
              <View style={styles.recommendedInfo}>
                <Text style={styles.recommendedName}>{item.name}</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={12} color="#666" />
                  <Text style={styles.recommendedLocation}>
                    {item.location}, {item.country}
                  </Text>
                </View>
                <View style={styles.recommendedBottom}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={12} color="#FFD700" />
                    <Text style={styles.ratingText}>{item.rating}</Text>
                  </View>
                  <Text style={styles.priceText}>${item.price}/night</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <FloppyButton onPress={() => setIsFloppyOpen(true)} />
      <FloppyChat isOpen={isFloppyOpen} onClose={() => setIsFloppyOpen(false)} />
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profilePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 20,
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
    color: '#1F2937',
  },
  filterButton: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoryCardActive: {
    backgroundColor: '#6366F1',
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  categoryTextActive: {
    color: '#fff',
  },
  destinationsList: {
    paddingHorizontal: 20,
  },
  destinationCard: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 20,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  destinationImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  favoriteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destinationInfo: {
    padding: 16,
  },
  destinationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: 'normal',
    color: '#999',
  },
  recommendedCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  recommendedImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  recommendedInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  recommendedName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  recommendedLocation: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  recommendedBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  clearButton: {
    marginRight: 8,
  },
});
