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
} from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

interface DateRangePickerProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (startDate: string, endDate: string, nights: number) => void;
  pricePerNight: number;
  unavailableDates?: string[];
}

export default function DateRangePicker({
  visible,
  onClose,
  onConfirm,
  pricePerNight,
  unavailableDates = [],
}: DateRangePickerProps) {
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);

  const handleDayPress = async (day: DateData) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Si la date est indisponible, ne rien faire
    if (unavailableDates.includes(day.dateString)) {
      return;
    }

    if (!startDate || (startDate && endDate)) {
      // Premier clic ou reset
      setStartDate(day.dateString);
      setEndDate(null);
    } else if (startDate && !endDate) {
      // Deuxième clic
      if (day.dateString === startDate) {
        // Même jour : un séjour dure au moins une nuit, on ignore ce clic
        return;
      }
      if (day.dateString < startDate) {
        // Si la date est avant la date de début, inverser
        setEndDate(startDate);
        setStartDate(day.dateString);
      } else {
        setEndDate(day.dateString);
      }
    }
  };

  const handleReset = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setStartDate(null);
    setEndDate(null);
  };

  const handleConfirm = async () => {
    if (startDate && endDate) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      const nights = calculateNights(startDate, endDate);
      onConfirm(startDate, endDate, nights);
      setStartDate(null);
      setEndDate(null);
    }
  };

  const calculateNights = (start: string, end: string): number => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    return Math.ceil((endTime - startTime) / (1000 * 60 * 60 * 24));
  };

  const getMarkedDates = () => {
    const marked: any = {};

    // Marquer les dates indisponibles
    unavailableDates.forEach((date) => {
      marked[date] = {
        disabled: true,
        disableTouchEvent: true,
        color: '#F3F4F6',
        textColor: '#D1D5DB',
      };
    });

    if (startDate) {
      marked[startDate] = {
        startingDay: true,
        color: '#6366F1',
        textColor: '#FFF',
      };
    }

    if (endDate) {
      marked[endDate] = {
        endingDay: true,
        color: '#6366F1',
        textColor: '#FFF',
      };
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const current = new Date(start);
      current.setDate(current.getDate() + 1);

      while (current < end) {
        const dateString = current.toISOString().split('T')[0];
        marked[dateString] = {
          color: '#EEF2FF',
          textColor: '#6366F1',
        };
        current.setDate(current.getDate() + 1);
      }
    }

    return marked;
  };

  const totalPrice = startDate && endDate ? calculateNights(startDate, endDate) * pricePerNight : 0;
  const nights = startDate && endDate ? calculateNights(startDate, endDate) : 0;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Sélectionner les dates</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Calendar
              onDayPress={handleDayPress}
              markingType="period"
              markedDates={getMarkedDates()}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                selectedDayBackgroundColor: '#6366F1',
                todayTextColor: '#6366F1',
                arrowColor: '#6366F1',
                monthTextColor: '#111827',
                textMonthFontWeight: '700',
                textDayFontSize: 16,
                textMonthFontSize: 18,
              }}
            />

            {startDate && !endDate && (
              <View style={styles.infoBox}>
                <Ionicons name="information-circle-outline" size={20} color="#6366F1" />
                <Text style={styles.infoText}>
                  Sélectionnez la date de fin de votre séjour
                </Text>
              </View>
            )}

            {startDate && endDate && (
              <View style={styles.summaryContainer}>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                    <View style={styles.summaryTextContainer}>
                      <Text style={styles.summaryLabel}>Arrivée</Text>
                      <Text style={styles.summaryValue}>
                        {new Date(startDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.summaryItem}>
                    <Ionicons name="calendar-outline" size={20} color="#6366F1" />
                    <View style={styles.summaryTextContainer}>
                      <Text style={styles.summaryLabel}>Départ</Text>
                      <Text style={styles.summaryValue}>
                        {new Date(endDate).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.divider} />

                <View style={styles.priceBreakdown}>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>
                      ${pricePerNight} x {nights} {nights > 1 ? 'nuits' : 'nuit'}
                    </Text>
                    <Text style={styles.priceValue}>${totalPrice}</Text>
                  </View>
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>${totalPrice}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#6366F1' }]} />
                <Text style={styles.legendText}>Sélectionné</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#F3F4F6' }]} />
                <Text style={styles.legendText}>Indisponible</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {(startDate || endDate) && (
              <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
                <Text style={styles.resetButtonText}>Réinitialiser</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[
                styles.confirmButton,
                (!startDate || !endDate) && styles.confirmButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!startDate || !endDate}
            >
              <Text style={styles.confirmButtonText}>
                {startDate && endDate ? `Confirmer - $${totalPrice}` : 'Sélectionner les dates'}
              </Text>
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
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 34,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '500',
  },
  summaryContainer: {
    backgroundColor: '#F9FAFB',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  summaryTextContainer: {
    marginLeft: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  priceBreakdown: {
    gap: 12,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6366F1',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 13,
    color: '#6B7280',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 2,
    backgroundColor: '#6366F1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});
