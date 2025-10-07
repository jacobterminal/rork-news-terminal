import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronDown } from 'lucide-react-native';
import { theme } from '../constants/theme';
import { EarningsItem, EconItem } from '../types/news';
import AlertSearchBar from '../components/AlertSearchBar';
import { generateMockData } from '../utils/mockData';
import { useScrollReset } from '../utils/useScrollReset';

interface CalendarDay {
  date: Date;
  isToday: boolean;
  eventCount: number;
}

interface MonthOption {
  value: number;
  label: string;
  year: number;
}

interface EventItemProps {
  item: EarningsItem | EconItem;
  type: 'earnings' | 'econ';
  onPress: () => void;
}

function EventItem({ item, type, onPress }: EventItemProps) {
  const scheduledTime = new Date(item.scheduled_at);
  const timeString = scheduledTime.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
  
  if (type === 'earnings') {
    const earningsItem = item as EarningsItem;
    const isReleased = !!earningsItem.actual_eps;
    
    return (
      <TouchableOpacity style={styles.eventRow} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.timeColumn}>
          <Text style={styles.eventTime}>{timeString}</Text>
          <Text style={styles.reportTime}>{earningsItem.report_time}</Text>
        </View>
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <View style={styles.tickerChip}>
              <Text style={styles.tickerText}>{earningsItem.ticker}</Text>
            </View>
            {earningsItem.verdict && (
              <View style={[styles.verdictBadge, { 
                backgroundColor: earningsItem.verdict === 'Beat' ? theme.colors.bullish : 
                                earningsItem.verdict === 'Miss' ? theme.colors.bearish : theme.colors.textDim 
              }]}>
                <Text style={[styles.badgeText, {
                  color: earningsItem.verdict === 'Beat' ? '#000000' : theme.colors.text
                }]}>{earningsItem.verdict.toUpperCase()}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.estimatesRow}>
            <Text style={styles.estimateText}>
              EPS: {isReleased ? (
                `${earningsItem.cons_eps?.toFixed(2)} (est) → ${earningsItem.actual_eps?.toFixed(2)} (${earningsItem.verdict === 'Beat' ? 'Beat' : earningsItem.verdict === 'Miss' ? 'Miss' : 'Inline'})`
              ) : (
                `${earningsItem.cons_eps?.toFixed(2)} (est)`
              )}
            </Text>
            <Text style={styles.estimateText}>
              Rev: {isReleased ? (
                `${earningsItem.cons_rev?.toFixed(1)}B (est) → ${earningsItem.actual_rev?.toFixed(1)}B`
              ) : (
                `${earningsItem.cons_rev?.toFixed(1)}B (est)`
              )}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  } else {
    const econItem = item as EconItem;
    const isReleased = econItem.actual !== null && econItem.actual !== undefined;
    
    const getImpactColor = () => {
      switch (econItem.impact) {
        case 'High': return '#FF1744';
        case 'Medium': return '#FF8C00';
        case 'Low': return '#6C757D';
        default: return theme.colors.textDim;
      }
    };
    
    return (
      <TouchableOpacity style={styles.eventRow} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.timeColumn}>
          <Text style={styles.eventTime}>{timeString}</Text>
          <Text style={styles.countryText}>{econItem.country} – USD</Text>
        </View>
        
        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            <Text style={styles.econTitle}>{econItem.name}</Text>
            <View style={[styles.impactBadge, { backgroundColor: getImpactColor() }]}>
              <Text style={styles.badgeText}>{econItem.impact.toUpperCase()}</Text>
            </View>
          </View>
          
          <View style={styles.econDataRow}>
            <Text style={styles.econDataText}>
              Forecast: {econItem.forecast?.toFixed(1) || 'N/A'}%
            </Text>
            <Text style={styles.econDataText}>
              Previous: {econItem.previous?.toFixed(1) || 'N/A'}%
            </Text>
            {isReleased && (
              <Text style={[styles.econDataText, { color: theme.colors.bullish, fontWeight: '600' }]}>
                Actual: {econItem.actual?.toFixed(1)}% {econItem.actual && econItem.forecast && econItem.actual > econItem.forecast ? '(Better)' : econItem.actual && econItem.forecast && econItem.actual < econItem.forecast ? '(Worse)' : '(Inline)'}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
}

function CalendarStrip({ selectedDate, onDateSelect, calendarDays, selectedMonth, selectedYear, onMonthSelect, monthOptions, showMonthPicker, setShowMonthPicker }: {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  calendarDays: CalendarDay[];
  selectedMonth: number;
  selectedYear: number;
  onMonthSelect: (month: number, year: number) => void;
  monthOptions: MonthOption[];
  showMonthPicker: boolean;
  setShowMonthPicker: (show: boolean) => void;
}) {
  const monthScrollRef = useRef<ScrollView>(null);
  
  useEffect(() => {
    if (showMonthPicker && monthScrollRef.current) {
      const selectedMonthIndex = monthOptions.findIndex(
        option => option.value === selectedMonth && option.year === selectedYear
      );
      
      if (selectedMonthIndex !== -1) {
        setTimeout(() => {
          const itemHeight = 56;
          const modalHeight = 300;
          const scrollY = (selectedMonthIndex * itemHeight) - (modalHeight / 2) + (itemHeight / 2);
          
          monthScrollRef.current?.scrollTo({
            y: Math.max(0, scrollY),
            animated: true,
          });
        }, 100);
      }
    }
  }, [showMonthPicker, monthOptions, selectedMonth, selectedYear]);
  
  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <TouchableOpacity 
          style={styles.monthSelector}
          onPress={() => setShowMonthPicker(true)}
        >
          <Text style={styles.monthText}>
            {new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </Text>
          <ChevronDown size={16} color={theme.colors.textDim} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.calendarStrip}
      >
        {calendarDays.map((day, index) => {
          const isSelected = day.date.toDateString() === selectedDate.toDateString();
          
          return (
            <TouchableOpacity
              key={day.date.toDateString()}
              style={[styles.calendarDay, isSelected && styles.selectedDay, day.isToday && styles.todayDay]}
              onPress={() => onDateSelect(day.date)}
            >
              <Text style={[styles.dayText, isSelected && styles.selectedDayText]}>
                {day.date.getDate()}
              </Text>
              <Text style={[styles.weekdayText, isSelected && styles.selectedWeekdayText]}>
                {day.date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
              </Text>
              {day.eventCount > 0 && (
                <View style={styles.eventDot}>
                  <Text style={styles.eventCount}>{day.eventCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMonthPicker(false)}
        >
          <View style={styles.monthPickerModal}>
            <Text style={styles.modalTitle}>Select Month</Text>
            <ScrollView ref={monthScrollRef} style={styles.monthList}>
              {monthOptions.map((month) => {
                const currentDate = new Date();
                const currentMonth = currentDate.getMonth();
                const currentYear = currentDate.getFullYear();
                const monthDate = new Date(month.year, month.value, 1);
                const currentMonthDate = new Date(currentYear, currentMonth, 1);
                
                const isCurrentMonth = month.value === currentMonth && month.year === currentYear;
                const isPastMonth = monthDate < currentMonthDate;
                const isFutureMonth = monthDate > currentMonthDate;
                const isSelected = selectedMonth === month.value && selectedYear === month.year;
                
                return (
                  <TouchableOpacity
                    key={`${month.year}-${month.value}`}
                    style={[styles.monthOption, isSelected && styles.selectedMonthOption]}
                    onPress={() => {
                      onMonthSelect(month.value, month.year);
                      setShowMonthPicker(false);
                    }}
                  >
                    <Text style={[
                      styles.monthOptionText,
                      isCurrentMonth && styles.currentMonthText,
                      isPastMonth && styles.pastMonthText,
                      isFutureMonth && styles.futureMonthText
                    ]}>
                      {month.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default function UpcomingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollViewRef = useScrollReset();
  const [earnings, setEarnings] = useState<EarningsItem[]>([]);
  const [econ, setEcon] = useState<EconItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showMonthPicker, setShowMonthPicker] = useState<boolean>(false);
  const [monthOptions, setMonthOptions] = useState<MonthOption[]>([]);
  const [feedItems, setFeedItems] = useState<any[]>([]);

  useEffect(() => {
    const mockData = generateMockData();
    setEarnings(mockData.earnings);
    setEcon(mockData.econ);
    setFeedItems(mockData.feedItems);
    
    // Generate month options (current month ± 12 months for better historical access)
    const currentDate = new Date();
    const options: MonthOption[] = [];
    
    for (let i = -12; i <= 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 1);
      options.push({
        value: date.getMonth(),
        label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        year: date.getFullYear()
      });
    }
    
    setMonthOptions(options);
    generateCalendarDays(selectedMonth, selectedYear, mockData);
  }, [selectedMonth, selectedYear]);
  
  useEffect(() => {
    const mockData = { earnings, econ };
    generateCalendarDays(selectedMonth, selectedYear, mockData);
  }, [selectedMonth, selectedYear, earnings, econ]);
  
  const generateCalendarDays = (month: number, year: number, mockData: { earnings: EarningsItem[], econ: EconItem[] }) => {
    // Validate inputs
    if (typeof month !== 'number' || month < 0 || month > 11) return;
    if (typeof year !== 'number' || year < 1900 || year > 2100) return;
    
    const today = new Date();
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];
    
    // Generate all days in the selected month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      
      // Count events for this day
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      const earningsCount = mockData.earnings.filter(e => {
        const eventDate = new Date(e.scheduled_at);
        return eventDate >= dayStart && eventDate <= dayEnd;
      }).length;
      
      const econCount = mockData.econ.filter(e => {
        const eventDate = new Date(e.scheduled_at);
        return eventDate >= dayStart && eventDate <= dayEnd;
      }).length;
      
      days.push({
        date,
        isToday: date.toDateString() === today.toDateString(),
        eventCount: earningsCount + econCount
      });
    }
    
    setCalendarDays(days);
  };
  
  const handleMonthSelect = (month: number, year: number) => {
    // Validate inputs
    if (typeof month !== 'number' || month < 0 || month > 11) return;
    if (typeof year !== 'number' || year < 1900 || year > 2100) return;
    
    setSelectedMonth(month);
    setSelectedYear(year);
    // Set selected date to first day of new month
    setSelectedDate(new Date(year, month, 1));
  };
  
  // Filter events for selected date
  const selectedDateStart = new Date(selectedDate);
  selectedDateStart.setHours(0, 0, 0, 0);
  const selectedDateEnd = new Date(selectedDate);
  selectedDateEnd.setHours(23, 59, 59, 999);
  
  const dayEarnings = earnings.filter(e => {
    const eventDate = new Date(e.scheduled_at);
    return eventDate >= selectedDateStart && eventDate <= selectedDateEnd;
  }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  
  const dayEcon = econ.filter(e => {
    const eventDate = new Date(e.scheduled_at);
    return eventDate >= selectedDateStart && eventDate <= selectedDateEnd;
  }).sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());

  const handleTickerPress = (ticker: string) => {
    console.log('Ticker pressed:', ticker);
  };

  const handleEventPress = (item: EarningsItem | EconItem, type: 'earnings' | 'econ') => {
    const eventId = type === 'earnings' ? (item as EarningsItem).ticker : (item as EconItem).id;
    router.push({
      pathname: '/event/[id]',
      params: { id: eventId, type },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Reserved space for drop banners and search */}
      <View style={styles.reservedSpace}>
        <AlertSearchBar 
          onTickerPress={handleTickerPress}
          feedItems={feedItems}
        />
      </View>
      
      <View nativeID="banner-anchor-point">
        <CalendarStrip 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          calendarDays={calendarDays}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthSelect={handleMonthSelect}
          monthOptions={monthOptions}
          showMonthPicker={showMonthPicker}
          setShowMonthPicker={setShowMonthPicker}
        />
      </View>
      
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {dayEcon.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Economic Events</Text>
              <View style={styles.sectionDivider} />
            </View>
            {dayEcon.map((item) => (
              <EventItem 
                key={item.id} 
                item={item} 
                type="econ" 
                onPress={() => handleEventPress(item, 'econ')}
              />
            ))}
          </View>
        )}
        
        {dayEarnings.length > 0 && (
          <View style={[styles.section, dayEcon.length > 0 && styles.sectionWithSpacing]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Earnings Reports</Text>
              <View style={styles.sectionDivider} />
            </View>
            {dayEarnings.map((item) => (
              <EventItem 
                key={item.ticker} 
                item={item} 
                type="earnings" 
                onPress={() => handleEventPress(item, 'earnings')}
              />
            ))}
          </View>
        )}
        
        {dayEcon.length === 0 && dayEarnings.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {selectedDate < new Date(new Date().getFullYear(), new Date().getMonth(), 1) 
                ? "No events recorded for this month." 
                : "No events scheduled for this day"}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  reservedSpace: {
    height: 50,
    backgroundColor: theme.colors.bg,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
  },
  calendarContainer: {
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  calendarStrip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  calendarDay: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: 8,
    minWidth: 50,
    position: 'relative',
  },
  selectedDay: {
    backgroundColor: theme.colors.border,
  },
  todayDay: {
    borderWidth: 1,
    borderColor: theme.colors.bullish,
  },
  dayText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  selectedDayText: {
    color: theme.colors.text,
  },
  weekdayText: {
    fontSize: 10,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  selectedWeekdayText: {
    color: theme.colors.textDim,
  },
  eventDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.neutral,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCount: {
    fontSize: 10,
    fontWeight: 'bold',
    color: theme.colors.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.md,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionWithSpacing: {
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  sectionDivider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
    marginLeft: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  eventRow: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  timeColumn: {
    width: 80,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  eventTime: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: 'monospace',
  },
  reportTime: {
    fontSize: 10,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  countryText: {
    fontSize: 10,
    color: theme.colors.textDim,
    marginTop: 2,
  },
  eventContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  tickerChip: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  tickerText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  econTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  verdictBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  impactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: theme.colors.text,
  },
  estimatesRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  estimateText: {
    fontSize: 12,
    color: theme.colors.textDim,
  },
  econDataRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    flexWrap: 'wrap',
  },
  econDataText: {
    fontSize: 12,
    color: theme.colors.textDim,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textDim,
  },
  calendarHeader: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xs,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.border,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthPickerModal: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: theme.spacing.lg,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  monthList: {
    maxHeight: 300,
  },
  monthOption: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: 8,
    marginBottom: theme.spacing.xs,
  },
  selectedMonthOption: {
    backgroundColor: theme.colors.border,
  },
  monthOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  currentMonthText: {
    color: theme.colors.bullish,
  },
  pastMonthText: {
    color: theme.colors.textSecondary,
  },
  futureMonthText: {
    color: theme.colors.text,
  },
});