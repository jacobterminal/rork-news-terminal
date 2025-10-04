import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Animated, PanResponder } from 'react-native';
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
  const [tempStartHour, setTempStartHour] = useState(customRange?.startHour || '00');
  const [tempStartMinute, setTempStartMinute] = useState(customRange?.startMinute || '00');
  const [tempEndHour, setTempEndHour] = useState(customRange?.endHour || '23');
  const [tempEndMinute, setTempEndMinute] = useState(customRange?.endMinute || '59');
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [endTimePickerVisible, setEndTimePickerVisible] = useState(false);
  const [startTimeScrollMode, setStartTimeScrollMode] = useState(false);
  const [endTimeScrollMode, setEndTimeScrollMode] = useState(false);
  const startTimeHoldTimer = useRef<NodeJS.Timeout | null>(null);
  const endTimeHoldTimer = useRef<NodeJS.Timeout | null>(null);
  const startTimeScrollY = useRef(0);
  const endTimeScrollY = useRef(0);
  const startTimeGlowAnim = useRef(new Animated.Value(0)).current;
  const endTimeGlowAnim = useRef(new Animated.Value(0)).current;

  const generatePast7Days = () => {
    const dates = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const month = date.toLocaleString('en-US', { month: 'short' });
      const day = date.getDate();
      dates.push({ label: `${month} ${day}`, value: `${date.getMonth() + 1}/${day}`, dateObj: date });
    }
    return dates;
  };

  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const hourStr = hour.toString().padStart(2, '0');
        const minuteStr = minute.toString().padStart(2, '0');
        times.push({ label: `${hourStr}:${minuteStr}`, hour: hourStr, minute: minuteStr });
      }
    }
    return times;
  };

  const timeToMinutes = (hour: string, minute: string): number => {
    return parseInt(hour) * 60 + parseInt(minute);
  };

  const minutesToTime = (totalMinutes: number): { hour: string; minute: string } => {
    const clampedMinutes = Math.max(0, Math.min(1439, totalMinutes));
    const hour = Math.floor(clampedMinutes / 60);
    const minute = Math.floor((clampedMinutes % 60) / 15) * 15;
    return {
      hour: hour.toString().padStart(2, '0'),
      minute: minute.toString().padStart(2, '0')
    };
  };

  const adjustTime = (currentHour: string, currentMinute: string, deltaY: number): { hour: string; minute: string } => {
    const currentMinutes = timeToMinutes(currentHour, currentMinute);
    const scrollSensitivity = 40;
    const minuteChange = Math.round(deltaY / scrollSensitivity) * 15;
    const newMinutes = currentMinutes - minuteChange;
    return minutesToTime(newMinutes);
  };

  const validateEndTime = (startH: string, startM: string, endH: string, endM: string, isSameDay: boolean): { hour: string; minute: string } => {
    if (!isSameDay) return { hour: endH, minute: endM };
    
    const startMinutes = timeToMinutes(startH, startM);
    const endMinutes = timeToMinutes(endH, endM);
    
    if (endMinutes <= startMinutes) {
      const adjustedMinutes = startMinutes + 15;
      return minutesToTime(adjustedMinutes);
    }
    
    return { hour: endH, minute: endM };
  };

  const past7Days = generatePast7Days();
  const timeOptions = generateTimeOptions();

  const startTimePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => startTimeScrollMode,
      onPanResponderGrant: () => {
        startTimeScrollY.current = 0;
        startTimeHoldTimer.current = setTimeout(() => {
          setStartTimeScrollMode(true);
          Animated.timing(startTimeGlowAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }).start();
        }, 100);
      },
      onPanResponderMove: (_, gestureState) => {
        if (startTimeScrollMode) {
          const deltaY = gestureState.dy - startTimeScrollY.current;
          startTimeScrollY.current = gestureState.dy;
          
          const newTime = adjustTime(tempStartHour, tempStartMinute, deltaY);
          setTempStartHour(newTime.hour);
          setTempStartMinute(newTime.minute);
          setRangeError(null);
        }
      },
      onPanResponderRelease: () => {
        if (startTimeHoldTimer.current) {
          clearTimeout(startTimeHoldTimer.current);
          startTimeHoldTimer.current = null;
        }
        if (startTimeScrollMode) {
          setStartTimeScrollMode(false);
          Animated.timing(startTimeGlowAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
          }).start();
        } else {
          setStartTimePickerVisible(!startTimePickerVisible);
        }
      },
      onPanResponderTerminate: () => {
        if (startTimeHoldTimer.current) {
          clearTimeout(startTimeHoldTimer.current);
          startTimeHoldTimer.current = null;
        }
        setStartTimeScrollMode(false);
        Animated.timing(startTimeGlowAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const endTimePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => endTimeScrollMode,
      onPanResponderGrant: () => {
        endTimeScrollY.current = 0;
        endTimeHoldTimer.current = setTimeout(() => {
          setEndTimeScrollMode(true);
          Animated.timing(endTimeGlowAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: false,
          }).start();
        }, 100);
      },
      onPanResponderMove: (_, gestureState) => {
        if (endTimeScrollMode) {
          const deltaY = gestureState.dy - endTimeScrollY.current;
          endTimeScrollY.current = gestureState.dy;
          
          const newTime = adjustTime(tempEndHour, tempEndMinute, deltaY);
          const isSameDay = tempStartDate === tempEndDate;
          const validatedTime = validateEndTime(tempStartHour, tempStartMinute, newTime.hour, newTime.minute, isSameDay);
          
          setTempEndHour(validatedTime.hour);
          setTempEndMinute(validatedTime.minute);
          setRangeError(null);
        }
      },
      onPanResponderRelease: () => {
        if (endTimeHoldTimer.current) {
          clearTimeout(endTimeHoldTimer.current);
          endTimeHoldTimer.current = null;
        }
        if (endTimeScrollMode) {
          setEndTimeScrollMode(false);
          Animated.timing(endTimeGlowAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: false,
          }).start();
        } else {
          setEndTimePickerVisible(!endTimePickerVisible);
        }
      },
      onPanResponderTerminate: () => {
        if (endTimeHoldTimer.current) {
          clearTimeout(endTimeHoldTimer.current);
          endTimeHoldTimer.current = null;
        }
        setEndTimeScrollMode(false);
        Animated.timing(endTimeGlowAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

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
    
    const startDateTime = new Date(
      currentYear, 
      parseInt(startParts[0]) - 1, 
      parseInt(startParts[1]), 
      parseInt(tempStartHour), 
      parseInt(tempStartMinute)
    );
    const endDateTime = new Date(
      currentYear, 
      parseInt(endParts[0]) - 1, 
      parseInt(endParts[1]), 
      parseInt(tempEndHour), 
      parseInt(tempEndMinute)
    );
    
    const diffInMs = endDateTime.getTime() - startDateTime.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
    if (diffInDays > 7) {
      setRangeError('Custom range limited to 7 days.');
      return;
    }
    
    if (diffInMs < 0) {
      setRangeError('End date/time must be after start date/time');
      return;
    }
    
    if (tempStartDate === tempEndDate) {
      const startTimeInMinutes = parseInt(tempStartHour) * 60 + parseInt(tempStartMinute);
      const endTimeInMinutes = parseInt(tempEndHour) * 60 + parseInt(tempEndMinute);
      
      if (endTimeInMinutes <= startTimeInMinutes) {
        const newEndHour = (parseInt(tempStartHour) + 1) % 24;
        setTempEndHour(newEndHour.toString().padStart(2, '0'));
        setTempEndMinute(tempStartMinute);
        setRangeError('End time adjusted to 1 hour after start time');
        return;
      }
    }
    
    const formatDateLabel = (dateStr: string) => {
      const parts = dateStr.split('/');
      const date = new Date(currentYear, parseInt(parts[0]) - 1, parseInt(parts[1]));
      const month = date.toLocaleString('en-US', { month: 'short' });
      return `${month} ${parts[1]}`;
    };
    
    const newCustomRange: CustomTimeRange = {
      startDate: formatDateLabel(tempStartDate),
      startHour: tempStartHour,
      startMinute: tempStartMinute,
      endDate: formatDateLabel(tempEndDate),
      endHour: tempEndHour,
      endMinute: tempEndMinute,
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
              style={[
                styles.dropdownItem,
                selectedRange === 'last_hour' && styles.dropdownItemSelected
              ]}
              onPress={() => handleRangeSelect('last_hour')}
            >
              <Text style={[
                styles.dropdownText,
                selectedRange !== 'last_hour' && styles.dropdownTextHover
              ]}>Last Hour</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={[
                styles.dropdownItem,
                selectedRange === 'today' && styles.dropdownItemSelected
              ]}
              onPress={() => handleRangeSelect('today')}
            >
              <Text style={[
                styles.dropdownText,
                selectedRange !== 'today' && styles.dropdownTextHover
              ]}>Today</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={[
                styles.dropdownItem,
                selectedRange === 'past_2_days' && styles.dropdownItemSelected
              ]}
              onPress={() => handleRangeSelect('past_2_days')}
            >
              <Text style={[
                styles.dropdownText,
                selectedRange !== 'past_2_days' && styles.dropdownTextHover
              ]}>Past 2 Days</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={[
                styles.dropdownItem,
                selectedRange === 'past_5_days' && styles.dropdownItemSelected
              ]}
              onPress={() => handleRangeSelect('past_5_days')}
            >
              <Text style={[
                styles.dropdownText,
                selectedRange !== 'past_5_days' && styles.dropdownTextHover
              ]}>Past 5 Days</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={[
                styles.dropdownItem,
                selectedRange === 'week_to_date' && styles.dropdownItemSelected
              ]}
              onPress={() => handleRangeSelect('week_to_date')}
            >
              <Text style={[
                styles.dropdownText,
                selectedRange !== 'week_to_date' && styles.dropdownTextHover
              ]}>Week-to-Date</Text>
            </TouchableOpacity>
            <View style={styles.dropdownDivider} />
            <TouchableOpacity 
              style={[
                styles.dropdownItem,
                selectedRange === 'custom' && styles.dropdownItemSelected
              ]}
              onPress={() => handleRangeSelect('custom')}
            >
              <Text style={[
                styles.dropdownText,
                selectedRange !== 'custom' && styles.dropdownTextHover
              ]}>Custom Range ▾</Text>
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
                        
                        if (tempEndDate) {
                          const currentYear = new Date().getFullYear();
                          const startParts = date.value.split('/');
                          const endParts = tempEndDate.split('/');
                          const startDate = new Date(currentYear, parseInt(startParts[0]) - 1, parseInt(startParts[1]));
                          const endDate = new Date(currentYear, parseInt(endParts[0]) - 1, parseInt(endParts[1]));
                          
                          if (startDate > endDate) {
                            setTempEndDate(date.value);
                          }
                        }
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
                  {past7Days.map((date) => {
                    const isDisabled = tempStartDate ? (() => {
                      const currentYear = new Date().getFullYear();
                      const startParts = tempStartDate.split('/');
                      const startDate = new Date(currentYear, parseInt(startParts[0]) - 1, parseInt(startParts[1]));
                      return date.dateObj < startDate;
                    })() : false;
                    
                    return (
                      <TouchableOpacity
                        key={date.value}
                        style={[
                          styles.datePickerItem,
                          tempEndDate === date.value && styles.datePickerItemSelected,
                          isDisabled && styles.datePickerItemDisabled
                        ]}
                        onPress={() => {
                          if (isDisabled) return;
                          setTempEndDate(date.value);
                          setEndDatePickerVisible(false);
                          setRangeError(null);
                        }}
                        disabled={isDisabled}
                      >
                        <Text style={[
                          styles.datePickerText,
                          tempEndDate === date.value && styles.datePickerTextSelected,
                          isDisabled && styles.datePickerTextDisabled
                        ]}>
                          {date.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

            <View style={styles.timeRangeSection}>
              <Text style={styles.timeRangeSectionTitle}>TIME RANGE</Text>
              <View style={styles.timeRangeRow}>
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeInputLabel}>START TIME</Text>
                  <Animated.View 
                    style={[
                      styles.timeDropdownButton,
                      startTimeScrollMode && styles.timeDropdownButtonActive,
                      {
                        borderColor: startTimeGlowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(255, 211, 61, 0.6)', 'rgba(255, 211, 61, 1)']
                        }),
                        backgroundColor: startTimeGlowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['#0A0A0A', '#101010']
                        })
                      }
                    ]}
                    {...startTimePanResponder.panHandlers}
                  >
                    <Text style={styles.timeDropdownText}>
                      {tempStartHour} : {tempStartMinute}
                    </Text>
                    <ChevronDown size={14} color="#FFFFFF" />
                    {startTimeScrollMode && (
                      <View style={styles.scrollTooltip}>
                        <Text style={styles.scrollTooltipText}>Scroll to adjust time</Text>
                      </View>
                    )}
                  </Animated.View>
                  
                  {startTimePickerVisible && (
                    <View style={styles.timePickerDropdown}>
                      {timeOptions.map((time) => (
                        <TouchableOpacity
                          key={`${time.hour}:${time.minute}`}
                          style={[
                            styles.timePickerItem,
                            tempStartHour === time.hour && tempStartMinute === time.minute && styles.timePickerItemSelected
                          ]}
                          onPress={() => {
                            setTempStartHour(time.hour);
                            setTempStartMinute(time.minute);
                            setStartTimePickerVisible(false);
                            setRangeError(null);
                          }}
                        >
                          <Text style={[
                            styles.timePickerText,
                            tempStartHour === time.hour && tempStartMinute === time.minute && styles.timePickerTextSelected
                          ]}>
                            {time.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
                
                <Text style={styles.timeRangeSeparator}>to</Text>
                
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeInputLabel}>END TIME</Text>
                  <Animated.View 
                    style={[
                      styles.timeDropdownButton,
                      endTimeScrollMode && styles.timeDropdownButtonActive,
                      {
                        borderColor: endTimeGlowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['rgba(255, 211, 61, 0.6)', 'rgba(255, 211, 61, 1)']
                        }),
                        backgroundColor: endTimeGlowAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['#0A0A0A', '#101010']
                        })
                      }
                    ]}
                    {...endTimePanResponder.panHandlers}
                  >
                    <Text style={styles.timeDropdownText}>
                      {tempEndHour} : {tempEndMinute}
                    </Text>
                    <ChevronDown size={14} color="#FFFFFF" />
                    {endTimeScrollMode && (
                      <View style={styles.scrollTooltip}>
                        <Text style={styles.scrollTooltipText}>Scroll to adjust time</Text>
                      </View>
                    )}
                  </Animated.View>
                  
                  {endTimePickerVisible && (
                    <View style={styles.timePickerDropdown}>
                      {timeOptions.map((time) => (
                        <TouchableOpacity
                          key={`${time.hour}:${time.minute}`}
                          style={[
                            styles.timePickerItem,
                            tempEndHour === time.hour && tempEndMinute === time.minute && styles.timePickerItemSelected
                          ]}
                          onPress={() => {
                            setTempEndHour(time.hour);
                            setTempEndMinute(time.minute);
                            setEndTimePickerVisible(false);
                            setRangeError(null);
                          }}
                        >
                          <Text style={[
                            styles.timePickerText,
                            tempEndHour === time.hour && tempEndMinute === time.minute && styles.timePickerTextSelected
                          ]}>
                            {time.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
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
                style={[
                  styles.applyButton,
                  (!tempStartDate || !tempEndDate) && styles.applyButtonDisabled
                ]}
                onPress={handleCustomRangeApply}
                disabled={!tempStartDate || !tempEndDate}
              >
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.modalFooterNote}>Filtered range applies to all watchlist news alerts.</Text>
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
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  pillActive: {
    backgroundColor: 'rgba(255, 211, 61, 0.8)',
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
    minWidth: 140,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },
  dropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  dropdownItemSelected: {
    backgroundColor: 'rgba(255, 211, 61, 0.8)',
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500' as const,
  },
  dropdownTextHover: {
    color: '#BBBBBB',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#1E1E1E',
    marginVertical: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.90)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#FFD33D',
    borderRadius: 6,
    padding: 20,
    width: '88%',
    maxWidth: 360,
    maxHeight: 520,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 16,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 4,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  modalSubtitle: {
    color: '#A0A0A0',
    fontSize: 10,
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
    fontSize: 11,
    fontWeight: '600' as const,
    marginBottom: 6,
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
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateDropdownText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  datePickerDropdown: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 5,
    marginTop: 6,
    maxHeight: 240,
    overflow: 'hidden',
  },
  datePickerItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  datePickerItemSelected: {
    backgroundColor: 'rgba(255, 211, 61, 0.2)',
  },
  datePickerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  datePickerTextSelected: {
    color: '#FFD33D',
    fontWeight: '600' as const,
  },
  datePickerItemDisabled: {
    opacity: 0.3,
  },
  datePickerTextDisabled: {
    color: '#555555',
  },
  timeRangeSection: {
    marginTop: 12,
    marginBottom: 16,
  },
  timeRangeSectionTitle: {
    color: '#A0A0A0',
    fontSize: 11,
    fontWeight: '600' as const,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  timeRangeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeInputContainer: {
    flex: 1,
  },
  timeInputLabel: {
    color: '#A0A0A0',
    fontSize: 10,
    fontWeight: '600' as const,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  timeDropdownButton: {
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: 'rgba(255, 211, 61, 0.6)',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 36,
    position: 'relative',
  },
  timeDropdownButtonActive: {
    shadowColor: '#FFD33D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  scrollTooltip: {
    position: 'absolute',
    top: -28,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255, 211, 61, 0.95)',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollTooltipText: {
    color: '#000000',
    fontSize: 9,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  timeDropdownText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500' as const,
    letterSpacing: 1,
  },
  timeRangeSeparator: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 24,
    paddingHorizontal: 4,
  },
  timePickerDropdown: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 5,
    marginTop: 6,
    maxHeight: 180,
    overflow: 'hidden',
  },
  timePickerItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    height: 32,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  timePickerItemSelected: {
    backgroundColor: 'rgba(255, 211, 61, 0.2)',
  },
  timePickerText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '500' as const,
  },
  timePickerTextSelected: {
    color: '#FFD33D',
    fontWeight: '600' as const,
  },
  applyButtonDisabled: {
    opacity: 0.4,
  },
  modalFooterNote: {
    color: '#777777',
    fontSize: 9,
    fontWeight: '500' as const,
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600' as const,
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#FFD33D',
    borderRadius: 5,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '700' as const,
  },
});
