import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Colors } from '../../../constants/Colors';
import { Host } from '../../../models/Host';
import DatabaseService from '../../../services/DatabaseService';
import { useBookingViewModel } from '../../../viewmodels/BookingViewModel';
import { useDestinationViewModel } from '../../../viewmodels/DestinationViewModel';

const { height } = Dimensions.get('window');

export default function DestinationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { destinations, toggleFavorite, favorites } = useDestinationViewModel();
  const { createBooking } = useBookingViewModel();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [host, setHost] = useState<Host | null>(null);

  const destination = destinations.find((d) => d.id === id);

  useEffect(() => {
    if (destination) {
      DatabaseService.getHostByDestinationId(destination.id).then(setHost);
    }
  }, [destination]);

  if (!destination) {
    return (
      <View style={styles.container}>
        <Text>Destination not found</Text>
      </View>
    );
  }

  const handleBookNow = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const success = await createBooking({
      destinationId: destination.id,
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      guests: 2,
    });

    if (success) {
      router.push('/(vacation)/booking-confirmation');
    }
  };

  const handleFavoriteToggle = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(destination.id);
  };

  const handleBackPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleChatPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/(chat)/${destination.id}` as any);
  };

  const renderImageItem = ({ item, index }: { item: string; index: number }) => (
    <TouchableOpacity onPress={() => setSelectedImageIndex(index)}>
      <Image
        source={{ uri: item }}
        style={[
          styles.thumbnailImage,
          selectedImageIndex === index && styles.thumbnailImageActive,
        ]}
      />
    </TouchableOpacity>
  );

  const renderAmenityItem = ({ item }: { item: string }) => (
    <View style={styles.amenityChip}>
      <Ionicons name="checkmark-circle" size={16} color="#10B981" />
      <Text style={styles.amenityText}>{item}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: destination.images[selectedImageIndex] || destination.imageUrl }}
            style={styles.mainImage}
          />
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.favoriteButtonDetail}
            onPress={handleFavoriteToggle}
          >
            <Ionicons
              name={favorites.has(destination.id) ? 'heart' : 'heart-outline'}
              size={24}
              color={favorites.has(destination.id) ? '#FF6B6B' : '#fff'}
            />
          </TouchableOpacity>
        </View>

        {destination.images.length > 1 && (
          <FlatList
            data={destination.images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => index.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          />
        )}

        <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
          <View style={styles.headerSection}>
            <View style={styles.titleContainer}>
              <Text style={[styles.destinationTitle, { color: colors.text }]}>{destination.name}</Text>
              <View style={styles.locationContainer}>
                <Ionicons name="location" size={16} color="#6366F1" />
                <Text style={[styles.locationDetail, { color: colors.textSecondary }]}>
                  {destination.location}, {destination.country}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.ratingBox}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: '/(vacation)/reviews',
                  params: {
                    destinationId: destination.id,
                    destinationName: destination.name,
                  },
                });
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingLarge}>{destination.rating}</Text>
              <Text style={styles.reviewCount}>({destination.reviewCount})</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>{destination.description}</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Amenities</Text>
            <FlatList
              data={destination.amenities}
              renderItem={renderAmenityItem}
              keyExtractor={(item) => item}
              numColumns={2}
              scrollEnabled={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Location</Text>
            <View style={styles.mapContainer}>
              <MapView
                style={styles.map}
                provider={PROVIDER_GOOGLE}
                initialRegion={{
                  latitude: destination.coordinates.latitude,
                  longitude: destination.coordinates.longitude,
                  latitudeDelta: 0.0922,
                  longitudeDelta: 0.0421,
                }}
                scrollEnabled={true}
                zoomEnabled={true}
              >
                <Marker
                  coordinate={{
                    latitude: destination.coordinates.latitude,
                    longitude: destination.coordinates.longitude,
                  }}
                  title={destination.name}
                  description={`${destination.location}, ${destination.country}`}
                />
              </MapView>
              <TouchableOpacity 
                style={styles.mapOverlay}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <Ionicons name="navigate" size={20} color="#6366F1" />
                <Text style={styles.mapOverlayText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </View>

          {host && (
            <View style={styles.hostSection}>
              <Image
                source={{ uri: host.avatar }}
                style={styles.hostImage}
              />
              <View style={styles.hostInfo}>
                <Text style={styles.hostName}>Hébergé par {host.firstName} {host.lastName}</Text>
                <Text style={styles.hostDetails}>Hôte expérimenté</Text>
              </View>
              <TouchableOpacity style={styles.contactButton} onPress={handleChatPress}>
                <Ionicons name="chatbubble-outline" size={20} color="#6366F1" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Price</Text>
          <Text style={styles.priceAmount}>
            ${destination.price}
            <Text style={styles.priceUnit}> /night</Text>
          </Text>
        </View>
        <TouchableOpacity style={styles.bookButton} onPress={handleBookNow}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    width: '100%',
    height: height * 0.4,
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonDetail: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailList: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  thumbnailImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    opacity: 0.6,
  },
  thumbnailImageActive: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  contentContainer: {
    padding: 20,
  },
  headerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
  },
  destinationTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationDetail: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  ratingLarge: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    width: '48%',
  },
  amenityText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 8,
  },
  mapContainer: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapOverlayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
    marginLeft: 6,
  },
  hostSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 16,
    marginBottom: 80,
  },
  hostImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  hostInfo: {
    flex: 1,
    marginLeft: 12,
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  hostDetails: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  contactButton: {
    width: 40,
    height: 40,
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  priceUnit: {
    fontSize: 14,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  bookButton: {
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
