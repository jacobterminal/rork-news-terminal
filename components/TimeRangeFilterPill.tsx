import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

export type TimeRange = 'all' | 'last_hour' | 'today' | 'past_2_days' | 'past_5_days' | 'week_to_date' | 'custom';

export interface CustomTimeRange {
  startDate: string;
  startHour: string;
  startMinute: string;
  endDate: string;
  endHour: string;
  endMinute: string;
}

interface TimeRangeFilterPillProps {
  selectedRange: TimeRange;
  customRange?: CustomTimeRange;
  onRangeChange: (range: TimeRange, customRange?: CustomTimeRange) => void;
}

export default function TimeRangeFilterPill({ 
  selectedRange, 
  customRange,
  onRangeChange 
}: TimeRangeFilterPillProps) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(customRange?.startDate || '');
  const [tempStartHour, setTempStartHour] = useState(customRange?.startHour || '09');
  const [tempStartMinute, setTempStartMinute] = useState(customRange?.startMinute || '30');
  const [tempEndDate, setTempEndDate] = useState(customRange?.endDate || '');
  const [tempEndHour, setTempEndHour] = useState(customRange?.endHour || '16');
  const [tempEndMinute, setTempEndMinute] = useState(customRange?.endMinute || '00');
  const [rangeError, setRangeError] = useState<string | null>(null);

  const getPillText = () => {
    if (selectedRange === 'custom' && customRange) {
      return `${customRange.startDate} ${customRange.startHour}:${customRange.startMinute} – ${customRange.endDate} ${customRange.endHour}:${customRange.endMinute}`;
    }
    switch (selectedRange) {
      case 'last_hour':
        return 'Last Hour';
      case 'today':
        return 'Today';
      case 'past_2_days':
        return 'Past 2 Days';
      case 'past_5_days':
        return 'Past 5 Days';
      case 'week_to_date':
        return 'Week-to-Date';
      default:
        return 'All Day';
    }
  };

  const handleRangeSelect = (range: TimeRange) => {
    if (range === 'custom') {
      setDropdownVisible(false);
      setModalVisible(true);
    } else {
      onRangeChange(range);
      setDropdownVisible(false);
    }
  };

  const handleCustomRangeApply = () => {
    if (!tempStartDate || !tempEndDate) {
      setRangeError('Please select both start and end dates');
      return;
    }
    
    const startDateTime = new Date(`${tempStartDate}T${tempStartHour.padStart(2, '0')}:${tempStartMinute.padStart(2, '0')}`);
    const endDateTime = new Date(`${tempEndDate}T${tempEndHour.padStart(2, '0')}:${tempEndMinute.padStart(2, '0')}`);
    const diffInDays = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffInDays > 7) {
      setRangeError('Range limit: one week maximum');
      return;
    }
    
    if (diffInDays < 0) {
      setRangeError('End date must be after start date');
      return;
    }
    
    const newCustomRange: CustomTimeRange = {
      startDate: tempStartDate,
      startHour: tempStartHour.padStart(2, '0'),
      startMinute: tempStartMinute.padStart(2, '0'),
      endDate: tempEndDate,
      endHour: tempEndHour.padStart(2, '0'),
      endMinute: tempEndMinute.padStart(2, '0'),
    };
    onRangeChange('custom', newCustomRange);
    setModalVisible(false);
    setRangeError(null);
  };

  return (
    <>
      <TouchableOpacity 
        style={[
          styles.pill,
          selectedRange !== 'all' && styles.pillActive
        ]}
        onPress={() => setDropdownVisible(!dropdownVisible)}
      >
        <Text style={styles.pillText}>{getPillText()}</Text>
        <ChevronDown size={12} color="#FFFFFF" style={styles.chevron} />
      </TouchableOpacity>

      {dropdownVisible && (
        <>
          <TouchableOpacity 
            style={styles.overlay}
            activeOpacity={1}
            onPress={() => setDropdownVisible(false)}
          />
          <View style={styles.dropdown}>
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleRangeSelect('last_hour')}
            >
              <Text style={styles.dropdownText}>Last Hour</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleRangeSelect('today')}
            >
              <Text style={styles.dropdownText}>Today</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleRangeSelect('past_2_days')}
            >
              <Text style={styles.dropdownText}>Past 2 Days</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleRangeSelect('past_5_days')}
            >
              <Text style={styles.dropdownText}>Past 5 Days</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleRangeSelect('week_to_date')}
            >
              <Text style={styles.dropdownText}>Week-to-Date</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={styles.dropdownItem}
              onPress={() => handleRangeSelect('custom')}
            >
              <Text style={styles.dropdownText}>Custom Range →</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <TouchableOpacity 
            style={styles.modalContent}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.modalTitle}>Custom Time Range</Text>
            <Text style={styles.modalSubtitle}>Maximum 7 days</Text>
            
            {rangeError && (
              <View style={styles.errorTooltip}>
                <Text style={styles.errorText}>{rangeError}</Text>
              </View>
            )}
            
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Start Date & Time</Text>
              <View style={styles.dateInputRow}>
                <TextInput
                  style={styles.dateInput}
                  value={tempStartDate}
                  onChangeText={(text) => {
                    setTempStartDate(text);
                    setRangeError(null);
                  }}
                  placeholder="MM/DD"
                  placeholderTextColor="#555555"
                  selectionColor="#FFD33D"
                  maxLength={5}
                />
                <TextInput
                  style={styles.timeInput}
                  value={tempStartHour}
                  onChangeText={(text) => {
                    const num = text.replace(/[^0-9]/g, '');
                    if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 23)) {
                      setTempStartHour(num);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor="#555555"
                  selectionColor="#FFD33D"
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={tempStartMinute}
                  onChangeText={(text) => {
                    const num = text.replace(/[^0-9]/g, '');
                    if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 59)) {
                      setTempStartMinute(num);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor="#555555"
                  selectionColor="#FFD33D"
                />
              </View>
            </View>

            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>End Date & Time</Text>
              <View style={styles.dateInputRow}>
                <TextInput
                  style={styles.dateInput}
                  value={tempEndDate}
                  onChangeText={(text) => {
                    setTempEndDate(text);
                    setRangeError(null);
                  }}
                  placeholder="MM/DD"
                  placeholderTextColor="#555555"
                  selectionColor="#FFD33D"
                  maxLength={5}
                />
                <TextInput
                  style={styles.timeInput}
                  value={tempEndHour}
                  onChangeText={(text) => {
                    const num = text.replace(/[^0-9]/g, '');
                    if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 23)) {
                      setTempEndHour(num);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="HH"
                  placeholderTextColor="#555555"
                  selectionColor="#FFD33D"
                />
                <Text style={styles.timeSeparator}>:</Text>
                <TextInput
                  style={styles.timeInput}
                  value={tempEndMinute}
                  onChangeText={(text) => {
                    const num = text.replace(/[^0-9]/g, '');
                    if (num === '' || (parseInt(num) >= 0 && parseInt(num) <= 59)) {
                      setTempEndMinute(num);
                    }
                  }}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="MM"
                  placeholderTextColor="#555555"
                  selectionColor="#FFD33D"
                />
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.applyButton}
                onPress={handleCustomRangeApply}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#FFD33D',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 4,
  },
  pillActive: {
    borderColor: '#FFE066',
    shadowColor: '#FFD33D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  chevron: {
    marginLeft: 2,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: 32,
    right: 16,
    backgroundColor: 'rgba(26, 26, 26, 0.98)',
    borderWidth: 1,
    borderColor: '#FFD33D',
    borderRadius: 8,
    minWidth: 160,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500' as const,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#FFD33D',
    borderRadius: 12,
    padding: 24,
    width: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '500' as const,
    marginBottom: 16,
    textAlign: 'center',
  },
  errorTooltip: {
    backgroundColor: '#2A1A1A',
    borderWidth: 1,
    borderColor: '#FF4444',
    borderRadius: 6,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6666',
    fontSize: 11,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  timeSection: {
    marginBottom: 16,
  },
  timeLabel: {
    color: '#A0A0A0',
    fontSize: 12,
    fontWeight: '600' as const,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInput: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
    textAlign: 'center',
    width: 70,
    paddingVertical: 10,
  },
  timeInput: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600' as const,
    textAlign: 'center',
    width: 60,
    paddingVertical: 10,
  },
  timeSeparator: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700' as const,
    marginHorizontal: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#A0A0A0',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FFD33D',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '700' as const,
  },
});
