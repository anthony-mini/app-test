import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { Destination } from '../../models/Destination';
import DatabaseService from '../../services/DatabaseService';

export default function InteractiveMapScreen() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

  const initialRegion: Region = {
    latitude: 46.8182,
    longitude: 8.2275,
    latitudeDelta: 15,
    longitudeDelta: 15,
  };

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    setIsLoading(true);
    try {
      const allDestinations = await DatabaseService.getAllDestinations();
      setDestinations(allDestinations);
    } catch (error) {
      if (__DEV__) console.error('Error loading destinations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkerPress = useCallback((destination: Destination) => {
    setSelectedDestination(destination);
  }, []);

  const handleCardPress = useCallback(async () => {
    if (selectedDestination) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      router.push(`/(vacation)/destination/${selectedDestination.id}`);
    }
  }, [selectedDestination, router]);

  const handleCloseCard = useCallback(() => {
    setSelectedDestination(null);
  }, []);

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Carte Interactive',
          headerBackTitle: '',
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => router.back()} 
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Chargement de la carte...</Text>
          </View>
        ) : (
          <MapView
            style={styles.map}
            initialRegion={initialRegion}
            showsUserLocation
            showsMyLocationButton
            showsCompass
            showsScale
          >
            {destinations.map((destination) => (
              <Marker
                key={destination.id}
                coordinate={{
                  latitude: destination.coordinates.latitude,
                  longitude: destination.coordinates.longitude,
                }}
                title={destination.name}
                description={`${destination.location}, ${destination.country}`}
                onPress={() => handleMarkerPress(destination)}
              >
                <View style={styles.markerContainer}>
                  <View style={styles.marker}>
                    <Ionicons name="location" size={24} color="#6366F1" />
                  </View>
                  <View style={styles.markerPrice}>
                    <Text style={styles.markerPriceText}>${destination.price}</Text>
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {selectedDestination && (
          <View style={styles.cardContainer}>
            <TouchableOpacity
              style={styles.card}
              onPress={handleCardPress}
              activeOpacity={0.9}
            >
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCloseCard}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>

              <View style={styles.cardContent}>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{selectedDestination.name}</Text>
                  <View style={styles.cardLocation}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.cardLocationText}>
                      {selectedDestination.location}, {selectedDestination.country}
                    </Text>
                  </View>
                  <View style={styles.cardBottom}>
                    <View style={styles.cardRating}>
                      <Ionicons name="star" size={14} color="#FFD700" />
                      <Text style={styles.cardRatingText}>{selectedDestination.rating}</Text>
                    </View>
                    <Text style={styles.cardPrice}>${selectedDestination.price}/nuit</Text>
                  </View>
                </View>
                <View style={styles.cardAction}>
                  <Ionicons name="chevron-forward" size={20} color="#6366F1" />
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.statsContainer}>
          <View style={styles.statsBadge}>
            <Ionicons name="location" size={16} color="#6366F1" />
            <Text style={styles.statsText}>{destinations.length} destinations</Text>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  map: {
    flex: 1,
  },
  backButton: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  backButtonText: {
    fontSize: 28,
    color: '#007AFF',
    fontWeight: '400',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerPrice: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  markerPriceText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardContainer: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    paddingRight: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLocationText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardRatingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 4,
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6366F1',
  },
  cardAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    position: 'absolute',
    top: 16,
    left: 16,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 6,
  },
});
