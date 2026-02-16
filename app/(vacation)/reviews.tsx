import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import DatabaseService from '../../services/DatabaseService';

interface Review {
  id: string;
  destinationId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  comment: string;
  createdAt: number;
}

interface ReviewStats {
  total: number;
  average: number;
  distribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

export default function ReviewsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const destinationId = params.destinationId as string;
  const destinationName = params.destinationName as string;

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [destinationId, selectedRating]);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await DatabaseService.getReviewsByDestination(
        destinationId,
        selectedRating || undefined
      );
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await DatabaseService.getReviewStats(destinationId);
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleBackPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleRatingFilter = async (rating: number) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRating(selectedRating === rating ? null : rating);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={16}
            color={star <= rating ? '#FFA500' : colors.textSecondary}
          />
        ))}
      </View>
    );
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={[styles.reviewCard, { backgroundColor: colors.card }]}>
      <View style={styles.reviewHeader}>
        <Image
          source={{ uri: item.userAvatar }}
          style={styles.avatar}
          contentFit="cover"
        />
        <View style={styles.reviewHeaderText}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {item.userName}
          </Text>
          <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>
            {formatDate(item.createdAt)}
          </Text>
        </View>
        {renderStars(item.rating)}
      </View>
      <Text style={[styles.reviewComment, { color: colors.text }]}>
        {item.comment}
      </Text>
    </View>
  );

  const renderRatingFilter = (rating: number) => {
    const count = stats?.distribution[rating as keyof typeof stats.distribution] || 0;
    const isSelected = selectedRating === rating;

    return (
      <TouchableOpacity
        key={rating}
        style={[
          styles.filterChip,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        onPress={() => handleRatingFilter(rating)}
        activeOpacity={0.7}
      >
        <Ionicons
          name="star"
          size={14}
          color={isSelected ? '#fff' : '#FFA500'}
        />
        <Text
          style={[
            styles.filterText,
            { color: isSelected ? '#fff' : colors.text },
          ]}
        >
          {rating}
        </Text>
        <Text
          style={[
            styles.filterCount,
            { color: isSelected ? 'rgba(255,255,255,0.8)' : colors.textSecondary },
          ]}
        >
          ({count})
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Reviews</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {destinationName}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Stats */}
      {stats && (
        <View style={[styles.statsContainer, { backgroundColor: colors.card }]}>
          <View style={styles.statsLeft}>
            <Text style={[styles.averageRating, { color: colors.text }]}>
              {stats.average.toFixed(1)}
            </Text>
            {renderStars(Math.round(stats.average))}
            <Text style={[styles.totalReviews, { color: colors.textSecondary }]}>
              {stats.total} reviews
            </Text>
          </View>
          <View style={styles.statsRight}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribution[rating as keyof typeof stats.distribution];
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <View key={rating} style={styles.distributionRow}>
                  <Text style={[styles.distributionLabel, { color: colors.text }]}>
                    {rating}
                  </Text>
                  <Ionicons name="star" size={12} color="#FFA500" />
                  <View style={[styles.distributionBar, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.distributionFill,
                        { width: `${percentage}%`, backgroundColor: colors.primary },
                      ]}
                    />
                  </View>
                  <Text style={[styles.distributionCount, { color: colors.textSecondary }]}>
                    {count}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <Text style={[styles.filtersTitle, { color: colors.text }]}>Filter by rating</Text>
        <View style={styles.filtersRow}>
          {[5, 4, 3, 2, 1].map(renderRatingFilter)}
        </View>
      </View>

      {/* Reviews List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={reviews}
          renderItem={renderReviewItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="chatbubbles-outline" size={64} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No reviews found
              </Text>
            </View>
          }
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  headerRight: {
    width: 40,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statsLeft: {
    alignItems: 'center',
    paddingRight: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.1)',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: '700',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 8,
  },
  totalReviews: {
    fontSize: 13,
  },
  statsRight: {
    flex: 1,
    paddingLeft: 20,
    justifyContent: 'center',
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  distributionLabel: {
    fontSize: 13,
    fontWeight: '600',
    width: 12,
  },
  distributionBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  distributionFill: {
    height: '100%',
    borderRadius: 3,
  },
  distributionCount: {
    fontSize: 12,
    width: 30,
    textAlign: 'right',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filtersTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  filtersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterCount: {
    fontSize: 12,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  reviewCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  reviewHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: 12,
    marginTop: 2,
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
