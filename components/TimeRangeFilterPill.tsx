import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

export type TimeRange = 'last_hour' | 'today' | 'past_2_days' | 'past_5_days' | 'week_to_date' | 'custom';

export interface CustomTimeRange {
  startDate: string;
  startHour: string;
  startMinute: string;
  startPeriod: 'AM' | 'PM';
  endDate: string;
  endHour: string;
  endMinute: string;
  endPeriod: 'AM' | 'PM';
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
  const [tempStartHour, setTempStartHour] = useState(customRange?.startHour || '12');
  const [tempStartMinute, setTempStartMinute] = useState(customRange?.startMinute || '00');
  const [tempStartPeriod, setTempStartPeriod] = useState<'AM' | 'PM'>(customRange?.startPeriod || 'AM');
  const [tempEndHour, setTempEndHour] = useState(customRange?.endHour || '11');
  const [tempEndMinute, setTempEndMinute] = useState(customRange?.endMinute || '59');
  const [tempEndPeriod, setTempEndPeriod] = useState<'AM' | 'PM'>(customRange?.endPeriod || 'PM');
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [startTimePickerVisible, setStartTimePickerVisible] = useState(false);
  const [endTimePickerVisible, setEndTimePickerVisible] = useState(false);
  
  const startHourScrollRef = useRef<ScrollView>(null);
  const startMinuteScrollRef = useRef<ScrollView>(null);
  const startPeriodScrollRef = useRef<ScrollView>(null);
  const endHourScrollRef = useRef<ScrollView>(null);
  const endMinuteScrollRef = useRef<ScrollView>(null);
  const endPeriodScrollRef = useRef<ScrollView>(null);

  const HOURS = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const MINUTES = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
  const PERIODS = ['AM', 'PM'];
  const ITEM_HEIGHT = 36 as const;
  
  const scrollToIndex = (scrollRef: React.RefObject<ScrollView | null>, index: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: index * ITEM_HEIGHT, animated: true });
    }
  };
  
  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
    items: string[],
    setter: (value: string) => void
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    setter(items[clampedIndex]);
  };

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

  const convertTo24Hour = (hour: string, period: 'AM' | 'PM'): number => {
    let h = parseInt(hour);
    if (period === 'AM') {
      if (h === 12) return 0;
      return h;
    } else {
      if (h === 12) return 12;
      return h + 12;
    }
  };

  const timeToMinutes = (hour: string, minute: string, period: 'AM' | 'PM'): number => {
    const hour24 = convertTo24Hour(hour, period);
    return hour24 * 60 + parseInt(minute);
  };

  const openStartTimePicker = () => {
    setStartTimePickerVisible(true);
    setTimeout(() => {
      const hourIndex = HOURS.indexOf(tempStartHour);
      const minuteIndex = MINUTES.indexOf(tempStartMinute);
      const periodIndex = PERIODS.indexOf(tempStartPeriod);
      
      if (hourIndex >= 0) scrollToIndex(startHourScrollRef, hourIndex);
      if (minuteIndex >= 0) scrollToIndex(startMinuteScrollRef, minuteIndex);
      if (periodIndex >= 0) scrollToIndex(startPeriodScrollRef, periodIndex);
    }, 100);
  };
  
  const openEndTimePicker = () => {
    setEndTimePickerVisible(true);
    setTimeout(() => {
      const hourIndex = HOURS.indexOf(tempEndHour);
      const minuteIndex = MINUTES.indexOf(tempEndMinute);
      const periodIndex = PERIODS.indexOf(tempEndPeriod);
      
      if (hourIndex >= 0) scrollToIndex(endHourScrollRef, hourIndex);
      if (minuteIndex >= 0) scrollToIndex(endMinuteScrollRef, minuteIndex);
      if (periodIndex >= 0) scrollToIndex(endPeriodScrollRef, periodIndex);
    }, 100);
  };

  const past7Days = generatePast7Days();



  const getPillText = () => {
    if (selectedRange === 'custom' && customRange) {
      return `${customRange.startDate} ${customRange.startHour}:${customRange.startMinute} ${customRange.startPeriod} – ${customRange.endDate} ${customRange.endHour}:${customRange.endMinute} ${customRange.endPeriod}`;
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
    
    const startHour24 = convertTo24Hour(tempStartHour, tempStartPeriod);
    const endHour24 = convertTo24Hour(tempEndHour, tempEndPeriod);
    
    const startDateTime = new Date(
      currentYear, 
      parseInt(startParts[0]) - 1, 
      parseInt(startParts[1]), 
      startHour24, 
      parseInt(tempStartMinute)
    );
    const endDateTime = new Date(
      currentYear, 
      parseInt(endParts[0]) - 1, 
      parseInt(endParts[1]), 
      endHour24, 
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
      const startTimeInMinutes = timeToMinutes(tempStartHour, tempStartMinute, tempStartPeriod);
      const endTimeInMinutes = timeToMinutes(tempEndHour, tempEndMinute, tempEndPeriod);
      
      if (endTimeInMinutes <= startTimeInMinutes) {
        setRangeError('⚠️ End time must be later than start time.');
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
      startPeriod: tempStartPeriod,
      endDate: formatDateLabel(tempEndDate),
      endHour: tempEndHour,
      endMinute: tempEndMinute,
      endPeriod: tempEndPeriod,
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
                  <TouchableOpacity 
                    style={[
                      styles.timeInputBox,
                      startTimePickerVisible && styles.timeInputBoxFocused
                    ]}
                    onPress={openStartTimePicker}
                  >
                    <Text style={styles.timeDisplayText}>
                      {tempStartHour} : {tempStartMinute}
                    </Text>
                    <View style={[
                      styles.periodPillInline,
                      styles.periodPillActive
                    ]}>
                      <Text style={styles.periodPillTextActive}>{tempStartPeriod}</Text>
                    </View>
                    <ChevronDown size={14} color="rgba(255, 211, 61, 0.6)" style={styles.chevronIcon} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.timeRangeSeparator}>to</Text>
                
                <View style={styles.timeInputContainer}>
                  <Text style={styles.timeInputLabel}>END TIME</Text>
                  <TouchableOpacity 
                    style={[
                      styles.timeInputBox,
                      endTimePickerVisible && styles.timeInputBoxFocused
                    ]}
                    onPress={openEndTimePicker}
                  >
                    <Text style={styles.timeDisplayText}>
                      {tempEndHour} : {tempEndMinute}
                    </Text>
                    <View style={[
                      styles.periodPillInline,
                      styles.periodPillActive
                    ]}>
                      <Text style={styles.periodPillTextActive}>{tempEndPeriod}</Text>
                    </View>
                    <ChevronDown size={14} color="rgba(255, 211, 61, 0.6)" style={styles.chevronIcon} />
                  </TouchableOpacity>
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

      {/* Start Time Picker Wheel */}
      <Modal
        visible={startTimePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setStartTimePickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.wheelModalOverlay}
          activeOpacity={1}
          onPress={() => setStartTimePickerVisible(false)}
        >
          <View style={styles.wheelContainer}>
            <View style={styles.wheelHeader}>
              <Text style={styles.wheelTitle}>Select Start Time</Text>
            </View>
            <View style={styles.wheelContent}>
              <View style={styles.wheelHighlight} />
              <View style={styles.wheelColumns}>
                <ScrollView
                  ref={startHourScrollRef}
                  style={styles.wheelColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => handleScroll(e, HOURS, setTempStartHour)}
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {HOURS.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={styles.wheelItem}
                      onPress={() => {
                        setTempStartHour(hour);
                        scrollToIndex(startHourScrollRef, HOURS.indexOf(hour));
                      }}
                    >
                      <Text style={[
                        styles.wheelItemText,
                        tempStartHour === hour && styles.wheelItemTextActive
                      ]}>{hour}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <Text style={styles.wheelSeparator}>:</Text>
                
                <ScrollView
                  ref={startMinuteScrollRef}
                  style={styles.wheelColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => handleScroll(e, MINUTES, setTempStartMinute)}
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {MINUTES.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={styles.wheelItem}
                      onPress={() => {
                        setTempStartMinute(minute);
                        scrollToIndex(startMinuteScrollRef, MINUTES.indexOf(minute));
                      }}
                    >
                      <Text style={[
                        styles.wheelItemText,
                        tempStartMinute === minute && styles.wheelItemTextActive
                      ]}>{minute}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <ScrollView
                  ref={startPeriodScrollRef}
                  style={styles.wheelColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => handleScroll(e, PERIODS, (val) => setTempStartPeriod(val as 'AM' | 'PM'))}
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {PERIODS.map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={styles.wheelItem}
                      onPress={() => {
                        setTempStartPeriod(period as 'AM' | 'PM');
                        scrollToIndex(startPeriodScrollRef, PERIODS.indexOf(period));
                      }}
                    >
                      <Text style={[
                        styles.wheelItemText,
                        tempStartPeriod === period && styles.wheelItemTextActive
                      ]}>{period}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.wheelDoneButton}
              onPress={() => {
                setStartTimePickerVisible(false);
                setRangeError(null);
              }}
            >
              <Text style={styles.wheelDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* End Time Picker Wheel */}
      <Modal
        visible={endTimePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEndTimePickerVisible(false)}
      >
        <TouchableOpacity 
          style={styles.wheelModalOverlay}
          activeOpacity={1}
          onPress={() => setEndTimePickerVisible(false)}
        >
          <View style={styles.wheelContainer}>
            <View style={styles.wheelHeader}>
              <Text style={styles.wheelTitle}>Select End Time</Text>
            </View>
            <View style={styles.wheelContent}>
              <View style={styles.wheelHighlight} />
              <View style={styles.wheelColumns}>
                <ScrollView
                  ref={endHourScrollRef}
                  style={styles.wheelColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => handleScroll(e, HOURS, setTempEndHour)}
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {HOURS.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={styles.wheelItem}
                      onPress={() => {
                        setTempEndHour(hour);
                        scrollToIndex(endHourScrollRef, HOURS.indexOf(hour));
                      }}
                    >
                      <Text style={[
                        styles.wheelItemText,
                        tempEndHour === hour && styles.wheelItemTextActive
                      ]}>{hour}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <Text style={styles.wheelSeparator}>:</Text>
                
                <ScrollView
                  ref={endMinuteScrollRef}
                  style={styles.wheelColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => handleScroll(e, MINUTES, setTempEndMinute)}
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {MINUTES.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={styles.wheelItem}
                      onPress={() => {
                        setTempEndMinute(minute);
                        scrollToIndex(endMinuteScrollRef, MINUTES.indexOf(minute));
                      }}
                    >
                      <Text style={[
                        styles.wheelItemText,
                        tempEndMinute === minute && styles.wheelItemTextActive
                      ]}>{minute}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <ScrollView
                  ref={endPeriodScrollRef}
                  style={styles.wheelColumn}
                  showsVerticalScrollIndicator={false}
                  snapToInterval={ITEM_HEIGHT}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => handleScroll(e, PERIODS, (val) => setTempEndPeriod(val as 'AM' | 'PM'))}
                  contentContainerStyle={{ paddingVertical: ITEM_HEIGHT * 2 }}
                >
                  {PERIODS.map((period) => (
                    <TouchableOpacity
                      key={period}
                      style={styles.wheelItem}
                      onPress={() => {
                        setTempEndPeriod(period as 'AM' | 'PM');
                        scrollToIndex(endPeriodScrollRef, PERIODS.indexOf(period));
                      }}
                    >
                      <Text style={[
                        styles.wheelItemText,
                        tempEndPeriod === period && styles.wheelItemTextActive
                      ]}>{period}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.wheelDoneButton}
              onPress={() => {
                setEndTimePickerVisible(false);
                setRangeError(null);
              }}
            >
              <Text style={styles.wheelDoneText}>Done</Text>
            </TouchableOpacity>
          </View>
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
  timeInputBox: {
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: 'rgba(255, 211, 61, 0.4)',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  timeInputBoxFocused: {
    borderColor: 'rgba(255, 211, 61, 0.9)',
    shadowColor: '#FFD33D',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  timeDisplayText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 1,
  },
  periodPillInline: {
    backgroundColor: 'rgba(255, 211, 61, 0.8)',
    borderRadius: 8,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  periodPillActive: {
    backgroundColor: 'rgba(255, 211, 61, 0.8)',
  },
  periodPillTextActive: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  chevronIcon: {
    marginLeft: 4,
  },
  timeRangeSeparator: {
    color: '#777777',
    fontSize: 11,
    fontWeight: '500' as const,
    marginTop: 24,
    paddingHorizontal: 4,
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
  wheelModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'flex-end',
  },
  wheelContainer: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: '#FFD33D',
    paddingBottom: 20,
  },
  wheelHeader: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 211, 61, 0.3)',
  },
  wheelTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  wheelContent: {
    height: 180,
    position: 'relative',
  },
  wheelHighlight: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    height: 36,
    backgroundColor: 'rgba(255, 211, 61, 0.15)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 211, 61, 0.6)',
    zIndex: 1,
    pointerEvents: 'none',
  },
  wheelColumns: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    paddingHorizontal: 20,
  },
  wheelColumn: {
    flex: 1,
    maxWidth: 80,
  },
  wheelItem: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelItemText: {
    color: '#777777',
    fontSize: 18,
    fontWeight: '500' as const,
  },
  wheelItemTextActive: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700' as const,
  },
  wheelSeparator: {
    color: '#FFD33D',
    fontSize: 24,
    fontWeight: '700' as const,
    marginHorizontal: 8,
    marginTop: -8,
  },
  wheelDoneButton: {
    backgroundColor: '#FFD33D',
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  wheelDoneText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
});
