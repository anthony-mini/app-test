import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors } from '../constants/Colors';
import { AVAILABLE_AMENITIES, SearchFilters as ISearchFilters } from '../models/SearchFilters';

interface SearchFiltersProps {
  visible: boolean;
  onClose: () => void;
  filters: ISearchFilters;
  onApply: (filters: Partial<ISearchFilters>) => void;
  onReset: () => void;
}

export default function SearchFilters({
  visible,
  onClose,
  filters,
  onApply,
  onReset,
}: SearchFiltersProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [localFilters, setLocalFilters] = useState<ISearchFilters>(filters);

  const handleApply = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(localFilters);
    onClose();
  };

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onReset();
    onClose();
  };

  const toggleAmenity = async (amenity: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalFilters((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
    }));
  };

  const sortOptions = [
    { value: 'rating', label: 'Top Rated', icon: 'star' },
    { value: 'price_asc', label: 'Price: Low to High', icon: 'arrow-up' },
    { value: 'price_desc', label: 'Price: High to Low', icon: 'arrow-down' },
    { value: 'name', label: 'Name A-Z', icon: 'text' },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>Filters</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Prix */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Price Range: ${localFilters.minPrice} - ${localFilters.maxPrice}
              </Text>
              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderLabel, { color: colors.text }]}>Min</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1000}
                  step={50}
                  value={localFilters.minPrice || 0}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, minPrice: value }))
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                />
              </View>
              <View style={styles.sliderContainer}>
                <Text style={[styles.sliderLabel, { color: colors.text }]}>Max</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={1000}
                  step={50}
                  value={localFilters.maxPrice || 1000}
                  onValueChange={(value) =>
                    setLocalFilters((prev) => ({ ...prev, maxPrice: value }))
                  }
                  minimumTrackTintColor={colors.primary}
                  maximumTrackTintColor={colors.border}
                />
              </View>
            </View>

            {/* Rating */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Minimum Rating: {localFilters.minRating?.toFixed(1) || '0.0'}
              </Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={5}
                step={0.5}
                value={localFilters.minRating || 0}
                onValueChange={(value) =>
                  setLocalFilters((prev) => ({ ...prev, minRating: value }))
                }
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
              />
            </View>

            {/* Sort */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Sort By</Text>
              <View style={styles.sortOptions}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.sortOption,
                      { backgroundColor: colors.card },
                      localFilters.sortBy === option.value && {
                        backgroundColor: colors.primary,
                      },
                    ]}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setLocalFilters((prev) => ({ ...prev, sortBy: option.value as any }));
                    }}
                  >
                    <Ionicons
                      name={option.icon as any}
                      size={20}
                      color={
                        localFilters.sortBy === option.value ? '#fff' : colors.text
                      }
                    />
                    <Text
                      style={[
                        styles.sortOptionText,
                        { color: colors.text },
                        localFilters.sortBy === option.value && { color: '#fff' },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Amenities */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Amenities</Text>
              <View style={styles.amenitiesGrid}>
                {AVAILABLE_AMENITIES.map((amenity) => (
                  <TouchableOpacity
                    key={amenity}
                    style={[
                      styles.amenityChip,
                      { backgroundColor: colors.card, borderColor: colors.border },
                      localFilters.amenities?.includes(amenity) && {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => toggleAmenity(amenity)}
                  >
                    <Text
                      style={[
                        styles.amenityText,
                        { color: colors.text },
                        localFilters.amenities?.includes(amenity) && { color: '#fff' },
                      ]}
                    >
                      {amenity}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border }]}
              onPress={handleReset}
            >
              <Text style={[styles.resetButtonText, { color: colors.text }]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderLabel: {
    width: 40,
    fontSize: 14,
  },
  slider: {
    flex: 1,
  },
  sortOptions: {
    gap: 10,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  amenityChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  amenityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  resetButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
