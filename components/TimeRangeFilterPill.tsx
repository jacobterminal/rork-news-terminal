import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

export type TimeRange = 'last_hour' | 'today' | 'past_2_days' | 'past_5_days' | 'week_to_date' | 'custom';

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
  const [tempEndDate, setTempEndDate] = useState(customRange?.endDate || '');
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);

  const generatePast7Days = () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      dates.push({ label: `${month} ${day}`, value: `${date.getMonth() + 1}/${day}` });
    }
    return dates;
  };

  const past7Days = generatePast7Days();

  const getPillText = () => {
    if (selectedRange === 'custom' && customRange) {
      return `${customRange.startDate} – ${customRange.endDate}`;
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
        return 'Last Hour';
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
    
    const currentYear = new Date().getFullYear();
    const startParts = tempStartDate.split('/');
    const endParts = tempEndDate.split('/');
    
    if (startParts.length !== 2 || endParts.length !== 2) {
      setRangeError('Invalid date format');
      return;
    }
    
    const startDateTime = new Date(currentYear, parseInt(startParts[0]) - 1, parseInt(startParts[1]), 0, 0, 0);
    const endDateTime = new Date(currentYear, parseInt(endParts[0]) - 1, parseInt(endParts[1]), 23, 59, 59);
    const diffInDays = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24);
    
    if (diffInDays > 7) {
      setRangeError('Custom range limited to 7 days.');
      return;
    }
    
    if (diffInDays < 0) {
      setRangeError('End date must be after start date');
      return;
    }
    
    const formatDateLabel = (dateStr: string) => {
      const parts = dateStr.split('/');
      const date = new Date(currentYear, parseInt(parts[0]) - 1, parseInt(parts[1]));
      const month = date.toLocaleString('en-US', { month: 'short' });
      return `${month} ${parts[1]}`;
    };
    
    const newCustomRange: CustomTimeRange = {
      startDate: formatDateLabel(tempStartDate),
      startHour: '00',
      startMinute: '00',
      endDate: formatDateLabel(tempEndDate),
      endHour: '23',
      endMinute: '59',
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
          selectedRange !== 'last_hour' && styles.pillActive
        ]}
        onPress={() => setDropdownVisible(!dropdownVisible)}
      >
        <Text style={styles.pillText}>{getPillText()} ⌄</Text>
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
            <Text style={styles.modalTitle}>Custom Date Range</Text>
            <Text style={styles.modalSubtitle}>Select dates within the past 7 days</Text>
            
            {rangeError && (
              <View style={styles.errorTooltip}>
                <Text style={styles.errorText}>{rangeError}</Text>
              </View>
            )}
            
            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>Start Date</Text>
              <TouchableOpacity 
                style={styles.dateDropdownButton}
                onPress={() => setStartDatePickerVisible(!startDatePickerVisible)}
              >
                <Text style={styles.dateDropdownText}>
                  {tempStartDate ? past7Days.find(d => d.value === tempStartDate)?.label || tempStartDate : 'Select date'}
                </Text>
                <ChevronDown size={16} color="#FFFFFF" />
              </TouchableOpacity>
              
              {startDatePickerVisible && (
                <View style={styles.datePickerDropdown}>
                  {past7Days.map((date) => (
                    <TouchableOpacity
                      key={date.value}
                      style={[
                        styles.datePickerItem,
                        tempStartDate === date.value && styles.datePickerItemSelected
                      ]}
                      onPress={() => {
                        setTempStartDate(date.value);
                        setStartDatePickerVisible(false);
                        setRangeError(null);
                      }}
                    >
                      <Text style={[
                        styles.datePickerText,
                        tempStartDate === date.value && styles.datePickerTextSelected
                      ]}>
                        {date.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.timeSection}>
              <Text style={styles.timeLabel}>End Date</Text>
              <TouchableOpacity 
                style={styles.dateDropdownButton}
                onPress={() => setEndDatePickerVisible(!endDatePickerVisible)}
              >
                <Text style={styles.dateDropdownText}>
                  {tempEndDate ? past7Days.find(d => d.value === tempEndDate)?.label || tempEndDate : 'Select date'}
                </Text>
                <ChevronDown size={16} color="#FFFFFF" />
              </TouchableOpacity>
              
              {endDatePickerVisible && (
                <View style={styles.datePickerDropdown}>
                  {past7Days.map((date) => (
                    <TouchableOpacity
                      key={date.value}
                      style={[
                        styles.datePickerItem,
                        tempEndDate === date.value && styles.datePickerItemSelected
                      ]}
                      onPress={() => {
                        setTempEndDate(date.value);
                        setEndDatePickerVisible(false);
                        setRangeError(null);
                      }}
                    >
                      <Text style={[
                        styles.datePickerText,
                        tempEndDate === date.value && styles.datePickerTextSelected
                      ]}>
                        {date.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#FFD33D',
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillActive: {
    backgroundColor: 'rgba(255, 211, 61, 0.08)',
  },
  pillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500' as const,
    letterSpacing: 0.3,
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
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#FFD33D',
    borderRadius: 4,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    minWidth: 160,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500' as const,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#1E1E1E',
    marginVertical: 6,
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
  dateDropdownButton: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateDropdownText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  datePickerDropdown: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    marginTop: 8,
    maxHeight: 200,
  },
  datePickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  datePickerItemSelected: {
    backgroundColor: 'rgba(255, 211, 61, 0.15)',
  },
  datePickerText: {
    color: '#BBBBBB',
    fontSize: 14,
    fontWeight: '500' as const,
  },
  datePickerTextSelected: {
    color: '#FFD33D',
    fontWeight: '600' as const,
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
