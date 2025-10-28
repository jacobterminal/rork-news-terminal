import React, { useEffect, useMemo, useRef } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';

const GOLD = '#FFD75A';
const ROW_H = 52;

type Props = {
  visible: boolean;
  months: { label: string; value: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onRequestClose: () => void;
};

export default function MonthPickerSheet({
  visible,
  months,
  selectedValue,
  onSelect,
  onRequestClose,
}: Props) {
  const listRef = useRef<FlatList>(null);
  const selectedIndex = useMemo(
    () => Math.max(0, months.findIndex(m => m.value === selectedValue)),
    [months, selectedValue]
  );

  const getItemLayout = (_: any, index: number) => ({
    length: ROW_H,
    offset: ROW_H * index,
    index,
  });

  useEffect(() => {
    if (visible && listRef.current && selectedIndex >= 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({
          index: selectedIndex,
          viewPosition: 0.5,
          animated: false,
        });
      });
    }
  }, [visible, selectedIndex]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <Pressable
        onPress={onRequestClose}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}
      >
        <View style={{ backgroundColor: '#111', borderRadius: 16, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 8 }}>
            Select Month
          </Text>
          <FlatList
            ref={listRef}
            data={months}
            keyExtractor={(item) => item.value}
            getItemLayout={getItemLayout}
            initialScrollIndex={selectedIndex > -1 ? selectedIndex : undefined}
            renderItem={({ item, index }) => {
              const selected = index === selectedIndex;
              return (
                <Pressable
                  onPress={() => onSelect(item.value)}
                  style={{
                    height: ROW_H,
                    justifyContent: 'center',
                    paddingHorizontal: 16,
                  }}
                >
                  <Text
                    style={{
                      color: selected ? GOLD : '#E5E7EB',
                      fontSize: 18,
                      fontWeight: selected ? '800' : '600',
                    }}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            }}
          />
        </View>
      </Pressable>
    </Modal>
  );
}
