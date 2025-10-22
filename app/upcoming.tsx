import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Modal, Dimensions, Platform, Animated, PanResponder, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronDown, X } from 'lucide-react-native';
import { useDropdown } from '../store/dropdownStore';
import { theme } from '../constants/theme';
import { EarningsItem, EconItem } from '../types/news';
import { generateMockData } from '../utils/mockData';
import { useScrollReset } from '../utils/useScrollReset';
import { getEarningsSession, getSessionAriaLabel } from '../utils/newsUtils';
import UniversalBackButton from '../components/UniversalBackButton';

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

interface EventDetails {
  type: 'earnings' | 'econ';
  data: EarningsItem | EconItem;
  aiSummary: string;
  aiOverview: string;
  aiOpinion: string;
  aiForecast: string;
  impact: 'High' | 'Medium' | 'Low';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  confidence: number;
  relatedTickers: string[];
  source: string;
  timestamp: string;
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
    const session = getEarningsSession(earningsItem.report_time, earningsItem.scheduled_at);
    const sessionAriaLabel = getSessionAriaLabel(session);
    
    return (
      <TouchableOpacity style={styles.eventRow} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.timeColumn}>
          {session && (
            <View 
              style={styles.sessionChip}
              accessible={true}
              accessibilityLabel={sessionAriaLabel}
            >
              <Text style={styles.sessionChipText}>{session}</Text>
            </View>
          )}
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
  const { registerDropdown, shouldCloseDropdown } = useDropdown();
  const dropdownId = 'month-picker';
  const monthScrollRef = useRef<ScrollView>(null);
  const calendarScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (shouldCloseDropdown(dropdownId)) {
      setShowMonthPicker(false);
    }
  }, [shouldCloseDropdown, dropdownId, setShowMonthPicker]);

  useEffect(() => {
    registerDropdown(dropdownId, showMonthPicker);
  }, [showMonthPicker, registerDropdown, dropdownId]);
  
  useEffect(() => {
    if (showMonthPicker && monthScrollRef.current) {
      const selectedMonthIndex = monthOptions.findIndex(
        option => option.value === selectedMonth && option.year === selectedYear
      );
      
      if (selectedMonthIndex !== -1) {
        requestAnimationFrame(() => {
          const itemHeight = 56;
          const modalHeight = Dimensions.get('window').height * 0.6;
          const visibleHeight = Math.min(300, modalHeight - 100);
          const scrollY = Math.max(0, (selectedMonthIndex * itemHeight) - (visibleHeight / 2) + (itemHeight / 2));
          
          monthScrollRef.current?.scrollTo({
            y: scrollY,
            animated: false,
          });
        });
      }
    }
  }, [showMonthPicker, monthOptions, selectedMonth, selectedYear]);
  
  useEffect(() => {
    if (calendarDays.length > 0 && calendarScrollRef.current) {
      const selectedIndex = calendarDays.findIndex(
        day => day.date.toDateString() === selectedDate.toDateString()
      );
      
      if (selectedIndex !== -1) {
        setTimeout(() => {
          const dayWidth = 66;
          const screenWidth = Dimensions.get('window').width;
          const scrollX = Math.max(0, (selectedIndex * dayWidth) - (screenWidth / 2) + (dayWidth / 2));
          
          calendarScrollRef.current?.scrollTo({
            x: scrollX,
            animated: true,
          });
        }, 100);
      }
    }
  }, [selectedDate, calendarDays]);
  
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
        ref={calendarScrollRef}
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
            <ScrollView 
              ref={monthScrollRef} 
              style={styles.monthList}
              showsVerticalScrollIndicator={false}
            >
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
  const [eventOverlay, setEventOverlay] = useState<{ visible: boolean; details: EventDetails | null; loading: boolean }>({ visible: false, details: null, loading: false });
  const currentScrollYRef = useRef<number>(0);
  const [translateY] = useState(new Animated.Value(Dimensions.get('window').height));

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

  const handleEventPress = async (item: EarningsItem | EconItem, type: 'earnings' | 'econ') => {
    setEventOverlay({ visible: true, details: null, loading: true });
    
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
    
    const details = await generateEventDetails(item, type);
    setEventOverlay({ visible: true, details, loading: false });
  };

  const generateEventDetails = async (
    data: EarningsItem | EconItem,
    type: 'earnings' | 'econ'
  ): Promise<EventDetails> => {
    if (type === 'earnings') {
      const earningsData = data as EarningsItem;
      
      const hasActuals = earningsData.actual_eps !== null && earningsData.actual_eps !== undefined;
      let sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
      let impact: 'High' | 'Medium' | 'Low' = 'Medium';
      let confidence = 50;
      
      if (hasActuals && earningsData.verdict) {
        if (earningsData.verdict === 'Beat') {
          sentiment = 'Bullish';
          impact = 'High';
          confidence = 78;
        } else if (earningsData.verdict === 'Miss') {
          sentiment = 'Bearish';
          impact = 'High';
          confidence = 72;
        } else {
          confidence = 55;
        }
      } else {
        confidence = 60;
      }
      
      const summary = hasActuals 
        ? `${earningsData.ticker} reported ${earningsData.verdict?.toLowerCase() || 'results'} with EPS of ${earningsData.actual_eps?.toFixed(2)} vs expected ${earningsData.cons_eps?.toFixed(2)}.`
        : `${earningsData.ticker} is scheduled to report earnings ${earningsData.report_time} with expected EPS of ${earningsData.cons_eps?.toFixed(2)}.`;
      
      const overview = hasActuals
        ? `${earningsData.ticker} reported ${earningsData.report_time} earnings with actual EPS of ${earningsData.actual_eps?.toFixed(2)} compared to consensus of ${earningsData.cons_eps?.toFixed(2)}. Revenue came in at ${earningsData.actual_rev?.toFixed(1)}B versus expectations of ${earningsData.cons_rev?.toFixed(1)}B. The company ${earningsData.verdict?.toLowerCase() || 'met'} analyst expectations.`
        : `${earningsData.ticker} is scheduled to report earnings ${earningsData.report_time}. Analysts expect EPS of ${earningsData.cons_eps?.toFixed(2)} and revenue of ${earningsData.cons_rev?.toFixed(1)}B. This earnings report will provide insights into the company's recent performance and future guidance.`;
      
      const opinion = `${sentiment} ${confidence}%`;
      
      const forecast = hasActuals
        ? sentiment === 'Bullish'
          ? 'Likely positive market reaction in next 24-48 hours.'
          : sentiment === 'Bearish'
          ? 'Likely negative market reaction in next 24-48 hours.'
          : 'Likely stable market reaction in next 24-48 hours.'
        : 'Likely moderate market volatility around earnings release.';
      
      return {
        type: 'earnings',
        data,
        aiSummary: summary,
        aiOverview: overview,
        aiOpinion: opinion,
        aiForecast: forecast,
        impact,
        sentiment,
        confidence,
        relatedTickers: [earningsData.ticker],
        source: 'Company Filing',
        timestamp: earningsData.scheduled_at,
      };
    } else {
      const econData = data as EconItem;
      const hasActual = econData.actual !== null && econData.actual !== undefined;
      
      let sentiment: 'Bullish' | 'Bearish' | 'Neutral' = 'Neutral';
      let confidence = 50;
      
      if (hasActual && econData.forecast !== null && econData.forecast !== undefined) {
        if (econData.actual! > econData.forecast) {
          sentiment = econData.name.toLowerCase().includes('unemployment') ? 'Bearish' : 'Bullish';
          confidence = 72;
        } else if (econData.actual! < econData.forecast) {
          sentiment = econData.name.toLowerCase().includes('unemployment') ? 'Bullish' : 'Bearish';
          confidence = 68;
        } else {
          confidence = 55;
        }
      } else {
        confidence = 60;
      }
      
      const summary = hasActual
        ? `${econData.name} came in at ${econData.actual?.toFixed(1)}% vs forecast of ${econData.forecast?.toFixed(1)}%.`
        : `${econData.name} is expected to be released with a forecast of ${econData.forecast?.toFixed(1)}%.`;
      
      const overview = hasActual
        ? `The ${econData.name} for ${econData.country} was released showing ${econData.actual?.toFixed(1)}% compared to the forecasted ${econData.forecast?.toFixed(1)}% and previous reading of ${econData.previous?.toFixed(1)}%. This ${econData.impact.toLowerCase()}-impact indicator provides insights into economic conditions.`
        : `The ${econData.name} for ${econData.country} is scheduled for release. Economists forecast ${econData.forecast?.toFixed(1)}% compared to the previous ${econData.previous?.toFixed(1)}%. This ${econData.impact.toLowerCase()}-impact indicator is closely watched by market participants.`;
      
      const opinion = `${sentiment} ${confidence}%`;
      
      const forecast = hasActual
        ? 'Likely moderate market volatility in next 24-48 hours.'
        : 'Likely increased market volatility around data release.';
      
      return {
        type: 'econ',
        data,
        aiSummary: summary,
        aiOverview: overview,
        aiOpinion: opinion,
        aiForecast: forecast,
        impact: econData.impact,
        sentiment,
        confidence,
        relatedTickers: ['SPY', 'QQQ', 'DXY'],
        source: 'Economic Calendar',
        timestamp: econData.scheduled_at,
      };
    }
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => {
      return Math.abs(gestureState.dy) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 150 || gestureState.vy > 0.5) {
        handleCloseOverlay();
      } else {
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }).start();
      }
    },
  });

  const handleCloseOverlay = () => {
    Animated.timing(translateY, {
      toValue: Dimensions.get('window').height,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setEventOverlay({ visible: false, details: null, loading: false });
      translateY.setValue(Dimensions.get('window').height);
      
      requestAnimationFrame(() => {
        scrollViewRef.current?.scrollTo?.({ y: currentScrollYRef.current, animated: false });
      });
    });
  };

  const handleTickerPressFromOverlay = (ticker: string) => {
    handleCloseOverlay();
    setTimeout(() => {
      router.push(`/company/${ticker}`);
    }, 350);
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return timeString;
    }
  };

  const headerHeight = Platform.select({ web: 64, default: 56 });

  return (
    <View style={[styles.container, { paddingTop: insets.top + headerHeight }]}>
      <UniversalBackButton />
      
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
        onScroll={(e) => {
          currentScrollYRef.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        pointerEvents={eventOverlay.visible ? 'none' : 'auto'}
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
      
      {eventOverlay.visible && (
        <Modal visible transparent animationType="none" onRequestClose={handleCloseOverlay} statusBarTranslucent>
          <View style={overlayStyles.modalOverlay}>
            <TouchableOpacity 
              style={overlayStyles.backdrop} 
              activeOpacity={1} 
              onPress={handleCloseOverlay}
            />
            
            <Animated.View
              style={[
                overlayStyles.modalContent,
                { transform: [{ translateY }] },
              ]}
            >
              {eventOverlay.loading || !eventOverlay.details ? (
                <View style={overlayStyles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FFD75A" />
                  <Text style={overlayStyles.loadingText}>Loading event details...</Text>
                </View>
              ) : (
                <ScrollView 
                  style={overlayStyles.scrollView} 
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  {...panResponder.panHandlers}
                >
                  <View style={overlayStyles.contentContainer}>
                    <View style={overlayStyles.header}>
                      <View style={overlayStyles.headerContent}>
                        <Text style={overlayStyles.title}>
                          {eventOverlay.details.type === 'earnings' 
                            ? `${(eventOverlay.details.data as EarningsItem).ticker} Earnings Report` 
                            : (eventOverlay.details.data as EconItem).name}
                        </Text>
                        <TouchableOpacity style={overlayStyles.closeButton} onPress={handleCloseOverlay}>
                          <X size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                      <Text style={overlayStyles.sourceText}>
                        {eventOverlay.details.source} • {formatTime(eventOverlay.details.timestamp)}
                      </Text>
                    </View>

                    <View style={overlayStyles.divider} />

                    <View style={overlayStyles.aiSection}>
                      <Text style={overlayStyles.sectionTitle}>AI SUMMARY</Text>
                      <Text style={overlayStyles.aiText}>{eventOverlay.details.aiSummary}</Text>
                    </View>

                    <View style={overlayStyles.aiSection}>
                      <Text style={overlayStyles.sectionTitle}>AI OVERVIEW</Text>
                      <Text style={overlayStyles.aiText}>{eventOverlay.details.aiOverview}</Text>
                    </View>

                    <View style={overlayStyles.aiSection}>
                      <Text style={overlayStyles.sectionTitle}>AI OPINION</Text>
                      <View style={overlayStyles.opinionRow}>
                        <Text style={overlayStyles.opinionDash}>—</Text>
                        <Text style={overlayStyles.opinionLabel}>({eventOverlay.details.impact})</Text>
                        <Text style={overlayStyles.opinionSentiment}>
                          {eventOverlay.details.sentiment} {eventOverlay.details.confidence}%
                        </Text>
                      </View>
                      <Text style={overlayStyles.opinionDescription}>
                        {eventOverlay.details.sentiment === 'Bullish' ? 'Market likely to respond positively with increased buying pressure.' :
                         eventOverlay.details.sentiment === 'Bearish' ? 'Market likely to respond negatively with increased selling pressure.' :
                         'Market expected to remain stable with balanced sentiment.'}
                      </Text>
                    </View>

                    <View style={overlayStyles.aiSection}>
                      <Text style={overlayStyles.sectionTitle}>AI FORECAST</Text>
                      <Text style={overlayStyles.aiText}>{eventOverlay.details.aiForecast}</Text>
                    </View>

                    <View style={overlayStyles.divider} />
                    <View style={overlayStyles.aiSection}>
                      <Text style={overlayStyles.sectionTitle}>KEY METRICS</Text>
                      {eventOverlay.details.type === 'earnings' ? (
                        <View style={overlayStyles.metricsGrid}>
                          {(eventOverlay.details.data as EarningsItem).actual_eps !== null && (eventOverlay.details.data as EarningsItem).actual_eps !== undefined ? (
                            <>
                              <View style={overlayStyles.metricItem}>
                                <Text style={overlayStyles.metricLabel}>Actual EPS</Text>
                                <Text style={overlayStyles.metricValue}>${(eventOverlay.details.data as EarningsItem).actual_eps?.toFixed(2)}</Text>
                              </View>
                              <View style={overlayStyles.metricItem}>
                                <Text style={overlayStyles.metricLabel}>Expected EPS</Text>
                                <Text style={overlayStyles.metricValue}>${(eventOverlay.details.data as EarningsItem).cons_eps?.toFixed(2)}</Text>
                              </View>
                              <View style={overlayStyles.metricItem}>
                                <Text style={overlayStyles.metricLabel}>Actual Revenue</Text>
                                <Text style={overlayStyles.metricValue}>${(eventOverlay.details.data as EarningsItem).actual_rev?.toFixed(1)}B</Text>
                              </View>
                              <View style={overlayStyles.metricItem}>
                                <Text style={overlayStyles.metricLabel}>Expected Revenue</Text>
                                <Text style={overlayStyles.metricValue}>${(eventOverlay.details.data as EarningsItem).cons_rev?.toFixed(1)}B</Text>
                              </View>
                            </>
                          ) : (
                            <>
                              <View style={overlayStyles.metricItem}>
                                <Text style={overlayStyles.metricLabel}>Expected EPS</Text>
                                <Text style={overlayStyles.metricValue}>${(eventOverlay.details.data as EarningsItem).cons_eps?.toFixed(2)}</Text>
                              </View>
                              <View style={overlayStyles.metricItem}>
                                <Text style={overlayStyles.metricLabel}>Expected Revenue</Text>
                                <Text style={overlayStyles.metricValue}>${(eventOverlay.details.data as EarningsItem).cons_rev?.toFixed(1)}B</Text>
                              </View>
                            </>
                          )}
                        </View>
                      ) : (
                        <View style={overlayStyles.metricsGrid}>
                          <View style={overlayStyles.metricItem}>
                            <Text style={overlayStyles.metricLabel}>Forecast</Text>
                            <Text style={overlayStyles.metricValue}>{(eventOverlay.details.data as EconItem).forecast?.toFixed(1)}%</Text>
                          </View>
                          <View style={overlayStyles.metricItem}>
                            <Text style={overlayStyles.metricLabel}>Previous</Text>
                            <Text style={overlayStyles.metricValue}>{(eventOverlay.details.data as EconItem).previous?.toFixed(1)}%</Text>
                          </View>
                          {(eventOverlay.details.data as EconItem).actual !== null && (eventOverlay.details.data as EconItem).actual !== undefined && (
                            <View style={overlayStyles.metricItem}>
                              <Text style={overlayStyles.metricLabel}>Actual</Text>
                              <Text style={overlayStyles.metricValue}>{(eventOverlay.details.data as EconItem).actual?.toFixed(1)}%</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>

                    <View style={overlayStyles.divider} />

                    <View style={overlayStyles.tickersSection}>
                      <Text style={overlayStyles.sectionTitle}>RELATED TICKERS</Text>
                      <View style={overlayStyles.tickersRow}>
                        {eventOverlay.details.relatedTickers.map((ticker, index) => (
                          <TouchableOpacity
                            key={index}
                            style={overlayStyles.tickerPill}
                            onPress={() => handleTickerPressFromOverlay(ticker)}
                            activeOpacity={0.6}
                          >
                            <Text style={overlayStyles.tickerText}>{ticker}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={overlayStyles.footer}>
                      <Text style={overlayStyles.footerText}>
                        AI summaries are <Text style={overlayStyles.footerUnderline}>generated for convenience</Text>. Not financial advice.
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    paddingTop: 37,
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
  sessionChip: {
    backgroundColor: theme.colors.border,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  sessionChipText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.text,
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

const overlayStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFD75A',
    borderLeftWidth: 0,
    borderRightWidth: 0,
    height: Dimensions.get('window').height * 0.92,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    lineHeight: 30,
    flex: 1,
    paddingRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  sourceText: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: '#FFD75A',
    marginVertical: 16,
  },
  aiSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700' as const,
    color: '#FFD75A',
    marginBottom: 8,
    letterSpacing: 0.8,
    textTransform: 'uppercase' as const,
  },
  aiText: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  opinionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  opinionDash: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400' as const,
  },
  opinionLabel: {
    fontSize: 13,
    color: '#888888',
    fontWeight: '400' as const,
  },
  opinionSentiment: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#FFD75A',
  },
  opinionDescription: {
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  metricsGrid: {
    gap: 12,
  },
  metricItem: {
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  tickersSection: {
    marginBottom: 16,
  },
  tickersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tickerPill: {
    backgroundColor: '#FFD75A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tickerText: {
    fontSize: 13,
    fontWeight: '700' as const,
    color: '#000000',
    textTransform: 'uppercase' as const,
  },
  footer: {
    marginTop: 24,
    paddingTop: 16,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(136, 136, 136, 0.8)',
    textAlign: 'center',
    lineHeight: 16,
  },
  footerUnderline: {
    textDecorationLine: 'underline',
    color: '#FFD75A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 13,
    color: '#888888',
  },
});