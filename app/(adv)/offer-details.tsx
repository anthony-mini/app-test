import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    useColorScheme,
} from 'react-native';
import { Colors } from '../../constants/Colors';

export default function OfferDetailsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [travelers, setTravelers] = useState('1');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [email, setEmail] = useState('');

  const handleBackPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleBooking = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      '🎉 Booking Confirmed!',
      `Your New York trip for ${travelers} traveler(s) has been reserved!\n\nWe'll send confirmation details to ${email || 'your email'}.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header avec gradient */}
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#EC4899']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <View style={styles.backButtonInner}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </View>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Special Offer</Text>
        <View style={styles.headerRight} />
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image principale */}
        <View style={styles.imageSection}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9' }}
            style={styles.mainImage}
          />
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-50% OFF</Text>
          </View>
        </View>

        {/* Détails de l'offre */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <View style={styles.titleRow}>
            <Text style={styles.emoji}>✈️</Text>
            <View style={styles.titleContainer}>
              <Text style={[styles.offerTitle, { color: colors.text }]}>
                New York Special
              </Text>
              <Text style={[styles.offerSubtitle, { color: colors.textSecondary }]}>
                Round-trip flights • 7 days
              </Text>
            </View>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={[styles.originalPrice, { color: colors.textSecondary }]}>
                $1,200
              </Text>
              <Text style={[styles.currentPrice, { color: colors.primary }]}>
                $600
              </Text>
            </View>
            <View style={styles.savingsBadge}>
              <Text style={styles.savingsText}>Save $600</Text>
            </View>
          </View>
        </View>

        {/* Inclus dans l'offre */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What&apos;s Included
          </Text>
          {[
            { icon: 'airplane', text: 'Round-trip economy flights' },
            { icon: 'calendar', text: 'Flexible dates (valid 6 months)' },
            { icon: 'bag-check', text: '1 checked bag included' },
            { icon: 'wifi', text: 'Free in-flight WiFi' },
          ].map((item, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primary + '20' }]}>
                <Ionicons name={item.icon as any} size={20} color={colors.primary} />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>
                {item.text}
              </Text>
            </View>
          ))}
        </View>

        {/* Formulaire de réservation */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Book Your Trip
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Number of Travelers
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="people-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="1"
                placeholderTextColor={colors.textSecondary}
                value={travelers}
                onChangeText={setTravelers}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Departure Date
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.textSecondary}
                value={departureDate}
                onChangeText={setDepartureDate}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Return Date
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="MM/DD/YYYY"
                placeholderTextColor={colors.textSecondary}
                value={returnDate}
                onChangeText={setReturnDate}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>
              Email Address
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.background }]}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="your@email.com"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>
        </View>

        {/* Termes */}
        <View style={styles.termsSection}>
          <Text style={[styles.termsText, { color: colors.textSecondary }]}>
            * Offer valid until December 31, 2024. Subject to availability. Terms and conditions apply.
          </Text>
        </View>
      </ScrollView>

      {/* Bouton de réservation fixe */}
      <View style={[styles.footer, { backgroundColor: colors.card }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={[styles.footerLabel, { color: colors.textSecondary }]}>
              Total Price
            </Text>
            <Text style={[styles.footerPrice, { color: colors.primary }]}>
              ${600 * parseInt(travelers || '1')}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.bookButton, { backgroundColor: colors.primary }]}
            onPress={handleBooking}
          >
            <Text style={styles.bookButtonText}>Confirm Booking</Text>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
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
  },
  backButton: {
    width: 40,
    height: 40,
  },
  backButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
  },
  imageSection: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  discountBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  discountText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  section: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  offerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offerSubtitle: {
    fontSize: 14,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    marginBottom: 4,
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  savingsBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  savingsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  termsSection: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  termsText: {
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  footerLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  footerPrice: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
